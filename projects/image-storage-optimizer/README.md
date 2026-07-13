# Image Storage Optimizer

A dependency-free, TinyPNG-style browser demo for reducing image storage cost before upload or archival.

## What it does

- Accepts a batch of PNG, JPEG, WebP, and AVIF images through a file picker or drag-and-drop.
- Decodes images locally in the browser.
- Optionally downscales large images to a chosen maximum dimension.
- Re-encodes outputs as WebP, JPEG, or lossless PNG.
- Shows original size, optimized size, dimensions, output type, and per-image storage reduction.
- Creates individual download links for the optimized local `Blob` outputs.

## Privacy boundary

There is **no upload endpoint**. Image bytes remain in the active browser tab; the demo uses browser image decoding and Canvas APIs only. Reloading the page or clearing results releases its generated Blob URLs.

## Controls

- **Output format:** WebP is the recommended compact default; use JPEG for broader compatibility or PNG for lossless output/transparent-source safety.
- **Quality:** Applies to WebP and JPEG output. PNG intentionally ignores it.
- **Maximum dimension:** Large images are proportionally downscaled; smaller images keep their original dimensions.
- **Try generated sample:** Creates a local large PNG so the complete resize/re-encode/download path can be inspected without selecting a file.

## Intentional limits

This is a front-end architecture demo, not a replacement for an image-processing service. Browser support for AVIF input/output varies, metadata is not retained, animated images are flattened to one frame, and very large images can still exceed device memory. A production storage pipeline should validate MIME bytes on the server, handle EXIF orientation, create responsive derivatives, preserve or explicitly strip metadata, and use an image processor such as libvips or Sharp.

## Run

```bash
npm run serve
# http://127.0.0.1:8080/projects/image-storage-optimizer/
```
