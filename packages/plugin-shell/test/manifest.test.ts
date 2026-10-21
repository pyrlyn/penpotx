import { describe, expect, it } from "vitest";
import { manifestSchema } from "../src/manifest.ts";

const valid = {
  name: "Example",
  description: "An example plugin",
  version: 2,
  code: "plugin.js",
  permissions: ["content:read", "allow:downloads"],
};

describe("manifestSchema", () => {
  it("accepts a valid v2 manifest", () => {
    expect(manifestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects unknown and unreleased permissions", () => {
    for (const permission of ["content:delete", "allow:global", "manage:teams"]) {
      const result = manifestSchema.safeParse({ ...valid, permissions: [permission] });
      expect(result.success, permission).toBe(false);
    }
  });

  it("rejects a description over 200 characters", () => {
    expect(manifestSchema.safeParse({ ...valid, description: "x".repeat(201) }).success).toBe(
      false,
    );
  });

  it("rejects manifests that are not version 2 or carry unknown fields", () => {
    expect(manifestSchema.safeParse({ ...valid, version: 1 }).success).toBe(false);
    expect(manifestSchema.safeParse({ ...valid, host: "https://evil.example" }).success).toBe(
      false,
    );
  });
});
