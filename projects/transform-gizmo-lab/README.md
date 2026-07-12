# Transform Gizmo Lab

A browser-runnable 3D editor interaction study focused on the transform manipulator—the small UX surface that reveals whether an editor has sound math, picking, history, and input boundaries.

## Demonstrates

- Translate, rotate, and scale gizmo modes.
- Per-axis X/Y/Z handles with distinct transform behavior.
- Quaternion-backed rotations with an Euler inspector view.
- World-space and local-space axis transforms.
- Snap increments for translation, rotation, and scale.
- Scene-object picking and an outliner selection path.
- Reversible transform commands with undo/redo.
- A Canvas 2D projected 3D visualization built from transformed cube vertices.

## Controls

| Action | Control |
| --- | --- |
| Translate / rotate / scale | **Translate**, **Rotate**, **Scale** or `G` / `R` / `S` |
| Select scene object | Click a cube or use the outliner |
| Constrain transform | Drag a colored axis; rotate mode uses the ring |
| World / local reference | **World** / **Local** |
| Toggle snapping | **Grid snap** |
| Undo / redo | **Undo** / **Redo** or `Ctrl/Cmd + Z` / `Shift + Ctrl/Cmd + Z` |
| Add object | **Add object** |

## Architecture boundary

```text
pointer gesture
  → picking / gizmo handle hit test
  → transform operation (axis, space, snap)
  → reversible transform command
  → scene state + inspector + renderer
```

The demo intentionally uses Canvas 2D for its projected visualization so the transform math and input behavior remain easy to inspect without a rendering-engine dependency. The `position`, quaternion `rotation`, and `scale` transform shape can drive a WebGL/WebGPU renderer, Three.js object, ECS component, or engine synchronization patch.

## Intentional limits

This is not a complete DCC gizmo. It uses a fixed isometric-like projection rather than a full camera raycaster; it does not yet support multi-select, pivot modes, plane handles, occlusion-aware GPU picking, or parented hierarchy transforms.
