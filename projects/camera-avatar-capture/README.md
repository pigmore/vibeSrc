# Camera Avatar Capture

A browser camera-capture and avatar-rigging demo imported from the user's existing local avatar project.

## What it does

- Loads locally bundled VRM avatars with Three.js and `three-vrm`.
- Uses MediaPipe Holistic landmarks plus Kalidokit solving for face, pose, and hand rigging.
- Requests camera access only after the visitor presses **Enable camera**.
- Shows a mirrored camera preview with landmark guides alongside the animated avatar.
- Supports avatar switching and the original model-specific accessory / eye adjustment controls.

## Run

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:8080/projects/camera-avatar-capture/
```

Camera access requires `localhost` or HTTPS and an explicit browser permission grant. The demo does not upload camera frames; tracking runs in the browser.

## Bundled assets

The project keeps the original browser runtime assets locally so the demo works without a build step:

- `facetrack_files/` — Three.js, VRM loader, Kalidokit, MediaPipe scripts, and page styles.
- `npm/@mediapipe/holistic@0.5.1635989137/` — MediaPipe Holistic model/runtime files.
- `vrm/` — four locally supplied VRM avatar models.
- `assets/` — original UI and branding assets.

The source HTML preserved its original `kalidokit.glitch.me` provenance marker. Third-party runtimes and avatar assets remain subject to their respective upstream licenses and usage terms.
