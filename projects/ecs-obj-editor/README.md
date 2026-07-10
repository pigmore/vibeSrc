# OBJ ECS Editor

A single-file **vanilla JavaScript + WebGL** 3D OBJ editor demo built around an explicit **Entity-Component-System (ECS)** architecture.

## What it demonstrates

- Browser-native WebGL rendering without a framework or 3D engine dependency.
- Small ECS world implementation with entity IDs and component stores.
- `transform`, `mesh`, `material`, `name`, and `selectable` components.
- Render, editor, selection, and input systems that query component sets.
- Orbit camera controls, entity selection, editable transform/material fields, OBJ import, and scene OBJ export.

## Run

From the vibeSrc repository root:

```bash
npm run serve
```

Then visit:

```text
http://127.0.0.1:8080/projects/ecs-obj-editor/
```

## Controls

| Action | Control |
| --- | --- |
| Orbit camera | Drag inside the viewport |
| Zoom | Mouse wheel / trackpad scroll |
| Select mesh | Click a mesh or an entity in the list |
| Add mesh | **Add cube** |
| Import geometry | **Import OBJ** (supports `v` and `f` records) |
| Edit entity | Inspector transform and color fields |
| Remove entity | **Delete** or keyboard Delete/Backspace |
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
  EditorSystem: scene creation, selection, delete, framing
  InputSystem: pointer orbit, wheel zoom, keyboard delete
```

## Scope and limits

This is intentionally a study project, not a production DCC tool. OBJ import supports vertex (`v`) and face (`f`) records and triangulates polygon faces. It does not currently import materials, textures, normals, groups, or OBJ files with more than 65,535 vertices.
