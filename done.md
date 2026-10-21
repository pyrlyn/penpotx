# Done

### T1. Monorepo scaffold

pnpm workspace with TypeScript, Vite, `@penpot/plugin-types` 1.5.0, a test runner and a shared plugin UI shell (iframe ↔ plugin-code messaging, download helper). Done when an empty plugin built from the workspace loads in Penpot from a local manifest URL, and lint, typecheck and tests run in one command.

What was done:

- Root: `package.json` (`build`, `check` = fmt check + lint + typecheck + test), `pnpm-workspace.yaml`, `mise.toml` (Node 26.12.0, pnpm 12.14.0), `tsconfig.base.json`, oxlint and oxfmt, `.gitignore`. The project has its own git repository because oxlint and oxfmt skip files ignored by the parent workspace.
- `packages/plugin-shell`: UI ↔ plugin-code messaging that only accepts messages from `window.parent`, a bytes download helper, a zod schema of Penpot's v2 manifest, and Vite config factories (plugin code as one self-contained IIFE, UI page with relative assets, CORS preview server).
- `apps/plugin-hello`: empty plugin on the shell (manifest v2, `content:read`, plugin code typed without DOM, UI showing the selection count).
- Tests (Vitest, 13): messaging source check and unsubscribe, download helper, manifest schema, a build test asserting `plugin.js` is the only output and has no `import`/`export`, and the plugin-hello manifest.

Checked: `pnpm check` and `pnpm build` pass; the preview serves `manifest.json` with `Access-Control-Allow-Origin: *`; installed from `http://localhost:4410/manifest.json` in design.penpot.app (2.18.4) in Chrome, the plugin opened and showed "penpotx plugin shell is loaded." and "Selected: 0". Chrome's Local Network Access must allow design.penpot.app to reach localhost; the Claude desktop browser pane blocks it (`ERR_BLOCKED_BY_CLIENT`).
