# vibeSrc

A vibe-coding open-source frontend project that shares all kinds of useful frontend features, UI patterns, and implementation ideas.

## What this repo is for

`vibeSrc` aims to become a practical source library for frontend builders:

- reusable UI features,
- polished interaction patterns,
- accessible component examples,
- performance-minded frontend techniques,
- prompt and decision records for AI-assisted development.

## Starter docs

- [`rules.md`](./rules.md) — project rules, quality gates, and contribution expectations.
- [`tech-principle.md`](./tech-principle.md) — technical principles for frontend decisions.
- [`coding.md`](./coding.md) — coding-agent/developer guide, similar to a lightweight `CLAUDE.md`.
- [`filePath.md`](./filePath.md) — current and planned repository path map.
- [`issue.md`](./issue.md) — issue log for bugs, UI feedback, and follow-up fixes.
- [`promptRecord.md`](./promptRecord.md) — prompt and decision log template.
- [`roadmap.md`](./roadmap.md) — startup roadmap and first feature ideas.

## Demo entry

Open [`index.html`](./index.html) in a browser to see the welcome page and the first vanilla JavaScript demos:

- [`projects/hello-world/`](./projects/hello-world/) — writes a friendly greeting with plain JS.
- [`projects/count-plus-one/`](./projects/count-plus-one/) — increments a counter by one on each click.
- [`projects/nodeNote/`](./projects/nodeNote/) — visual idea canvas maintained as a Git submodule from [`pigmore/nodeNote`](https://github.com/pigmore/nodeNote).
- [`projects/ecs-obj-editor/`](./projects/ecs-obj-editor/) — a vanilla JavaScript WebGL OBJ editor that demonstrates an Entity-Component-System architecture.

## Run the local web server

This repo includes a tiny standard-library Python web server, so no dependency install is required:

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:8080/
```

For LAN testing from another device on the same network:

```bash
npm run serve:lan
```

## Support vibeSrc

The homepage includes a scannable QR code and donation button for [Buy Me a Coffee — pigmore](https://buymeacoffee.com/pigmore).

## Current status

Foundation docs and the first static vanilla JavaScript demos are initialized. The next step is to choose the long-term frontend stack or keep expanding the framework-free demo library.

## License

MIT © pigmore
