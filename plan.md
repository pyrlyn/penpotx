# penpotx

Penpot plugins sharing one TypeScript core: Slint, SwiftUI and WinUI code converters and a Claude plugin (Claude Design handoff, select + prompt redesign).

| # | Status | Priority | Complexity | Readiness | Agent |
| --- | --- | --- | --- | --- | --- |
| T2 | todo | P0 | 3 | 0% | |
| T3 | todo | P0 | 4 | 0% | |
| T4 | todo | P1 | 4 | 0% | |
| T5 | todo | P1 | 4 | 0% | |
| T6 | todo | P1 | 4 | 0% | |
| T7 | todo | P1 | 3 | 0% | |
| T8 | todo | P2 | 4 | 0% | |

### T2. Shared IR and schema

TypeScript types plus a runtime schema for the intermediate representation: nodes (board, rect, ellipse, text with styled runs, path, image, group), flex and grid layout, sizing, paints, strokes, effects, components, variants and tokens as first-class nodes. Records design intent, not target rendering (see `research.md`). Done when the schema validates hand-written fixtures and rejects malformed ones, with tests.

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

### T8. Redesign with Claude

Select elements, write a prompt, send structured IR plus a PNG to the Claude Messages API with structured output constrained to the IR schema; validate and sanitize the answer and insert it as a new board next to the selection. User-supplied key, never stored in plugin code. Done when a mocked API round-trip inserts a valid board in tests and malformed or unsafe answers are rejected.
