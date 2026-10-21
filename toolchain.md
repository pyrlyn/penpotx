# Toolchain

## Programs

| Program | How to install | Why here | Source |
| --- | --- | --- | --- |
| mise | brew, then `mise install` | Pinned tool versions (`mise.toml`) | https://github.com/jdx/mise |
| Node.js | mise | Runs the build, tests and tools | https://github.com/nodejs/node |
| pnpm | mise | Package manager and workspace runner | https://github.com/pnpm/pnpm |

## npm

| Package | Where | Source | Why here |
| --- | --- | --- | --- |
| typescript | local (root) | https://github.com/microsoft/typescript-go | Type checking |
| vite | local (root) | https://github.com/vitejs/vite | Builds plugin UI pages and the single-file plugin code; preview server with CORS |
| vitest | local (root) | https://github.com/vitest-dev/vitest | Tests |
| oxlint | local (root) | https://github.com/oxc-project/oxc | Lint |
| oxfmt | local (root) | https://github.com/oxc-project/oxc | Formatting |
| @types/node | local (root) | https://github.com/DefinitelyTyped/DefinitelyTyped | Node types for configs and tests |
| zod | local (`packages/plugin-shell`) | https://github.com/colinhacks/zod | Manifest schema, the same library Penpot validates manifests with |
| @penpot/plugin-types | local (`apps/plugin-hello`) | https://github.com/penpot/penpot/tree/develop/plugins | Types of the Penpot Plugin API (`next` tag, first with design tokens) |
