const $ = (selector) => document.querySelector(selector);
const clone = (value) => structuredClone(value);

const state = {
  revision: 0,
  selectedId: "arm-base",
  activeTool: "select",
  entities: new Map([
    ["arm-base", { id: "arm-base", name: "Robot base", kind: "mesh", position: [-1.4, 0, 0], rotation: [0, 0, 0], material: { color: "#82b8ff", roughness: .35 } }],
    ["shoulder-joint", { id: "shoulder-joint", name: "Shoulder joint", kind: "joint", position: [.2, .25, 0], rotation: [0, 0, 0], material: { color: "#ffd37d", roughness: .5 }, joint: { type: "revolute", lower: -120, upper: 120, drive: 50 } }],
    ["tool-head", { id: "tool-head", name: "Tool head", kind: "mesh", position: [1.55, -.55, 0], rotation: [0, 0, 0], material: { color: "#b9a4ff", roughness: .25 } }],
  ]),
};

class CommandBus {
  constructor() { this.undoStack = []; this.redoStack = []; this.log = []; }
  execute(command) { command.execute(state); state.revision += 1; this.undoStack.push(command); this.redoStack = []; this.log.unshift({ label: command.label, payload: command.serialize() }); this.log = this.log.slice(0, 8); render(); }
  undo() { const command = this.undoStack.pop(); if (!command) return; command.undo(state); state.revision += 1; this.redoStack.push(command); this.log.unshift({ label: `Undo ${command.label}`, payload: command.serialize() }); this.log = this.log.slice(0, 8); render(); }
  redo() { const command = this.redoStack.pop(); if (!command) return; command.execute(state); state.revision += 1; this.undoStack.push(command); this.log.unshift({ label: `Redo ${command.label}`, payload: command.serialize() }); this.log = this.log.slice(0, 8); render(); }
}
const bus = new CommandBus();

function updateEntity(id, patch, label) {
  const before = clone(state.entities.get(id));
  const after = { ...clone(before), ...patch, material: { ...before.material, ...(patch.material || {}) }, joint: before.joint ? { ...before.joint, ...(patch.joint || {}) } : undefined };
  return {
    label,
    execute: (scene) => scene.entities.set(id, clone(after)),
    undo: (scene) => scene.entities.set(id, clone(before)),
    serialize: () => ({ type: "updateEntity", entityId: id, patch }),
  };
}
function addEntity(entity) {
  return { label: `Add ${entity.name}`, execute: (scene) => scene.entities.set(entity.id, clone(entity)), undo: (scene) => { scene.entities.delete(entity.id); if (scene.selectedId === entity.id) scene.selectedId = null; }, serialize: () => ({ type: "addEntity", entity }) };
}

const plugins = [
  { id: "select", label: "Select", shortcut: "V", description: "Choose a scene entity", hint: "Select tool: click a mesh, then edit it through commands." },
  { id: "translate", label: "Translate", shortcut: "G", description: "Nudge transform through a command", hint: "Translate tool: choose Nudge +X or edit position values." },
  { id: "material", label: "Material", shortcut: "M", description: "Patch material state", hint: "Material tool: update color and roughness as a reversible command." },
  { id: "joint", label: "Joint config", shortcut: "J", description: "Configure limits and drive", hint: "Joint tool: configure revolute/prismatic limits on joint entities." },
];
function setTool(id) { state.activeTool = id; render(); }
function select(id) { state.selectedId = id; render(); }

function renderTools() {
  $("#plugin-count").textContent = `${plugins.length} registered`;
  $("#tools").innerHTML = plugins.map((tool) => `<button class="button tool ${state.activeTool === tool.id ? "active" : ""}" data-tool="${tool.id}" type="button"><strong>${tool.shortcut} · ${tool.label}</strong><span>${tool.description}</span></button>`).join("");
  document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => setTool(button.dataset.tool)));
  const active = plugins.find((tool) => tool.id === state.activeTool);
  $("#active-tool").textContent = `${active.label} tool`;
  $("#hint").textContent = active.hint;
}
function renderEntities() {
  $("#entity-count").textContent = `${state.entities.size} entities`;
  $("#entities").innerHTML = [...state.entities.values()].map((entity) => `<button type="button" class="entity ${entity.id === state.selectedId ? "selected" : ""}" data-entity="${entity.id}"><i style="background:${entity.material.color}"></i><span><strong>${entity.name}</strong><small>${entity.kind} · ${entity.id}</small></span></button>`).join("");
  document.querySelectorAll("[data-entity]").forEach((button) => button.addEventListener("click", () => select(button.dataset.entity)));
}
function renderObjects() {
  $("#objects").innerHTML = [...state.entities.values()].map((entity) => {
    const [x, y] = entity.position;
    const className = `object ${entity.kind === "joint" ? "joint" : ""} ${entity.id === state.selectedId ? "selected" : ""}`;
    const translate = `translate(calc(-50% + ${x * 78}px), calc(-50% + ${-y * 78}px)) rotate(${entity.rotation[2]}deg)`;
    return `<button type="button" class="${className}" data-entity="${entity.id}" style="left:50%;top:50%;transform:${translate};border-color:${entity.id === state.selectedId ? "" : entity.material.color}"><span class="name">${entity.name}</span><span class="tag">${entity.kind}</span></button>`;
  }).join("");
  $("#objects").querySelectorAll("[data-entity]").forEach((button) => button.addEventListener("click", () => select(button.dataset.entity)));
}
function numberField(label, key, value, step = .1) { return `<label class="field">${label}<input data-field="${key}" type="number" step="${step}" value="${value}" /></label>`; }
function renderInspector() {
  const entity = state.entities.get(state.selectedId);
  if (!entity) { $("#inspector").innerHTML = '<p class="empty">Select an entity to inspect its component data.</p>'; return; }
  const isJoint = entity.kind === "joint";
  $("#inspector").innerHTML = `
    <label class="field">Entity name<input id="entity-name" value="${entity.name}" /></label>
    <p class="label" style="margin:18px 14px 7px">Transform component</p>
    <div class="vector">${numberField("X", "position.0", entity.position[0])}${numberField("Y", "position.1", entity.position[1])}${numberField("Z", "position.2", entity.position[2])}</div>
    <div class="actions"><button class="button" id="nudge-left" type="button">← X</button><button class="button" id="nudge-right" type="button">+X →</button><button class="button" id="rotate" type="button">Rotate Z</button></div>
    <p class="label" style="margin:18px 14px 7px">Material component</p>
    <label class="field">Base color<input id="material-color" type="color" value="${entity.material.color}" /></label>
    ${numberField("Roughness", "roughness", entity.material.roughness, .05)}
    ${isJoint ? `<p class="label" style="margin:18px 14px 7px">Joint component</p><label class="field">Joint type<select id="joint-type"><option value="revolute" ${entity.joint.type === "revolute" ? "selected" : ""}>revolute</option><option value="prismatic" ${entity.joint.type === "prismatic" ? "selected" : ""}>prismatic</option></select></label><div class="vector">${numberField("Lower", "joint.lower", entity.joint.lower, 1)}${numberField("Upper", "joint.upper", entity.joint.upper, 1)}${numberField("Drive", "joint.drive", entity.joint.drive, 1)}</div>` : '<p class="empty">Joint controls are available when a joint entity is selected.</p>'}`;
  $("#entity-name").addEventListener("change", (event) => bus.execute(updateEntity(entity.id, { name: event.target.value || entity.name }, "Rename entity")));
  document.querySelectorAll("[data-field]").forEach((input) => input.addEventListener("change", (event) => {
    const value = Number(event.target.value); if (!Number.isFinite(value)) return;
    const [section, key] = event.target.dataset.field.split(".");
    if (section === "position") { const position = [...entity.position]; position[Number(key)] = value; bus.execute(updateEntity(entity.id, { position }, "Transform position")); }
    if (section === "roughness") bus.execute(updateEntity(entity.id, { material: { roughness: Math.max(0, Math.min(1, value)) } }, "Update material"));
    if (section === "joint") bus.execute(updateEntity(entity.id, { joint: { [key]: value } }, "Configure joint"));
  }));
  $("#material-color").addEventListener("input", (event) => bus.execute(updateEntity(entity.id, { material: { color: event.target.value } }, "Update material color")));
  $("#nudge-left").addEventListener("click", () => { const position = [...entity.position]; position[0] -= .25; bus.execute(updateEntity(entity.id, { position }, "Translate -X")); });
  $("#nudge-right").addEventListener("click", () => { const position = [...entity.position]; position[0] += .25; bus.execute(updateEntity(entity.id, { position }, "Translate +X")); });
  $("#rotate").addEventListener("click", () => { const rotation = [...entity.rotation]; rotation[2] += 15; bus.execute(updateEntity(entity.id, { rotation }, "Rotate Z")); });
  if (isJoint) $("#joint-type").addEventListener("change", (event) => bus.execute(updateEntity(entity.id, { joint: { type: event.target.value } }, "Set joint type")));
}
function renderHistory() {
  $("#revision").textContent = `Revision ${state.revision}`;
  $("#undo").disabled = !bus.undoStack.length; $("#redo").disabled = !bus.redoStack.length;
  $("#history").innerHTML = bus.log.length ? bus.log.map((entry, index) => `<div class="history-row ${index === 0 ? "latest" : ""}"><strong>${entry.label}</strong><br>${entry.payload.type || "scene command"}</div>`).join("") : '<p class="empty">Commands appear here as serializable scene patches.</p>';
}
function render() { renderTools(); renderEntities(); renderObjects(); renderInspector(); renderHistory(); }

$("#undo").addEventListener("click", () => bus.undo());
$("#redo").addEventListener("click", () => bus.redo());
$("#add-mesh").addEventListener("click", () => { const count = state.entities.size + 1; const entity = { id: `mesh-${Date.now()}`, name: `Mesh ${count}`, kind: "mesh", position: [0, 0, 0], rotation: [0, 0, 0], material: { color: "#5eead4", roughness: .45 } }; bus.execute(addEntity(entity)); select(entity.id); });
window.addEventListener("keydown", (event) => { if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") return; if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? bus.redo() : bus.undo(); return; } const plugin = plugins.find((tool) => tool.shortcut.toLowerCase() === event.key.toLowerCase()); if (plugin) setTool(plugin.id); });
render();
