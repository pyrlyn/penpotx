# Roadmap

- **Binfile → IR adapter and CLI.** Read `.penpot` binfile v3 JSON (or fetch it through the Penpot RPC API with an access token) and run the same emitters without a browser.
- **Electron desktop app.** Shell that loads a Penpot instance in a `WebContentsView`, serves the plugins from a fixed `127.0.0.1` port, and adds a narrow, schema-validated native bridge: save generated projects to disk, run local validators, keep the Claude API key in `safeStorage`, call the Claude API from the main process. Optional offline mode with the official Docker stack on Colima. arm64-only on macOS.
- **Per-target validation in CI.** `slint-viewer --check` on Linux, `swiftc -typecheck` on a macOS runner, a Windows App SDK build on a Windows runner, fed by fixture outputs.
- **Live Slint preview with slintx.** Preview generated `.slint` in the plugin iframe with slint-bindings' own Slint compiler, interpreter and `slintx-wgpu` renderer compiled to WebAssembly (WebGPU), instead of Slint's `slint-wasm-interpreter`. Depends on slint-bindings' slintx milestones M7a and M7b (`plan.md` T73–T85; the browser build is T85); the language research is slint-bindings `research.md` §8.
