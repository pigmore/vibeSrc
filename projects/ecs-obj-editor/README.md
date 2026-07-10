# OBJ ECS Editor — SketchUp-lite

A browser-native **vanilla JavaScript + WebGL** 3D modeling study. It keeps the explicit **Entity-Component-System (ECS)** architecture of the original OBJ editor, then adds a compact, SketchUp-inspired direct-modeling workflow.

## What it demonstrates

- Browser-native WebGL rendering without a framework or 3D engine dependency.
- ECS entity IDs with separate `name`, `transform`, `mesh`, `material`, and `selectable` component stores.
- Dedicated render, editor, history, and input systems.
- Grid-aware box placement, selection, move, rotate, and push/pull modeling tools.
- Reversible scene history with undo/redo.
- Orbit, top, home, and frame-selection camera controls.
- OBJ import and full-scene OBJ export.

## Run

From the vibeSrc repository root:

```bash
npm run serve
```

Then visit:

```text
http://127.0.0.1:8080/projects/ecs-obj-editor/
```

## Modeling controls

| Action | Control |
| --- | --- |
| Select / orbit | `V`, click a mesh to select; drag empty space to orbit |
| Place a unit box | `B`, then click the ground grid |
| Move selected mesh | `M`, then drag in the viewport |
| Rotate selected mesh | `R`, then drag left/right |
| Push / pull height | `P`, then drag up/down |
| Toggle wireframe | `G` or the **Display** tile |
| Undo / redo | `Ctrl/Cmd + Z` / `Shift + Ctrl/Cmd + Z` |
| Delete selected mesh | `Delete` or `Backspace` |
| Camera helpers | **Home view**, **Top view**, **Frame selection** |
| Grid snapping | Toggle snap and choose increment from the left panel |
| Import geometry | **Import OBJ** (supports `v` and `f` records) |
| Export scene | **Export scene** |

## ECS shape

```text
World
  entities: Set<EntityId>
  components: Map<ComponentType, Map<EntityId, Component>>

Entity
  id only; behavior lives in systems

Components
  name, transform, mesh, material, selectable

Systems
  RenderSystem: transform + mesh + material → WebGL draw calls
  EditorSystem: modeling actions, selection, camera helpers
  HistorySystem: scene snapshots → undo / redo
  InputSystem: pointer gestures, shortcuts, orbit, direct manipulation
```

## Intentional limits

This is a teaching/demo editor rather than a production DCC application. It currently uses lightweight origin-based selection and transform tools rather than mesh-face editing, boolean operations, edge inference, UVs, materials, textures, groups/components, or glTF support. OBJ import accepts vertex (`v`) and face (`f`) records, triangulates polygon faces, and supports at most 65,535 vertices.
