import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, mergeConfig } from "vite";
import { afterAll, describe, expect, it } from "vitest";
import { pluginCodeConfig, pluginUiConfig } from "../src/vite.ts";

const fixture = fileURLToPath(new URL("fixture", import.meta.url));
let outDir = "";

afterAll(async () => {
  if (outDir) await rm(outDir, { recursive: true, force: true });
});

describe("pluginCodeConfig", () => {
  it("bundles plugin code into one plugin.js with no module syntax", async () => {
    outDir = await mkdtemp(join(tmpdir(), "penpotx-plugin-"));
    await build(
      mergeConfig(pluginCodeConfig("plugin.ts"), {
        root: fixture,
        logLevel: "silent",
        configFile: false,
        build: { outDir },
      }),
    );
    expect(await readdir(outDir)).toEqual(["plugin.js"]);
    const code = await readFile(join(outDir, "plugin.js"), "utf8");
    expect(code).not.toMatch(/^\s*(import|export)\b/m);
    expect(code).not.toMatch(/\bimport\s*\(/);
    expect(code).toContain("hello");
  });
});

describe("pluginUiConfig", () => {
  it("serves the preview with CORS on a fixed port", () => {
    expect(pluginUiConfig({ port: 4410 }).preview).toEqual({
      port: 4410,
      strictPort: true,
      cors: true,
    });
  });
});
