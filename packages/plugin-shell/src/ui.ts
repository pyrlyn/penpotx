/** The part of `window` the UI side needs; tests pass a fake. */
export interface UiWindow {
  readonly parent: { postMessage(message: unknown, targetOrigin: string): void };
  addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
  removeEventListener(type: "message", listener: (event: MessageEvent) => void): void;
}

/**
 * Listens for messages from the plugin code. Penpot relays them through the parent frame, so
 * anything else posting into the iframe (other frames, extensions) is ignored. The payload is
 * still untrusted: callers validate its shape. Returns an unsubscribe function.
 */
export function onPluginMessage<T>(
  handler: (message: T) => void,
  win: UiWindow = window,
): () => void {
  const listener = (event: MessageEvent): void => {
    if (event.source !== win.parent) return;
    handler(event.data as T);
  };
  win.addEventListener("message", listener);
  return () => win.removeEventListener("message", listener);
}

/** Sends a message to the plugin code. The parent origin is the Penpot instance, which varies for self-hosted ones. */
export function sendToPlugin<T>(message: T, win: UiWindow = window): void {
  win.parent.postMessage(message, "*");
}

/** The part of `document` the download needs; tests pass a fake. */
export interface DownloadDocument {
  createElement(tag: "a"): { href: string; download: string; click(): void };
}

/**
 * Saves bytes as a file from the UI iframe. Needs the `allow:downloads` permission: Penpot only
 * adds `allow-downloads` to the iframe sandbox when the manifest declares it.
 */
export function downloadBytes(
  bytes: Uint8Array,
  fileName: string,
  type = "application/octet-stream",
  doc: DownloadDocument = document,
): void {
  if (fileName.trim() === "") throw new Error("downloadBytes: empty file name");
  const url = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type }));
  const link = doc.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoking in the same task can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
