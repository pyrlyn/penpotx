# Done

### T1. Monorepo scaffold

pnpm workspace with TypeScript, Vite, `@penpot/plugin-types` 1.5.0, a test runner and a shared plugin UI shell (iframe ↔ plugin-code messaging, download helper). Done when an empty plugin built from the workspace loads in Penpot from a local manifest URL, and lint, typecheck and tests run in one command.

What was done:

- Root: `package.json` (`build`, `check` = fmt check + lint + typecheck + test), `pnpm-workspace.yaml`, `mise.toml` (Node 26.12.0, pnpm 12.14.0), `tsconfig.base.json`, oxlint and oxfmt, `.gitignore`. The project has its own git repository because oxlint and oxfmt skip files ignored by the parent workspace.
- `packages/plugin-shell`: UI ↔ plugin-code messaging that only accepts messages from `window.parent`, a bytes download helper, a zod schema of Penpot's v2 manifest, and Vite config factories (plugin code as one self-contained IIFE, UI page with relative assets, CORS preview server).
- `apps/plugin-hello`: empty plugin on the shell (manifest v2, `content:read`, plugin code typed without DOM, UI showing the selection count).
- Tests (Vitest, 13): messaging source check and unsubscribe, download helper, manifest schema, a build test asserting `plugin.js` is the only output and has no `import`/`export`, and the plugin-hello manifest.

Checked: `pnpm check` and `pnpm build` pass; the preview serves `manifest.json` with `Access-Control-Allow-Origin: *`; installed from `http://localhost:4410/manifest.json` in design.penpot.app (2.18.4) in Chrome, the plugin opened and showed "penpotx plugin shell is loaded." and "Selected: 0". Chrome's Local Network Access must allow design.penpot.app to reach localhost; the Claude desktop browser pane blocks it (`ERR_BLOCKED_BY_CLIENT`).

### T2. Shared IR and schema

TypeScript types plus a runtime schema for the intermediate representation: nodes (board, rect, ellipse, text with styled runs, path, image, group), flex and grid layout, sizing, paints, strokes, effects, components, variants and tokens as first-class nodes. Records design intent, not target rendering (see `research.md`). Done when the schema validates hand-written fixtures and rejects malformed ones, with tests.

What was done:

- `packages/ir` (`@penpotx/ir`): zod 4 schemas with inferred types for the IR document (version, nodes, assets, token sets, components) and its parts: board (clip, flex or grid layout, hug sizing), group, rect, ellipse, path, text with styled runs, image; shared geometry, rotation, opacity, blend mode, constraints, layout-child sizing and grid cells, fills (solid, linear and radial gradients, image), strokes, shadows and blurs, per-property token refs and component refs. Optional fields have defaults, so a model or adapter writes only what differs. Strict objects reject unknown keys; numbers, strings and lists are bounded; path data allows only path commands and numbers.
- `parseIr`: a size and depth check before zod walks the tree (10 000 nodes, 64 levels), schema validation, then unique node ids and resolving asset, component and token refs.

Checked: two hand-written fixtures (a flex login card with tokens, a component instance, an image and a gradient; a grid gallery with spans, an absolute child and a group) parse; 10 malformed cases are rejected (unknown kind, bad colour, script in path data, unknown key, non-finite and out-of-range numbers, duplicate ids, dangling refs, empty document, too deep, too many nodes). `pnpm check` passes.
