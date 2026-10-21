# penpotx — instructions for agents

**What.** A family of Penpot plugins that share one TypeScript core: code converters to Slint, SwiftUI and WinUI 3 XAML (one plugin per target), a Claude plugin (handoff to Claude Design, select + prompt → redesign through the Claude API), a headless CLI and an optional Electron desktop shell.

**Read first.** `plan.md`, `research.md`. Also `roadmap.md`, `ideas.md` (never implement), `done.md`. No unplanned work.

**Architecture.** Penpot shapes → shared IR → one pure emitter per target. Adapters into the IR: live Plugin API (runs in plugin code) and `.penpot` binfile v3 JSON (CLI). Emitters return files plus fidelity warnings; never drop a lossy property silently.

**Rules.**
- Pin `@penpot/plugin-types` 1.5.0 or later (first with design tokens).
- Plugin code is one self-contained bundle (SES, no DOM, no dynamic imports).
- Model output, plugin messages and `.penpot` files are untrusted: validate against the IR schema and sanitize SVG before writing back.
- Never copy code from GPL/AGPL sources (FigmaToCode, Slint `figma_import`, author-more/penpot-desktop); study only. MIT `figma-inspector` may be ported with attribution.
- Never put an Anthropic API key in plugin code or in a URL. Never automate claude.ai.
- Every emitter change ships with a snapshot test of generated output.

`AGENTS.md`/`CLAUDE.md` above this repo apply too; on conflict ask the creator.
