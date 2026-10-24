import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import type { Bundle } from "../src/messages.ts";
import { buildHandoffZip, handoffZipName, safeName } from "../src/ui/bundle.ts";

const bytes = (...values: number[]) => new Uint8Array(values);

const bundle: Bundle = {
  fileName: "Shop App",
  penpot: bytes(1, 2, 3),
  images: [
    { name: "Login screen", png: bytes(4) },
    { name: "Login screen", png: bytes(5) },
  ],
  html: '<div class="login"></div>',
  css: ".login { width: 320px; }",
  tokenSets: [
    {
      name: "core",
      active: true,
      tokens: [
        {
          name: "color.primary",
          type: "color",
          value: "#0055ff",
          resolved: "#0055ff",
          description: "",
        },
      ],
    },
  ],
};

describe("buildHandoffZip", () => {
  it("packs the file, the selection, markup, tokens and the prompt", () => {
    const files = unzipSync(buildHandoffZip(bundle, "  Make it a dark theme  "));

    expect(Object.keys(files).sort()).toEqual([
      "README.md",
      "prompt.md",
      "selection.css",
      "selection.html",
      "selection/01-login-screen.png",
      "selection/02-login-screen.png",
      "shop-app.penpot",
      "tokens.json",
    ]);
    expect(files["shop-app.penpot"]).toEqual(bundle.penpot);
    expect(files["selection/02-login-screen.png"]).toEqual(bytes(5));
    expect(strFromU8(files["prompt.md"]!)).toBe("Make it a dark theme\n");
    expect(strFromU8(files["selection.html"]!)).toContain('href="selection.css"');
    expect(strFromU8(files["selection.html"]!)).toContain(bundle.html);
    expect(strFromU8(files["selection.css"]!)).toBe(bundle.css);
    expect(JSON.parse(strFromU8(files["tokens.json"]!))).toEqual(bundle.tokenSets);
    expect(strFromU8(files["README.md"]!)).toContain("`selection/01-login-screen.png`");
  });

  it("carries only the file when nothing is selected and there is no prompt or tokens", () => {
    const empty: Bundle = { ...bundle, images: [], html: "", css: "", tokenSets: [] };
    const files = unzipSync(buildHandoffZip(empty, "   "));

    expect(Object.keys(files).sort()).toEqual(["README.md", "shop-app.penpot"]);
  });
});

describe("safeName", () => {
  it("keeps letters and digits of any script", () => {
    expect(safeName("Кнопка Primary 2", "shape")).toBe("кнопка-primary-2");
  });

  it("strips path separators and dots", () => {
    expect(safeName("../../etc/passwd", "shape")).toBe("etc-passwd");
    expect(safeName("C:\\Windows\\..", "shape")).toBe("c-windows");
  });

  it("falls back when nothing usable is left", () => {
    expect(safeName("", "shape")).toBe("shape");
    expect(safeName("../", "shape")).toBe("shape");
  });

  it("caps the length", () => {
    expect(safeName("a".repeat(500), "shape")).toHaveLength(60);
  });

  it("names the ZIP after the file", () => {
    expect(handoffZipName("Shop App")).toBe("shop-app-claude-design.zip");
    expect(handoffZipName("/")).toBe("penpot-claude-design.zip");
  });
});
