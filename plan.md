# penpotx

Penpot plugins sharing one TypeScript core: Slint, SwiftUI and WinUI code converters and a Claude plugin (Claude Design handoff, select + prompt redesign).

| # | Status | Priority | Complexity | Readiness | Agent |
| --- | --- | --- | --- | --- | --- |
| T3 | todo | P0 | 4 | 0% | |
| T4 | todo | P1 | 4 | 0% | |
| T5 | todo | P1 | 4 | 0% | |
| T6 | todo | P1 | 4 | 0% | |
| T7 | in progress | P1 | 3 | 90% | Claude Code / claude-opus-5-5 |
| T8 | todo | P2 | 4 | 0% | |
| T9 | in progress | P1 | 2 | 90% | Claude Code / claude-opus-5-5 |
| T10 | todo | P1 | 2 | 0% | |

### T3. Plugin API → IR adapter

Runs in plugin code: walks the selection or a board, reads shapes, layout, tokens and components, exports image and SVG bytes with `shape.export`, and sends IR plus assets to the UI. Done when fixture Penpot files produce IR that passes the T2 schema, with snapshot tests of the IR.

### T4. Slint emitter and plugin

Pure emitter IR → `.slint` (FlexboxLayout / Grid / absolute, Rectangle, Text / StyledText, Path, Image, `export global` tokens, components) with fidelity warnings, and a thin plugin that downloads the result. Done when snapshot tests pass and generated files from fixtures pass `slint-viewer --check`.

### T5. SwiftUI emitter and plugin

Pure emitter IR → SwiftUI (target iOS 17 / macOS 14; `#available` for iOS 26 line height) with stacks, Grid, a wrap `Layout`, AttributedString text, token extensions and components as `View` structs; fidelity warnings; thin plugin exporting a SwiftPM package with assets and fonts. Done when snapshot tests pass and the exported package typechecks with `swiftc` on macOS.

### T6. WinUI 3 XAML emitter and plugin

Pure emitter IR → WinUI 3 XAML (StackPanel / Grid / Canvas, Border, TextBlock runs, Path, brushes, ResourceDictionary tokens with Light/Dark, UserControls) with fidelity warnings; thin plugin exporting the files. Done when snapshot tests pass and the output is well-formed XML using only allow-listed WinUI types.

### T7. Claude Design handoff plugin

Plugin that exports a ZIP for manual upload to Claude Design: the `.penpot` file (`currentFile.export`), PNG/PDF of the selection, HTML/CSS from `generateMarkup` / `generateStyle`, tokens and the user's prompt. No automation of claude.ai. Done when the ZIP downloads from Penpot and its contents are covered by tests.

Plan:

1. `apps/plugin-claude` on the shell (port 4411), the home of T8 later. Manifest permissions: `content:read` (file export, markup), `library:read` (tokens), `allow:downloads` (Penpot adds `allow-downloads` to the iframe only with it).
2. Plugin code `src/collect.ts`: on request, export the file with `currentFile.export('penpot', 'merge')` (one importable file), each selected shape as PNG at 2x, `generateMarkup` / `generateStyle` for the selection, and the local token sets as JSON. Empty selection: the bundle carries the file, tokens and prompt only.
3. UI: prompt textarea and an export button; `src/bundle.ts` builds the ZIP (`README.md` with upload steps, `prompt.md`, `<file>.penpot`, `selection/*.png`, `selection.html` + `selection.css`, `tokens.json`) with fflate and downloads it. Shape and file names are untrusted: slugged, length-capped, numbered.
4. Tests: ZIP entries and contents, name sanitizing (path traversal, empty, duplicates), `collect` against a fake `penpot`, manifest schema.
5. Verify: `pnpm check`, build, install from `http://localhost:4411/manifest.json` in Penpot and download a bundle.

### T8. Redesign with Claude

In the Claude plugin, write a prompt and either select elements (their IR plus a PNG go to Claude, which generates a new element from them) or select nothing (Claude creates a new element from the prompt alone). The Claude Messages API answers with structured output constrained to the IR schema (T2); the plugin validates and sanitizes it and inserts it as a new board next to the selection, or in the viewport when nothing was selected. The API key is typed in each session and kept only in the iframe's memory, never stored and never in plugin code. A model picker defaults to `claude-opus-5-5` and offers `claude-sonnet-5-5`. Done when mocked API round-trips for both modes insert a valid board in tests and malformed or unsafe answers are rejected.

### T9. Claude Code plugin: Penpot in the desktop browser

A Claude Code plugin with a `/penpotx:penpot` skill that opens Penpot (design.penpot.app by default) or another Penpot page (docs, plugin hub, community, blog and others by name, or any http or https URL passed as the argument) in its own tab of the Claude desktop app's built-in browser, so the user designs next to the session. It never signs in for the user, asks before installing a penpotx plugin into the user's Penpot profile, and says so when the built-in browser is not available (a terminal session). Penpot cannot be embedded in a Claude Code pane: it sends `X-Frame-Options: SAMEORIGIN`. Done when the plugin passes `claude plugin validate`, installs from this repository's marketplace and `/penpot` opens Penpot in a new built-in browser tab.

Plan:

1. `apps/claude-code-plugin`: `.claude-plugin/plugin.json` and `skills/penpot/SKILL.md` (open, sign-in, plugin install and fallback rules); `.claude-plugin/marketplace.json` at the repository root pointing at it.
2. A small package with a Vitest test that checks the manifest, the marketplace entry and the skill front matter.
3. Verify: `claude plugin validate` on the plugin and the marketplace, `pnpm check`, then install it from the local marketplace and run `/penpot` in the desktop app.

### T10. Serve the penpotx plugins locally and over https

Two ways to serve every `apps/plugin-*`:

1. **Local server.** One command serves the built plugins from `localhost`, plain http by default; `--https` switches to https with a locally trusted certificate from mkcert (Let's Encrypt and certbot do not issue certificates for `localhost`: https://letsencrypt.org/docs/certificates-for-localhost/). For the user's own Chrome, which asks for Local Network Access either way.
2. **GitHub Pages.** CI builds the plugins and publishes them, so they install from a public https manifest URL. The Claude desktop built-in browser blocks requests from design.penpot.app to local addresses (`ERR_BLOCKED_BY_CLIENT`) whatever the scheme, so only hosted plugins work there; `/penpotx:penpot` (T9) then lists their URLs. Needs a public GitHub repository, created only after the creator confirms its owner and name.

Done when each plugin's manifest installs in Penpot from the local server (http and `--https`) in Chrome and from Pages in the built-in browser.
