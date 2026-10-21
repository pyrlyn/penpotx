import { z } from "zod";

/**
 * Penpot's own manifest schema (plugins-runtime `manifest.schema.ts`, develop, checked
 * 2026-10-20) without the fields Penpot fills in (`pluginId`, `host`) and without the
 * permissions that are not in a released Penpot yet (`allow:global`, `manage:*`).
 */
export const manifestSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string().max(200).optional(),
  version: z.literal(2),
  code: z.string().min(1),
  icon: z.string().optional(),
  permissions: z.array(
    z.enum([
      "content:read",
      "content:write",
      "library:read",
      "library:write",
      "user:read",
      "comment:read",
      "comment:write",
      "allow:downloads",
      "allow:localstorage",
      "clipboard:read",
      "clipboard:write",
    ]),
  ),
});

export type Manifest = z.infer<typeof manifestSchema>;
