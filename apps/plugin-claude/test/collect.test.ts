import { describe, expect, it, vi } from "vitest";
import { collectBundle, type CollectApi } from "../src/collect.ts";

function fakeApi({ selected = 2, file = true } = {}) {
  const shapes = Array.from({ length: selected }, (_, index) => ({
    name: `Shape ${String(index + 1)}`,
    export: vi.fn(async () => new Uint8Array([index])),
  }));
  const currentFile = {
    name: "Shop App",
    export: vi.fn(async () => new Uint8Array([9, 9])),
  };
  const api = {
    currentFile: file ? currentFile : null,
    selection: shapes,
    generateMarkup: vi.fn(() => "<div></div>"),
    generateStyle: vi.fn(() => "div {}"),
    library: {
      local: {
        tokens: {
          sets: [
            {
              name: "core",
              active: true,
              tokens: [
                {
                  name: "space.s",
                  type: "spacing",
                  value: "4",
                  resolvedValueString: "4",
                  description: "Small gap",
                },
              ],
            },
          ],
        },
      },
    },
  };
  // A structural fake: only the members collectBundle reads.
  return { api: api as unknown as CollectApi, shapes, currentFile, raw: api };
}

describe("collectBundle", () => {
  it("exports the merged file, PNGs at 2x, markup and tokens", async () => {
    const { api, shapes, currentFile, raw } = fakeApi();

    const bundle = await collectBundle(api);

    expect(currentFile.export).toHaveBeenCalledWith("penpot", "merge");
    expect(shapes[0]!.export).toHaveBeenCalledWith({ type: "png", scale: 2 });
    expect(bundle.fileName).toBe("Shop App");
    expect(bundle.penpot).toEqual(new Uint8Array([9, 9]));
    expect(bundle.images).toEqual([
      { name: "Shape 1", png: new Uint8Array([0]) },
      { name: "Shape 2", png: new Uint8Array([1]) },
    ]);
    expect(raw.generateMarkup).toHaveBeenCalledWith(shapes, { type: "html" });
    expect(raw.generateStyle).toHaveBeenCalledWith(shapes, {
      type: "css",
      withPrelude: true,
      includeChildren: true,
    });
    expect(bundle.html).toBe("<div></div>");
    expect(bundle.css).toBe("div {}");
    expect(bundle.tokenSets).toEqual([
      {
        name: "core",
        active: true,
        tokens: [
          { name: "space.s", type: "spacing", value: "4", resolved: "4", description: "Small gap" },
        ],
      },
    ]);
  });

  it("skips images and markup when nothing is selected", async () => {
    const { api, raw } = fakeApi({ selected: 0 });

    const bundle = await collectBundle(api);

    expect(bundle.images).toEqual([]);
    expect(bundle.html).toBe("");
    expect(bundle.css).toBe("");
    expect(raw.generateMarkup).not.toHaveBeenCalled();
  });

  it("fails without an open file", async () => {
    const { api } = fakeApi({ file: false });

    await expect(collectBundle(api)).rejects.toThrow("No file is open.");
  });
});
