(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const state = { clips: [], ffmpeg: null, loaded: false, working: false, outputUrl: "" };
  const files = $("#files");
  const drop = $("#drop");
  const clips = $("#clips");
  const log = $("#log");
  const status = $("#status");

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  }

  function setStatus(message, tone = "") {
    status.textContent = message;
    status.className = `status ${tone}`;
  }

  function setLog(message) {
    log.textContent = `${log.textContent === "Ready. Add clips to start." ? "" : log.textContent}\n${message}`.trim().slice(-5000);
    log.scrollTop = log.scrollHeight;
  }

  function safeName(value) {
    return (value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "merged-movie").slice(0, 80);
  }

  function extension(file) {
    const match = file.name.match(/\.([a-z0-9]{1,5})$/i);
    return match ? match[1].toLowerCase() : "mp4";
  }

  function sanitizeInputName(file, index) {
    return `clip-${String(index + 1).padStart(2, "0")}.${extension(file)}`;
  }

  function disposeOutput() {
    if (state.outputUrl) URL.revokeObjectURL(state.outputUrl);
    state.outputUrl = "";
    $("#output").classList.remove("visible");
    $("#preview").removeAttribute("src");
  }

  function render() {
    clips.replaceChildren();
    if (!state.clips.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No clips queued. Files remain in memory only until you clear the queue or close this page.";
      clips.append(empty);
    }
    state.clips.forEach((clip, index) => {
      const row = document.createElement("article");
      row.className = "clip";
      const number = document.createElement("span");
      number.className = "number";
      number.textContent = index + 1;
      const meta = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = clip.name;
      const detail = document.createElement("span");
      detail.textContent = `${formatBytes(clip.size)} · ${clip.type || "video file"}`;
      meta.append(title, detail);
      const actions = document.createElement("div");
      actions.className = "clip-actions";
      [["↑", "Move earlier", () => moveClip(index, -1), index === 0], ["↓", "Move later", () => moveClip(index, 1), index === state.clips.length - 1], ["×", "Remove clip", () => removeClip(index), false]].forEach(([symbol, label, action, disabled]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tiny";
        button.textContent = symbol;
        button.title = label;
        button.setAttribute("aria-label", label);
        button.disabled = disabled || state.working;
        button.addEventListener("click", action);
        actions.append(button);
      });
      row.append(number, meta, actions);
      clips.append(row);
    });
    const merge = $("#merge");
    merge.disabled = state.working || state.clips.length < 2;
    merge.textContent = state.working ? "Merging locally…" : state.clips.length < 2 ? "Queue at least 2 clips" : "Merge clips locally";
    $("#clear").disabled = state.working || !state.clips.length;
  }

  function moveClip(index, offset) {
    const next = index + offset;
    if (next < 0 || next >= state.clips.length) return;
    [state.clips[index], state.clips[next]] = [state.clips[next], state.clips[index]];
    disposeOutput();
    render();
  }

  function removeClip(index) {
    state.clips.splice(index, 1);
    disposeOutput();
    render();
  }

  function addFiles(fileList) {
    const candidates = [...fileList].filter((file) => file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name));
    if (!candidates.length) {
      setStatus("Choose MP4, WebM, or MOV video clips.", "error");
      return;
    }
    state.clips.push(...candidates);
    disposeOutput();
    setStatus(`${candidates.length} clip${candidates.length === 1 ? "" : "s"} added. Arrange the timeline, then merge.`);
    render();
  }

  async function loadRuntime() {
    if (state.loaded) return;
    if (!window.FFmpegWASM || !window.FFmpegUtil) throw new Error("The FFmpeg.wasm library could not load. Check the network connection and reload.");
    const { FFmpeg } = window.FFmpegWASM;
    const runtime = $("#runtime");
    runtime.textContent = "Loading FFmpeg.wasm core…";
    setStatus("Downloading the FFmpeg.wasm runtime. This happens once per tab.");
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => setLog(message));
    ffmpeg.on("progress", ({ progress }) => setStatus(`Merging locally… ${Math.min(99, Math.round(progress * 100))}%`));
    await ffmpeg.load({
      coreURL: new URL("./vendor/ffmpeg-core.js", window.location.href).href,
      wasmURL: new URL("./vendor/ffmpeg-core.wasm", window.location.href).href,
    });
    state.ffmpeg = ffmpeg;
    state.loaded = true;
    runtime.textContent = "FFmpeg.wasm core loaded";
    $("#runtime-detail").textContent = "Ready in this tab. Your clips are still processed locally in FFmpeg’s in-memory filesystem.";
    setLog("FFmpeg.wasm runtime loaded.");
  }

  async function merge() {
    if (state.working || state.clips.length < 2) return;
    state.working = true;
    disposeOutput();
    log.textContent = "Preparing local FFmpeg filesystem…";
    render();
    try {
      await loadRuntime();
      const { fetchFile } = window.FFmpegUtil;
      const inputNames = [];
      for (let index = 0; index < state.clips.length; index += 1) {
        const inputName = sanitizeInputName(state.clips[index], index);
        inputNames.push(inputName);
        setStatus(`Copying clip ${index + 1} of ${state.clips.length} into local FFmpeg memory…`);
        await state.ffmpeg.writeFile(inputName, await fetchFile(state.clips[index]));
      }
      const outputName = `${safeName($("#name").value)}.mp4`;
      const mode = $("#mode").value;
      let args;
      if (mode === "copy") {
        const listName = "timeline.txt";
        await state.ffmpeg.writeFile(listName, inputNames.map((name) => `file '${name}'`).join("\n"));
        args = ["-f", "concat", "-safe", "0", "-i", listName, "-c", "copy", "-movflags", "+faststart", outputName];
      } else {
        const inputs = inputNames.flatMap((name) => ["-i", name]);
        const streams = inputNames.map((_, index) => `[${index}:v:0][${index}:a:0]`).join("");
        const filter = `${streams}concat=n=${inputNames.length}:v=1:a=1[v][a]`;
        args = [...inputs, "-filter_complex", filter, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "25", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", outputName];
      }
      setLog(`ffmpeg ${args.join(" ")}`);
      setStatus("Merging clips locally…");
      const code = await state.ffmpeg.exec(args);
      if (code !== 0) throw new Error(`FFmpeg exited with code ${code}. Try Compatibility mode, or use clips with both video and audio tracks.`);
      const data = await state.ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      state.outputUrl = URL.createObjectURL(blob);
      const download = $("#download");
      download.href = state.outputUrl;
      download.download = outputName;
      $("#preview").src = state.outputUrl;
      $("#output-meta").textContent = `${state.clips.length} clips merged locally · ${formatBytes(blob.size)} MP4 output`;
      $("#output").classList.add("visible");
      setStatus("Movie ready. Preview it or download the local MP4 output.", "success");
      setLog(`Wrote ${outputName} (${formatBytes(blob.size)}).`);
      for (const name of [...inputNames, outputName, "timeline.txt"]) { try { await state.ffmpeg.deleteFile(name); } catch (_) { /* file was not created in this mode */ } }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Movie merge failed.";
      setStatus(message, "error");
      setLog(`ERROR: ${message}`);
    } finally {
      state.working = false;
      render();
    }
  }

  $("#choose").addEventListener("click", () => { if (!state.working) files.click(); });
  files.addEventListener("change", (event) => { addFiles(event.currentTarget.files); event.currentTarget.value = ""; });
  ["dragenter", "dragover"].forEach((type) => drop.addEventListener(type, (event) => { event.preventDefault(); if (!state.working) drop.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((type) => drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", (event) => { if (!state.working) addFiles(event.dataTransfer.files); });
  $("#clear").addEventListener("click", () => { state.clips = []; disposeOutput(); setStatus("Queue cleared. Clip data was released from this page."); render(); });
  $("#merge").addEventListener("click", merge);
  window.movieMergeWasm = { addFiles, merge, loadRuntime, state };
  window.addEventListener("beforeunload", () => { disposeOutput(); state.ffmpeg?.terminate(); });
  render();
})();
