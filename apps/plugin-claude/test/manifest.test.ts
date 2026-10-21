import { manifestSchema } from "@penpotx/plugin-shell/manifest";
import { describe, expect, it } from "vitest";
import manifest from "../public/manifest.json" with { type: "json" };

describe("plugin-claude manifest", () => {
  it("passes Penpot's manifest schema", () => {
    expect(manifestSchema.parse(manifest).code).toBe("plugin.js");
  });

  it("asks for downloads, without which Penpot's iframe cannot save the ZIP", () => {
    expect(manifestSchema.parse(manifest).permissions).toContain("allow:downloads");
  });
});
