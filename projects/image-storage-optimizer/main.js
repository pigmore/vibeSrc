(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const state = { entries: [], processing: false };
  const fileInput = $("#file-input");
  const dropzone = $("#dropzone");
  const formatInput = $("#format");
  const qualityInput = $("#quality");
  const dimensionInput = $("#max-dimension");
  const results = $("#results");
  const status = $("#status");

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  }

  function reduction(original, optimized) {
    if (!original) return 0;
    return Math.round((1 - optimized / original) * 100);
  }

  function outputExtension(type) {
    return { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" }[type] || "image";
  }

  function setStatus(message, tone = "") {
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function safeOutputName(file, type) {
    const stem = file.name.replace(/\.[^/.]+$/, "") || "optimized-image";
    return `${stem}-optimized.${outputExtension(type)}`;
  }

  async function decodeImage(file) {
    if ("createImageBitmap" in window) return createImageBitmap(file);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("This browser could not decode the image.")); image.src = url; });
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(`The browser could not encode ${type}.`)), type, quality);
    });
  }

  async function optimize(file) {
    if (!file.type.startsWith("image/")) throw new Error("Only image files can be optimized.");
    const source = await decodeImage(file);
    const maxDimension = Math.max(320, Math.min(8192, Number(dimensionInput.value) || 1920));
    const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (formatInput.value === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(source, 0, 0, width, height);
    source.close?.();
    const type = formatInput.value;
    const blob = await canvasBlob(canvas, type, type === "image/png" ? undefined : Number(qualityInput.value) / 100);
    return { blob, width, height, type };
  }

  function renderSummary() {
    const original = state.entries.reduce((total, entry) => total + entry.file.size, 0);
    const optimized = state.entries.reduce((total, entry) => total + (entry.result?.blob.size || 0), 0);
    $("#original-total").textContent = formatBytes(original);
    $("#optimized-total").textContent = formatBytes(optimized);
    $("#savings-total").textContent = original && optimized ? `${reduction(original, optimized)}%` : "0%";
    $("#summary").classList.toggle("visible", state.entries.length > 0);
    $("#clear-all").disabled = state.entries.length === 0 || state.processing;
  }

  function removeEntry(id) {
    const index = state.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    const [entry] = state.entries.splice(index, 1);
    if (entry.result?.url) URL.revokeObjectURL(entry.result.url);
    if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl);
    render();
  }

  function renderEntry(entry) {
    const wrapper = document.createElement("article");
    wrapper.className = `result ${entry.error ? "error" : ""}`;
    const preview = document.createElement("div");
    preview.className = "preview";
    if (entry.originalUrl) {
      const image = document.createElement("img");
      image.src = entry.originalUrl;
      image.alt = "";
      preview.append(image);
    } else preview.textContent = "!";

    const body = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = entry.file.name;
    const meta = document.createElement("div");
    meta.className = "result-meta";
    if (entry.error) {
      meta.textContent = entry.error;
    } else if (!entry.result) {
      meta.textContent = "Optimizing locally…";
    } else {
      const saving = reduction(entry.file.size, entry.result.blob.size);
      meta.innerHTML = `<span class="pill">${formatBytes(entry.file.size)} → ${formatBytes(entry.result.blob.size)}</span><span class="pill">${entry.result.width}×${entry.result.height}</span><span class="pill">${outputExtension(entry.result.type).toUpperCase()}</span><span class="saving">${saving >= 0 ? `${saving}% smaller` : `${Math.abs(saving)}% larger`}</span>`;
    }
    body.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "result-actions";
    if (entry.result) {
      const download = document.createElement("a");
      download.className = "download";
      download.href = entry.result.url;
      download.download = safeOutputName(entry.file, entry.result.type);
      download.textContent = "Download";
      actions.append(download);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeEntry(entry.id));
    actions.append(remove);
    wrapper.append(preview, body, actions);
    return wrapper;
  }

  function render() {
    results.replaceChildren();
    if (!state.entries.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No images yet. Add a sample image to compare the original and optimized storage size.";
      results.append(empty);
    } else state.entries.forEach((entry) => results.append(renderEntry(entry)));
    renderSummary();
  }

  async function processFiles(files) {
    const candidates = [...files].filter((file) => file.type.startsWith("image/"));
    if (!candidates.length) {
      setStatus("Choose PNG, JPEG, WebP, or AVIF image files.", "error");
      return;
    }
    state.processing = true;
    const entries = candidates.map((file) => ({ id: crypto.randomUUID(), file, originalUrl: URL.createObjectURL(file), result: null, error: "" }));
    state.entries.push(...entries);
    render();
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      setStatus(`Optimizing ${index + 1} of ${entries.length}: ${entry.file.name}`);
      try {
        entry.result = await optimize(entry.file);
        entry.result.url = URL.createObjectURL(entry.result.blob);
      } catch (error) {
        entry.error = error instanceof Error ? error.message : "Image optimization failed.";
      }
      render();
    }
    state.processing = false;
    const complete = entries.filter((entry) => entry.result).length;
    setStatus(`${complete} image${complete === 1 ? "" : "s"} optimized locally. Download individual files below.`, complete ? "success" : "error");
    render();
  }

  async function createSampleFile() {
    const canvas = document.createElement("canvas");
    canvas.width = 2880;
    canvas.height = 1920;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#fa5a82");
    gradient.addColorStop(.48, "#59dccf");
    gradient.addColorStop(1, "#3974e8");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 440; index += 1) {
      context.fillStyle = `hsla(${(index * 29) % 360}, 76%, ${42 + (index % 5) * 8}%, .72)`;
      context.fillRect((index * 97) % canvas.width, (index * 151) % canvas.height, 64 + (index % 9) * 38, 42 + (index % 7) * 27);
    }
    const blob = await canvasBlob(canvas, "image/png");
    return new File([blob], "storage-sample.png", { type: "image/png" });
  }

  function chooseFiles() { if (!state.processing) fileInput.click(); }
  async function trySample() {
    if (state.processing) return;
    try { await processFiles([await createSampleFile()]); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not create the sample image.", "error"); }
  }

  $("#choose-files").addEventListener("click", chooseFiles);
  $("#try-sample").addEventListener("click", trySample);
  fileInput.addEventListener("change", (event) => { processFiles(event.currentTarget.files); event.currentTarget.value = ""; });
  ["dragenter", "dragover"].forEach((type) => dropzone.addEventListener(type, (event) => { event.preventDefault(); if (!state.processing) dropzone.classList.add("drag-active"); }));
  ["dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.remove("drag-active"); }));
  dropzone.addEventListener("drop", (event) => { if (!state.processing) processFiles(event.dataTransfer.files); });
  qualityInput.addEventListener("input", () => { $("#quality-value").textContent = `${qualityInput.value}%`; });
  $("#clear-all").addEventListener("click", () => { state.entries.forEach((entry) => { if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl); if (entry.result?.url) URL.revokeObjectURL(entry.result.url); }); state.entries = []; setStatus("Results cleared. Ready for another batch."); render(); });
  window.addEventListener("beforeunload", () => state.entries.forEach((entry) => { if (entry.originalUrl) URL.revokeObjectURL(entry.originalUrl); if (entry.result?.url) URL.revokeObjectURL(entry.result.url); }));
  window.imageStorageOptimizer = { processFiles, trySample };
  render();
})();
