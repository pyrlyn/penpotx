export type TokenDump = {
  name: string;
  type: string;
  value: unknown;
  resolved: string | undefined;
  description: string;
};

export type TokenSetDump = { name: string; active: boolean; tokens: TokenDump[] };

export type ShapeImage = { name: string; png: Uint8Array };

/** Everything the plugin code reads from Penpot for one handoff bundle. */
export type Bundle = {
  fileName: string;
  penpot: Uint8Array;
  images: ShapeImage[];
  html: string;
  css: string;
  tokenSets: TokenSetDump[];
};

/** Plugin code → UI. */
export type ToUi =
  | { type: "selection"; count: number }
  | { type: "bundle"; bundle: Bundle }
  | { type: "error"; message: string };

/** UI → plugin code. */
export type ToPlugin = { type: "ready" } | { type: "export" };
