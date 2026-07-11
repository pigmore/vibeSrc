# Simulation Sync Lab

A browser-side scene-contract demo for keeping an editor and multiple simulation engines aligned without coupling the UI directly to USD, MJCF, SDF, or glTF internals.

## Demonstrates

- A normalized asset contract with stable IDs, revisions, transforms, materials, and optional joint metadata.
- Format-specific preview adapters for **USD**, **MJCF**, **SDF**, and **glTF**.
- Serializable transform patches with a monotonic revision clock.
- Target routing concepts for Isaac Sim, MuJoCo, Unreal, and Genesis.
- Browser-exportable contract text and a live patch event stream.

## Architecture

```text
format decoder -> normalized editor scene -> revisioned patch -> engine adapter
USD / MJCF / SDF / glTF                        Isaac / MuJoCo / Unreal / Genesis
```

## Honest scope

This static demo does not open a socket to a running simulator. A production bridge would add authentication, a WebSocket/WebRTC transport, conflict policy, retry/ack behavior, and an engine-side adapter process. The key editor boundary—the normalized contract and revisioned patch—is runnable and inspectable here.
