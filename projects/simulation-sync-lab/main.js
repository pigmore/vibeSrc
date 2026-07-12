const $ = (selector) => document.querySelector(selector);
const state = {
  revision: 0, selectedId: "robot-arm", target: "Isaac Sim", format: "USD", events: [],
  assets: new Map([
    ["robot-arm", { id: "robot-arm", name: "Robot arm", source: "glTF mesh", transform: [0, .8, 0], material: "steel-blue", joint: { type: "revolute", lower: -2.1, upper: 2.1 } }],
    ["wrist-joint", { id: "wrist-joint", name: "Wrist joint", source: "MJCF joint", transform: [.5, 1.15, 0], material: "amber", joint: { type: "revolute", lower: -1.57, upper: 1.57 } }],
    ["workbench", { id: "workbench", name: "Workbench", source: "USD prim", transform: [0, 0, -1.6], material: "matte-gray" }],
  ]),
};
const formats = ["USD", "MJCF", "SDF", "glTF"];
function selected() { return state.assets.get(state.selectedId); }
function emitSceneState(publishAt = 0) {
  window.dispatchEvent(new CustomEvent("sync-lab-state", { detail: {
    assets: [...state.assets.values()].map((asset) => ({ id: asset.id, name: asset.name, transform: [...asset.transform] })),
    selectedId: state.selectedId,
    revision: state.revision,
    target: state.target,
    publishAt
  }}));
}
function adapterPreview(asset) {
  const [x,y,z] = asset.transform.map((value) => Number(value.toFixed(3)));
  const joint = asset.joint;
  if (state.format === "USD") return `#usda 1.0\n(\n  defaultPrim = "${asset.id}"\n)\ndef Xform "${asset.id}" {\n  double3 xformOp:translate = (${x}, ${y}, ${z})\n  uniform token[] xformOpOrder = ["xformOp:translate"]\n  custom string editor:revision = "${state.revision}"\n}`;
  if (state.format === "MJCF") return `<mujoco model="vibesrc-sync">\n  <worldbody>\n    <body name="${asset.id}" pos="${x} ${y} ${z}">\n      ${joint ? `<joint type="${joint.type === "revolute" ? "hinge" : "slide"}" range="${joint.lower} ${joint.upper}" limited="true" />` : "<geom type=\"mesh\" />"}\n    </body>\n  </worldbody>\n</mujoco>`;
  if (state.format === "SDF") return `<sdf version="1.10">\n  <model name="${asset.id}">\n    <pose>${x} ${y} ${z} 0 0 0</pose>\n    <link name="${asset.id}_link" />\n  </model>\n</sdf>`;
  return JSON.stringify({ asset: { version: "2.0", generator: "vibeSrc Simulation Sync Lab" }, nodes: [{ name: asset.id, translation: [x,y,z], extras: { revision: state.revision, material: asset.material, joint } }] }, null, 2);
}
function patchFor(asset) { return { op: "transform.patch", entityId: asset.id, revision: state.revision, clock: `browser:${state.revision}`, target: state.target, translation: asset.transform.map((value) => Number(value.toFixed(3))), source: asset.source }; }
function select(id) { state.selectedId = id; render(); }
function setTransform(axis, value) { const asset = selected(); if (!Number.isFinite(value)) return; asset.transform[axis] = value; state.revision += 1; state.events.unshift({ kind: "local edit", text: `Updated ${asset.id}.translation[${axis}]`, time: new Date().toLocaleTimeString() }); state.events = state.events.slice(0, 7); render(); }
function publish() { const patch = patchFor(selected()); state.events.unshift({ kind: `published → ${state.target}`, text: JSON.stringify(patch), time: new Date().toLocaleTimeString() }); state.events = state.events.slice(0, 7); $("#status").textContent = `Published revision ${state.revision} transform patch to the ${state.target} adapter queue.`; renderEvents(); emitSceneState(performance.now()); }
function exportContract() { const asset = selected(); const text = adapterPreview(asset); const blob = new Blob([text + "\n"], { type: "text/plain" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${asset.id}.${state.format === "USD" ? "usda" : state.format === "glTF" ? "gltf.json" : state.format.toLowerCase()}`; link.click(); URL.revokeObjectURL(link.href); $("#status").textContent = `Exported ${state.format} adapter preview for ${asset.id}.`; }
function renderAssets() { $("#revision").textContent = `rev ${state.revision}`; $("#assets").innerHTML = [...state.assets.values()].map((asset) => `<button type="button" class="asset ${asset.id === state.selectedId ? "selected" : ""}" data-id="${asset.id}"><i></i><span><strong>${asset.name}</strong><small>${asset.source} · ${asset.id}</small></span></button>`).join(""); document.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => select(button.dataset.id)));
  const asset = selected(); document.querySelectorAll("[data-axis]").forEach((input) => { input.value = asset.transform[input.dataset.axis]; input.onchange = (event) => setTransform(Number(event.currentTarget.dataset.axis), Number(event.currentTarget.value)); });
}
function renderEngines() { const names = ["Isaac Sim", "MuJoCo", "Unreal", "Genesis"]; $("#engines").innerHTML = names.map((name) => `<div class="engine ${name === state.target ? "connected" : ""}">${name}<br><small>${name === state.target ? "adapter selected" : "available bridge"}</small></div>`).join(""); }
function renderFormats() { $("#format-label").textContent = state.format; $("#formats").innerHTML = formats.map((format) => `<button type="button" class="format ${format === state.format ? "active" : ""}" data-format="${format}">${format}</button>`).join(""); document.querySelectorAll("[data-format]").forEach((button) => button.addEventListener("click", () => { state.format = button.dataset.format; renderFormats(); renderPreview(); })); }
function renderPreview() { $("#preview").textContent = adapterPreview(selected()); }
function renderEvents() { $("#events").innerHTML = state.events.length ? state.events.map((event) => `<article class="event"><strong>${event.kind}</strong><br>${event.text}<br><small>${event.time}</small></article>`).join("") : '<article class="event">No patches yet. Change the selected transform, then publish it to an adapter queue.</article>'; }
function render() { renderAssets(); renderEngines(); renderFormats(); renderPreview(); renderEvents(); emitSceneState(); }
$("#target").addEventListener("change", (event) => { state.target = event.target.value; $("#status").textContent = `Routing future patches through the ${state.target} adapter.`; renderEngines(); emitSceneState(); });
window.addEventListener("sync-lab-select", (event) => { if (state.assets.has(event.detail.id)) select(event.detail.id); });
$("#publish").addEventListener("click", publish); $("#export").addEventListener("click", exportContract); render();
