# File Path Map

This file records the intended structure of `vibeSrc`. Keep it updated when folders are added, moved, or renamed.

## Current files

```text
vibeSrc/
  LICENSE
  README.md
  rules.md
  tech-principle.md
  coding.md
  filePath.md
  promptRecord.md
  roadmap.md
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
| `rules.md` | Collaboration and quality rules | Update when contribution policy changes. |
| `tech-principle.md` | Technical decision principles | Update when stack or quality bar changes. |
| `coding.md` | Agent/developer coding guide | Similar role to `CLAUDE.md`. |
| `filePath.md` | Repository map | Update on structure changes. |
| `promptRecord.md` | Prompt and decision log | Append important AI prompts and outcomes. |
| `roadmap.md` | Startup roadmap | Track phases and feature ideas. |
| `src/features/` | Main feature library | One folder per feature. |
| `docs/decisions/` | Architecture decision records | Use for non-trivial stack choices. |

## Update rule

Whenever a new top-level folder appears, add it to this file in the same PR/commit.
