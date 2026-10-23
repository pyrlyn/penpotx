# penpotx Claude Code plugin

Opens Penpot and the other Penpot sites in their own tabs of the Claude desktop app's built-in browser, so you can design or read next to the session.

## Install

```sh
claude plugin marketplace add /path/to/penpotx
claude plugin install penpotx@penpotx
```

Then run `/reload-plugins` or start a new session.

## Use

The skill is `/penpotx:penpot [name or url ...]`. Claude also uses it when you ask for Penpot in plain words.

| You type | Claude opens |
| --- | --- |
| `/penpotx:penpot` | The app, https://design.penpot.app/ |
| `/penpotx:penpot docs` | The user guide, https://help.penpot.app/ |
| `/penpotx:penpot plugin-docs` | Plugin developer docs, https://help.penpot.app/plugins/ |
| `/penpotx:penpot plugins` | The plugin catalogue in Penpot Hub |
| `/penpotx:penpot plugins community` | Two tabs: the plugin catalogue and the community forum |
| `/penpotx:penpot https://penpot.example.com/` | A self-hosted Penpot |
| `/penpotx:penpot https://design.penpot.app/#/dashboard/recent` | A page inside the app, as given |
| "open the Penpot docs about plugins" | https://help.penpot.app/plugins/ |
| "what does the Penpot hub say about Tailwind plugins?" | The plugin catalogue, then an answer from the page |

Names: `app`, `site`, `docs` (or `help`), `plugin-docs`, `tech-guide`, `hub`, `plugins`, `libraries` (or `templates`), `community`, `blog`, `pricing`, `github`. Anything else that is not an `http` or `https` URL is refused with this list.

## What it will not do

- Sign in for you. On a sign-in page it asks you to sign in in the pane yourself.
- Install a Penpot plugin without asking. Plugins from a `localhost` server cannot be installed in the built-in browser (it blocks requests from a Penpot site to local addresses); use https-hosted ones there.
- Show Penpot inside a Claude Code pane or an artifact. Penpot sends `X-Frame-Options: SAMEORIGIN`, so it opens only as a browser tab.

In a terminal session, where the built-in browser does not exist, it gives you the URL, or offers Claude in Chrome when that is connected.
