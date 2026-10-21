/** Plugin code → UI. */
export type ToUi = { type: "selection"; count: number };

/** UI → plugin code. */
export type ToPlugin = { type: "ready" };
