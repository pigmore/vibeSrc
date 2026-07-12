# Simulation Sync Lab

A browser-side scene-contract demo for keeping an editor and multiple simulation engines aligned without coupling the UI directly to USD, MJCF, SDF, or glTF internals.

## Demonstrates

- A normalized asset contract with stable IDs, revisions, transforms, materials, and optional joint metadata.
- An interactive, perspective-projected **3D scene canvas** driven by that same normalized asset state: drag to orbit, scroll to zoom, and click an asset to select it.
- A visible patch pulse from the canonical scene to the selected engine target when a transform is published.
- Format-specific preview adapters for **USD**, **MJCF**, **SDF**, and **glTF**.
- Serializable transform patches with a monotonic revision clock.
- Target routing concepts for Isaac Sim, MuJoCo, Unreal, and Genesis.
- Browser-exportable contract text and a live patch event stream.

## Architecture

```text
format decoder -> normalized editor scene -> revisioned patch -> engine adapter
USD / MJCF / SDF / glTF                        Isaac / MuJoCo / Unreal / Genesis
```

## Sync lifecycle

1. An adapter decodes a source concept into the normalized scene; the browser keeps a stable asset ID plus transform and optional joint/material data.
2. Editing X/Y/Z updates that canonical transform, increments the monotonic revision, and redraws the same 3D canvas state.
3. **Publish transform patch** serializes only the changed asset identity, revision/clock, target, source, and translation—rather than leaking editor-specific objects into an engine format.
4. The selected engine adapter converts the patch into its own runtime update. This lab shows the route as a visible pulse; a production bridge adds authenticated transport, acknowledgements, retries, and conflict handling.

The canvas uses browser Canvas 2D with a perspective projection to keep this static demo dependency-free. It visualizes the contract state; it is not a physics simulation or a live engine connection.

## Honest scope

This static demo does not open a socket to a running simulator. A production bridge would add authentication, a WebSocket/WebRTC transport, conflict policy, retry/ack behavior, and an engine-side adapter process. The key editor boundary—the normalized contract and revisioned patch—is runnable and inspectable here.
