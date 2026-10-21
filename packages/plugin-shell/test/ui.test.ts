import { describe, expect, it, vi } from "vitest";
import { downloadBytes, onPluginMessage, sendToPlugin, type UiWindow } from "../src/ui.ts";

function fakeWindow() {
  const listeners = new Set<(event: MessageEvent) => void>();
  const parent = { postMessage: vi.fn() };
  const win: UiWindow = {
    parent,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  const dispatch = (data: unknown, source: unknown) => {
    for (const listener of listeners) listener({ data, source } as MessageEvent);
  };
  return { win, parent, dispatch, listeners };
}

describe("onPluginMessage", () => {
  it("delivers messages from the parent frame", () => {
    const { win, parent, dispatch } = fakeWindow();
    const handler = vi.fn();
    onPluginMessage(handler, win);
    dispatch({ type: "hello" }, parent);
    expect(handler).toHaveBeenCalledWith({ type: "hello" });
  });

  it("ignores messages from any other source", () => {
    const { win, dispatch } = fakeWindow();
    const handler = vi.fn();
    onPluginMessage(handler, win);
    dispatch({ type: "spoofed" }, {});
    dispatch({ type: "spoofed" }, null);
    expect(handler).not.toHaveBeenCalled();
  });

  it("stops listening after unsubscribe", () => {
    const { win, parent, dispatch, listeners } = fakeWindow();
    const handler = vi.fn();
    const off = onPluginMessage(handler, win);
    off();
    dispatch({ type: "late" }, parent);
    expect(handler).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });
});

describe("sendToPlugin", () => {
  it("posts to the parent frame", () => {
    const { win, parent } = fakeWindow();
    sendToPlugin({ type: "ping" }, win);
    expect(parent.postMessage).toHaveBeenCalledWith({ type: "ping" }, "*");
  });
});

describe("downloadBytes", () => {
  it("clicks a link to a blob URL with the file name", () => {
    const link = { href: "", download: "", click: vi.fn() };
    downloadBytes(new Uint8Array([1, 2, 3]), "design.penpot", undefined, {
      createElement: () => link,
    });
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.download).toBe("design.penpot");
    expect(link.href).toMatch(/^blob:/);
  });

  it("rejects an empty file name", () => {
    expect(() =>
      downloadBytes(new Uint8Array(), " ", undefined, {
        createElement: () => ({ href: "", download: "", click: () => {} }),
      }),
    ).toThrow(/empty file name/);
  });
});
