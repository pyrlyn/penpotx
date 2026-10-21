import type { Penpot } from "@penpot/plugin-types";
import type { Bundle, ShapeImage, TokenSetDump } from "./messages.ts";

export type CollectApi = Pick<
  Penpot,
  "currentFile" | "selection" | "generateMarkup" | "generateStyle" | "library"
>;

export async function collectBundle(api: CollectApi): Promise<Bundle> {
  const file = api.currentFile;
  if (!file) throw new Error("No file is open.");
  const shapes = api.selection;

  // "merge" folds linked libraries into the file, so Claude Design gets one self-contained file.
  const penpot = await file.export("penpot", "merge");

  // One export at a time: each holds a rendered image in memory until it is sent to the UI.
  const images: ShapeImage[] = [];
  for (const shape of shapes) {
    images.push({ name: shape.name, png: await shape.export({ type: "png", scale: 2 }) });
  }

  const tokenSets: TokenSetDump[] = api.library.local.tokens.sets.map((set) => ({
    name: set.name,
    active: set.active,
    tokens: set.tokens.map((token) => ({
      name: token.name,
      type: token.type,
      value: token.value,
      resolved: token.resolvedValueString,
      description: token.description,
    })),
  }));

  const selected = shapes.length > 0;
  return {
    fileName: file.name,
    penpot,
    images,
    html: selected ? api.generateMarkup(shapes, { type: "html" }) : "",
    css: selected
      ? api.generateStyle(shapes, { type: "css", withPrelude: true, includeChildren: true })
      : "",
    tokenSets,
  };
}
