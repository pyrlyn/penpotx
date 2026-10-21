import type { UserConfig } from "vite";

/** Where Penpot loads a plugin from during development: `http://localhost:<port>/manifest.json`. */
export interface PluginServeOptions {
  port: number;
}

/**
 * The UI page: `index.html` plus `public/` (manifest, icon). Builds first and empties `dist/`.
 * The preview server sends CORS headers because Penpot fetches the manifest and code
 * cross-origin.
 */
export function pluginUiConfig({ port }: PluginServeOptions): UserConfig {
  return {
    // Relative asset URLs, so a plugin also works when hosted under a sub-path.
    base: "./",
    build: { outDir: "dist", emptyOutDir: true },
    preview: { port, strictPort: true, cors: true },
  };
}

/**
 * The plugin code: one self-contained IIFE. Penpot evaluates the file as a single script in an
 * SES compartment, so it must not contain `import`, `export` or split chunks.
 */
export function pluginCodeConfig(entry = "src/plugin.ts"): UserConfig {
  return {
    publicDir: false,
    build: {
      outDir: "dist",
      emptyOutDir: false,
      // An IIFE build never splits chunks, so dynamic imports are inlined too.
      lib: { entry, formats: ["iife"], name: "penpotxPlugin", fileName: () => "plugin.js" },
    },
  };
}
