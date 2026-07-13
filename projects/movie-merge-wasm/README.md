# Movie Merge WASM

A browser-only movie-merging demo using the real [`@ffmpeg/ffmpeg` 0.12.10](https://www.npmjs.com/package/@ffmpeg/ffmpeg) UMD runtime and pinned `@ffmpeg/core` 0.12.6 core files.

## Flow

1. Add at least two MP4, WebM, or MOV clips and order them.
2. The first merge loads the FFmpeg.wasm core from unpkg into the page.
3. Clips are copied into FFmpeg’s in-memory filesystem and merged locally.
4. The output MP4 is previewed and exposed as a temporary Blob download.

## Privacy boundary

The page has no application upload endpoint: selected video bytes stay in the browser tab and FFmpeg’s in-memory filesystem. The first use downloads the pinned WASM runtime from the CDN, which is code—not user media.

## Modes

- **Compatibility:** re-encodes the joined video as H.264/AAC MP4; appropriate for clips with different encodings/resolutions, but slower and requires each clip to contain video and audio.
- **Fast:** uses FFmpeg’s concat demuxer with stream copy; it avoids re-encoding but requires matching codecs, dimensions, frame rate, and audio layout.

## Limits

FFmpeg.wasm has substantial initial download and memory costs, and it runs on the main browser thread in this demo. Long/high-resolution movies can exhaust browser memory or take a long time. A production service should use a worker, show duration/codec preflight metadata, support clips without audio, and offer a server-side FFmpeg/libvips worker for large jobs.

## Run

```bash
npm run serve
# http://127.0.0.1:8080/projects/movie-merge-wasm/
```
