# penpotx

Penpot plugins that turn designs into native UI code and connect Penpot to Claude.

- **Converters** — one Penpot plugin per target: Slint (`.slint`), SwiftUI, WinUI 3 XAML. Each exports the selection or a board as source files plus a report of what could not be converted exactly.
- **Claude plugin** — exports the Penpot file and the selection as a bundle for Claude Design, or sends the selected elements with a prompt to Claude and inserts the generated result as a new board.
- **CLI** — the same converters without a browser, reading `.penpot` files.
- **Desktop** — an optional Electron app that bundles the plugins and adds what a browser plugin cannot do: saving projects to disk, running local compilers to check generated code, storing the API key in the OS keychain.

Status: research done (see `research.md`); workspace scaffold done, converters not started.

## Development

```sh
mise install
pnpm install
pnpm check      # format check, lint, typecheck, tests
pnpm build
```

Load a plugin in Penpot: run `pnpm --filter @penpotx/plugin-hello build && pnpm --filter @penpotx/plugin-hello preview`, open the Plugin Manager (Ctrl+Alt+P, ⌘⌥P on macOS) and install `http://localhost:4410/manifest.json`. Chrome asks whether the Penpot site may access the local network; allow it, or the install fails with "The plugin doesn't exist or the URL is not correct".

Layout: `packages/plugin-shell` (shared UI messaging, download helper, manifest schema, Vite configs), `apps/plugin-*` (one Penpot plugin each).

## License

MIT, see `LICENSE`.
