import { describe, expect, it } from "vitest";
import { IR_LIMITS, parseIr, type IrNode } from "../src/index.ts";
import gridGallery from "./fixtures/grid-gallery.json" with { type: "json" };
import loginCard from "./fixtures/login-card.json" with { type: "json" };

/** Deep copy of the login card fixture, so each case can break one thing. */
function loginCardCopy(): any {
  return structuredClone(loginCard);
}

function rect(id: string): Record<string, unknown> {
  return { id, kind: "rect", x: 0, y: 0, width: 10, height: 10 };
}

function issuesOf(input: unknown): string[] {
  const result = parseIr(input);
  if (result.success) throw new Error("expected the document to be rejected");
  return result.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
}

describe("parseIr accepts the fixtures", () => {
  it("parses the login card and fills in defaults", () => {
    const result = parseIr(loginCard);
    if (!result.success) throw new Error(JSON.stringify(result.issues));

    const card = result.data.nodes[0]!;
    expect(card.kind).toBe("board");
    if (card.kind !== "board") return;
    expect(card.clip).toBe(true);
    expect(card.layout).toMatchObject({ type: "flex", direction: "column", wrap: false });
    const title = card.children.find(
      (node): node is Extract<IrNode, { kind: "text" }> => node.kind === "text",
    );
    expect(title?.runs.map((run) => run.text).join("")).toBe("Welcome back");
    expect(title?.runs[0]).toMatchObject({
      fontStyle: "normal",
      lineHeight: 1.2,
      textDecoration: "none",
    });
    expect(result.data.components[0]?.variant).toEqual({ state: "default" });
  });

  it("parses the grid gallery", () => {
    const result = parseIr(gridGallery);
    if (!result.success) throw new Error(JSON.stringify(result.issues));

    const gallery = result.data.nodes[0]!;
    if (gallery.kind !== "board") throw new Error("expected a board");
    expect(gallery.layout).toMatchObject({
      type: "grid",
      columns: [{ type: "percent" }, { type: "auto", value: 1 }, { type: "flex" }],
    });
    expect(gallery.children[0]?.layoutChild?.cell).toEqual({
      row: 1,
      column: 1,
      rowSpan: 1,
      columnSpan: 2,
      area: "hero",
    });
  });
});

describe("parseIr rejects malformed documents", () => {
  it("rejects an unknown node kind", () => {
    const doc = loginCardCopy();
    doc.nodes[0].children[0].kind = "video";
    expect(issuesOf(doc).join()).toContain("nodes.0.children.0.kind");
  });

  it("rejects a colour that is not #rrggbb", () => {
    const doc = loginCardCopy();
    doc.nodes[0].fills[0].color = "red";
    expect(issuesOf(doc)).toEqual([expect.stringContaining("nodes.0.fills.0.color")]);
  });

  it("rejects path data carrying anything but path commands", () => {
    const doc = loginCardCopy();
    doc.nodes[0].children[2].children[1].d = 'M0 0"/><script>alert(1)</script>';
    expect(issuesOf(doc)).toEqual([expect.stringContaining("children.1.d")]);
  });

  it("rejects unknown keys", () => {
    const doc = loginCardCopy();
    doc.nodes[0].onclick = "alert(1)";
    expect(issuesOf(doc).join()).toContain("onclick");
  });

  it("rejects non-finite and out-of-range numbers", () => {
    const doc = loginCardCopy();
    doc.nodes[0].width = Number.POSITIVE_INFINITY;
    doc.nodes[0].opacity = 2;
    const issues = issuesOf(doc).join("\n");
    expect(issues).toContain("nodes.0.width");
    expect(issues).toContain("nodes.0.opacity");
  });

  it("rejects duplicate node ids", () => {
    const doc = loginCardCopy();
    doc.nodes[0].children[1].id = "logo";
    expect(issuesOf(doc)).toEqual(["nodes.0.children.1.id: Duplicate node id logo"]);
  });

  it("rejects dangling asset, component and token references", () => {
    const doc = loginCardCopy();
    doc.assets = [];
    doc.components = [];
    doc.tokenSets[0].tokens = doc.tokenSets[0].tokens.filter(
      (token: { name: string }) => token.name !== "color.primary",
    );
    expect(issuesOf(doc)).toEqual([
      "nodes.0.children.0.asset: Unknown asset logo-png",
      "nodes.0.children.2.component: Unknown component button-primary",
      "nodes.0.children.2.tokens.fill: Unknown token color.primary",
    ]);
  });

  it("rejects an empty document", () => {
    expect(issuesOf({ version: 1, nodes: [] }).join()).toContain("nodes");
    expect(issuesOf(null).length).toBeGreaterThan(0);
  });

  it("rejects nesting deeper than the limit before schema validation", () => {
    let node: Record<string, unknown> = rect("leaf");
    for (let depth = 0; depth < IR_LIMITS.maxDepth; depth += 1) {
      node = { ...rect(`g${String(depth)}`), kind: "group", children: [node] };
    }
    expect(issuesOf({ version: 1, nodes: [node] })).toEqual([
      expect.stringContaining(`Nesting deeper than ${String(IR_LIMITS.maxDepth)} levels`),
    ]);
  });

  it("rejects more nodes than the limit", () => {
    const children = Array.from({ length: IR_LIMITS.maxNodes }, (_, index) =>
      rect(`r${String(index)}`),
    );
    const doc = { version: 1, nodes: [{ ...rect("root"), kind: "group", children }] };
    expect(issuesOf(doc)).toEqual([`: More than ${String(IR_LIMITS.maxNodes)} nodes`]);
  });
});
