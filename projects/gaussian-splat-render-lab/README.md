# Gaussian Splat Render Lab

A browser-native WebGL lab that renders a dense field of **Gaussian-style splats** as additive, soft point sprites. It exposes the practical renderer levers that a production splat viewer needs before integrating a loader such as Spark.js or gsplat.js.

## Demonstrates

- WebGL vertex/fragment shader pipeline with Gaussian alpha falloff.
- Tile-local GPU buffers instead of one monolithic scene buffer.
- CPU-side camera-facing tile culling before issuing draw calls.
- Density LOD that reduces splats per visible tile.
- Live FPS, frame-time, draw-count, and visible-tile measurements.
- Pointer orbit and wheel zoom controls.
- A separately compile-checked `main.ts` reference source with a per-splat frustum-filter implementation for code review; the static demo itself runs `main.js` without a build step.

## Controls

- **Dataset size:** regenerate 24k, 72k, or 144k generated splats.
- **LOD density:** adjust the percentage of each tile’s splats that are drawn.
- **Tile frustum culling:** compare culling against the full tile set.
- **Pause renderer:** freeze the frame while preserving the current scene.

## Intentional limit

This demo renders generated splats and does not parse PLY, .splat, .ksplat, or SuperSplat scene files. It is deliberately honest about that boundary: depth sorting, covariance attributes, disk streaming, and real file decoders belong behind a loader/worker layer in a production implementation.
