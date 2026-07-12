# File Path Map

This file records the intended structure of `vibeSrc`. Keep it updated when folders are added, moved, or renamed.

## Current files

```text
vibeSrc/
  .gitignore
  assets/
    buymeacoffee-pigmore-qr.png
  LICENSE
  README.md
  index.html
  package.json
  rules.md
  tech-principle.md
  coding.md
  filePath.md
  issue.md
  promptRecord.md
  roadmap.md
  projects/
    index.html
    hello-world/
      index.html
    count-plus-one/
      index.html
    nodeNote/                 # Git submodule: https://github.com/pigmore/nodeNote
    ecs-obj-editor/
      index.html
      editor.js
      README.md
    editor-command-studio/
      index.html
      main.js
      main.ts                 # TypeScript reference implementation
      contracts.ts
      README.md
    transform-gizmo-lab/
      index.html
      main.js
      README.md
    gaussian-splat-render-lab/
      index.html
      main.js
      main.ts                 # TypeScript reference implementation
      README.md
    simulation-sync-lab/
      index.html
      main.js
      README.md
    ape-ecs-simulation-playground/
      index.html
      demo.js
      README.md
      vendor/
        ape-ecs-v1.3.0.js
        ape-ecs-MIT-LICENSE.txt
  scripts/
    serve.py
```

## Planned structure

```text
vibeSrc/
  docs/                         # long-form docs and design notes
    decisions/                  # ADR-style technical decisions
    assets/                     # documentation images/GIFs

  src/                          # frontend source after scaffold exists
    app/                        # app shell, routes, layouts, providers
    components/                 # shared UI components
    features/                   # standalone frontend features
      <feature-name>/
        README.md
        index.ts
        demo.*
        *.test.*
    lib/                        # shared utilities and pure logic
    styles/                     # global CSS, tokens, reset

  public/                       # static public assets
  tests/                        # cross-feature or e2e tests
  scripts/                      # project automation scripts
```

## Naming rules

- Use kebab-case for folders: `drag-drop-list`, `command-menu`.
- Use PascalCase for UI components when the chosen framework supports it: `CommandMenu.tsx`.
- Use camelCase for normal functions and variables.
- Use `index.ts` only for public exports, not hidden logic.
- Keep feature-specific code inside `src/features/<feature-name>/`.

## Path ownership

| Path | Purpose | Notes |
| --- | --- | --- |
| `README.md` | Project overview | Keep short, link to deeper docs. |
| `.gitignore` | Local/generated file exclusions | Keeps Python caches and macOS metadata out of commits. |
| `rules.md` | Collaboration and quality rules | Update when contribution policy changes. |
| `tech-principle.md` | Technical decision principles | Update when stack or quality bar changes. |
| `coding.md` | Agent/developer coding guide | Similar role to `CLAUDE.md`. |
| `filePath.md` | Repository map | Update on structure changes. |
| `issue.md` | Issue log | Record bugs, UX issues, fixes, and follow-ups. |
| `promptRecord.md` | Prompt and decision log | Append important AI prompts and outcomes. |
| `roadmap.md` | Startup roadmap | Track phases and feature ideas. |
| `index.html` | Static welcome page | Entry point for visitors and demo links. |
| `projects/` | Static vanilla JavaScript demos | One folder per demo project. |
| `projects/nodeNote/` | NodeNote demo submodule | Tracks `https://github.com/pigmore/nodeNote`. |
| `projects/ecs-obj-editor/` | Vanilla JavaScript 3D editor | WebGL OBJ editor with an ECS architecture. |
| `projects/editor-command-studio/` | Editor architecture lab | Commands, history, tool plugins, state-driven inspector, and TypeScript contracts. |
| `projects/transform-gizmo-lab/` | Transform tooling lab | Direct transform gizmos with per-axis picking, quaternion rotation, local/world space, snapping, and command history. |
| `projects/gaussian-splat-render-lab/` | WebGL renderer lab | Gaussian-style point splats with tile buffers, LOD, culling, and performance metrics. |
| `projects/simulation-sync-lab/` | Simulation bridge lab | Normalized asset contract and USD/MJCF/SDF/glTF adapter previews. |
| `projects/ape-ecs-simulation-playground/` | Ape ECS architecture lab | MIT-attributed upstream Ape ECS browser build with components, systems, queries, dynamic composition, and serialization. |
| `package.json` | Convenience scripts | Runs the Python static server through npm scripts. |
| `scripts/serve.py` | Local static web server | Uses Python standard library, no dependencies. |
| `src/features/` | Main feature library | One folder per feature. |
| `docs/decisions/` | Architecture decision records | Use for non-trivial stack choices. |

## Update rule

Whenever a new top-level folder appears, add it to this file in the same PR/commit.
