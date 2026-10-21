import { manifestSchema } from "@penpotx/plugin-shell/manifest";
import { describe, expect, it } from "vitest";
import manifest from "../public/manifest.json" with { type: "json" };

describe("plugin-hello manifest", () => {
  it("passes Penpot's manifest schema", () => {
    expect(manifestSchema.parse(manifest).code).toBe("plugin.js");
  });
});
