import { irDocument, type IrDocument, type IrNode } from "./schema.ts";

export const IR_LIMITS = { maxNodes: 10_000, maxDepth: 64 } as const;

export type IrIssue = { path: PropertyKey[]; message: string };
export type IrParseResult =
  | { success: true; data: IrDocument }
  | { success: false; issues: IrIssue[] };

type Pending = { value: unknown; path: PropertyKey[]; depth: number };

function childrenOf(value: unknown): unknown[] {
  if (typeof value !== "object" || value === null) return [];
  const children = (value as { children?: unknown }).children;
  return Array.isArray(children) ? children : [];
}

/**
 * Bounds the tree before zod walks it: zod recurses per level, so a hostile document
 * could otherwise exhaust the stack or the time budget.
 */
function checkSize(input: unknown): IrIssue | undefined {
  const nodes = (input as { nodes?: unknown } | null)?.nodes;
  if (!Array.isArray(nodes)) return undefined;
  const stack: Pending[] = nodes.map((value, index) => ({
    value,
    path: ["nodes", index],
    depth: 1,
  }));
  let seen = 0;
  while (stack.length > 0) {
    const { value, path, depth } = stack.pop()!;
    seen += 1;
    if (seen > IR_LIMITS.maxNodes) {
      return { path: [], message: `More than ${String(IR_LIMITS.maxNodes)} nodes` };
    }
    if (depth > IR_LIMITS.maxDepth) {
      return { path, message: `Nesting deeper than ${String(IR_LIMITS.maxDepth)} levels` };
    }
    childrenOf(value).forEach((child, index) => {
      stack.push({ value: child, path: [...path, "children", index], depth: depth + 1 });
    });
  }
  return undefined;
}

function walk(
  nodes: IrNode[],
  path: PropertyKey[],
  visit: (node: IrNode, path: PropertyKey[]) => void,
) {
  nodes.forEach((node, index) => {
    const nodePath = [...path, index];
    visit(node, nodePath);
    if (node.kind === "board" || node.kind === "group") {
      walk(node.children, [...nodePath, "children"], visit);
    }
  });
}

/** Checks a schema cannot express: unique ids and references that resolve inside the document. */
function checkReferences(document: IrDocument): IrIssue[] {
  const issues: IrIssue[] = [];
  const assets = new Set(document.assets.map((asset) => asset.id));
  const components = new Set(document.components.map((component) => component.id));
  const tokens = new Set(
    document.tokenSets.flatMap((set) => set.tokens.map((token) => token.name)),
  );
  const ids = new Set<string>();

  walk(document.nodes, ["nodes"], (node, path) => {
    if (ids.has(node.id)) {
      issues.push({ path: [...path, "id"], message: `Duplicate node id ${node.id}` });
    }
    ids.add(node.id);

    const imageAssets = node.fills.flatMap((fill, index) =>
      fill.type === "image"
        ? [{ asset: fill.asset, path: [...path, "fills", index, "asset"] }]
        : [],
    );
    if (node.kind === "image") imageAssets.push({ asset: node.asset, path: [...path, "asset"] });
    for (const ref of imageAssets) {
      if (!assets.has(ref.asset)) {
        issues.push({ path: ref.path, message: `Unknown asset ${ref.asset}` });
      }
    }

    if (node.component !== undefined && !components.has(node.component)) {
      issues.push({ path: [...path, "component"], message: `Unknown component ${node.component}` });
    }
    for (const [property, name] of Object.entries(node.tokens)) {
      if (!tokens.has(name)) {
        issues.push({ path: [...path, "tokens", property], message: `Unknown token ${name}` });
      }
    }
  });
  return issues;
}

/** Validates untrusted input (model output, binfile JSON, fixtures) into an IR document. */
export function parseIr(input: unknown): IrParseResult {
  const tooBig = checkSize(input);
  if (tooBig) return { success: false, issues: [tooBig] };

  const parsed = irDocument.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  }
  const issues = checkReferences(parsed.data);
  return issues.length > 0 ? { success: false, issues } : { success: true, data: parsed.data };
}
