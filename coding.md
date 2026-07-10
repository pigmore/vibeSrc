# Coding Guide

This file is the coding-agent guide for `vibeSrc`. Treat it like a lightweight `CLAUDE.md` / agent instruction file.

## Project summary

`vibeSrc` is an open-source frontend feature collection. The goal is to build high-quality UI features and explain them clearly so others can learn from or reuse them.

## Default assumptions until the stack is scaffolded

The repository currently only contains docs and license files. Until a concrete app is added, use these defaults for planning:

- Language: TypeScript.
- Package manager: pnpm.
- Build tool: Vite or a modern frontend meta-framework.
- Components: small, composable, documented.
- Styling: CSS variables/design tokens first; framework-specific styling only when the chosen stack requires it.
- Tests: unit tests for logic, interaction tests for UI, build check before release.

If the actual stack changes, update this section immediately.

## Coding rules

1. Make the smallest useful change.
2. Keep code readable for beginners and maintainers.
3. Prefer named exports for reusable feature modules.
4. Do not hide important behavior in clever abstractions.
5. Keep side effects near the boundary: DOM, network, storage, timers.
6. Validate inputs at public boundaries.
7. Handle loading, empty, disabled, and error states.
8. Keep accessibility behavior close to the component implementation.
9. Do not commit generated build outputs unless the project explicitly requires them.
10. Do not add secrets, local machine paths, or private URLs.

## Suggested feature folder contract

Each feature should eventually look like this:

```text
src/features/<feature-name>/
  README.md              # what it does, usage, edge cases
  index.ts               # public exports
  <feature-name>.tsx     # or .svelte/.vue depending on chosen stack
  <feature-name>.css     # optional local styles
  <feature-name>.test.ts # logic or component tests
  demo.tsx               # optional demo/story entry
```

Use the chosen framework's file extensions after the app scaffold exists.

## Commit style

Use clear conventional-style commits when practical:

```text
feat: add draggable split panel
fix: handle keyboard focus in modal
refactor: simplify virtual list measurements
docs: add prompt record template
chore: initialize frontend docs
```

## Pull request checklist

- [ ] The feature can be understood from its README or comments.
- [ ] Public APIs are named clearly.
- [ ] Accessibility states are considered.
- [ ] Performance risks are documented.
- [ ] Tests or manual verification steps are included.
- [ ] `rules.md`, `tech-principle.md`, and `filePath.md` are updated if structure or policy changed.

## Agent workflow

When using an AI coding agent on this repo:

1. Read `README.md`, `rules.md`, `tech-principle.md`, `coding.md`, and `filePath.md` first.
2. Restate the requested feature in one paragraph.
3. Identify the files that will change.
4. Implement the smallest working version.
5. Run available checks.
6. Update docs and `promptRecord.md` with important prompts/decisions.
7. Report what was actually changed and what was verified.
