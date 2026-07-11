# Editor Command Studio

A browser-runnable architecture demo for an extensible 3D editor. It focuses on the parts that make a DCC/editor UI maintainable as tools multiply: **commands, history, state, plugins, and serializable scene changes**.

## Demonstrates

- A `CommandBus` that executes, undoes, and redoes explicit scene commands.
- A small state store with a revision counter, selected entity, active tool, and entity map.
- Tool plugins for selection, transform, material, and joint configuration.
- Inspector edits that create commands instead of mutating scene state directly.
- A TypeScript contract file (`contracts.ts`) paired with the dependency-free runnable implementation (`main.js`).

## Try it

- Pick an entity in the scene list or viewport.
- Switch between **Select**, **Translate**, **Material**, and **Joint config** tools.
- Use **Nudge +X** or inspector controls to issue commands.
- Configure a robot joint, then walk history backward/forward with Undo/Redo.

## Architecture shape

```text
ToolPlugin -> CommandFactory -> CommandBus -> EditorStore -> Render/UI
                                 |                |
                               History        serializable patches
```

This is a UI/architecture study, not a full renderer. It deliberately uses DOM objects so the command flow is easy to inspect; the same boundary can drive a Three.js/WebGL/WebGPU scene graph.
