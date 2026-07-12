# Ape ECS Simulation Playground

A browser-runnable simulation built with the **real Ape ECS v1.3.0 browser build** from [`fritzy/ape-ecs`](https://github.com/fritzy/ape-ecs).

## What it demonstrates

- `ApeECS.World` component, tag, and system registration.
- Components: `Position`, `Velocity`, `Renderable`, `Lifetime`, and optional `Glow`.
- An ECS system group with Gravity, Integration, and Lifetime systems.
- `System.createQuery().fromAll(...)` queries that drive simulation work.
- A persisted world query that drives the renderer and entity list.
- Dynamic component composition through the **Toggle Glow** action.
- `world.getObject()` serialization and JSON export.

## Run

```bash
npm run serve
```

Open:

```text
http://127.0.0.1:8080/projects/ape-ecs-simulation-playground/
```

## Controls

- **Add ball** — the header control creates one composed Ape ECS entity immediately without changing the fixed canvas height.
- **Step system group** — runs the `simulation` system group once while paused or running.
- **Pause** — freezes the frame loop without changing the ECS world.
- **Click a dot** — selects its entity and displays component data.
- **Toggle Glow** — dynamically adds or removes an Ape ECS component.
- **Export world JSON** — serializes the world via `world.getObject()`.

## Attribution and license

This demo vendors the upstream `builds/ape-ecs-v1.3.0.js` browser build from Ape ECS commit `ed9c34cd22467136290b69474b7ea5a93c203dd3`. Ape ECS is MIT licensed; the required notice is preserved in [`vendor/ape-ecs-MIT-LICENSE.txt`](./vendor/ape-ecs-MIT-LICENSE.txt).

## Intentional limits

The renderer is a small Canvas 2D visualization to keep the ECS behavior easy to inspect. It is not intended as a replacement for a WebGL/WebGPU renderer; the same components and system/query boundaries can drive the existing WebGL demos or a Three.js scene.
