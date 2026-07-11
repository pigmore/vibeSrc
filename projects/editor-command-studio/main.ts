export {};

type Vec3 = [number, number, number];
type Material = "mint" | "purple" | "orange";
type Joint = { type: "revolute" | "prismatic" | "fixed"; min: number; max: number; drive: number };
type Entity = { id: string; name: string; position: Vec3; material: Material; joint: Joint };
type EditorState = { selectedId: string | null; activeTool: string; entities: Entity[] };
interface Command { label: string; execute(state: EditorState): void; undo(state: EditorState): void; }
interface ToolPlugin { id: string; label: string; hint: string; activate(): void; }

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const store: EditorState = { selectedId: "mesh-1", activeTool: "select", entities: [
  { id: "mesh-1", name: "Robot base", position: [0, 0, 0], material: "mint", joint: { type: "fixed", min: 0, max: 0, drive: 0 } },
  { id: "mesh-2", name: "Arm link", position: [2, 1, -1], material: "purple", joint: { type: "revolute", min: -90, max: 90, drive: 28 } },
] };

class CommandBus {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  execute(command: Command) { command.execute(store); this.undoStack.push(command); this.redoStack = []; render(command.label); }
  undo() { const command = this.undoStack.pop(); if (!command) return render("Nothing to undo"); command.undo(store); this.redoStack.push(command); render(`Undid: ${command.label}`); }
  redo() { const command = this.redoStack.pop(); if (!command) return render("Nothing to redo"); command.execute(store); this.undoStack.push(command); render(`Redid: ${command.label}`); }
  history() { return this.undoStack.map((command) => command.label); }
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}
const bus = new CommandBus();

class AddEntityCommand implements Command {
  label = "Add mesh entity"; private entity: Entity;
  constructor(index: number) { this.entity = { id: `mesh-${Date.now()}`, name: `Mesh ${index}`, position: [index * .75, 0, index * -.5], material: index % 2 ? "orange" : "mint", joint: { type: "fixed", min: 0, max: 0, drive: 0 } }; }
  execute(state: EditorState) { state.entities.push(clone(this.entity)); state.selectedId = this.entity.id; }
  undo(state: EditorState) { state.entities = state.entities.filter((entity) => entity.id !== this.entity.id); state.selectedId = state.entities[0]?.id ?? null; }
}
class PatchEntityCommand implements Command {
  label: string; private before: Entity; private after: Entity;
  constructor(label: string, id: string, patch: Partial<Entity>) { const current = entity(id)!; this.label = label; this.before = clone(current); this.after = { ...clone(current), ...patch }; }
  execute(state: EditorState) { replace(this.after, state); }
  undo(state: EditorState) { replace(this.before, state); }
}
function entity(id = store.selectedId) { return store.entities.find((item) => item.id === id) ?? null; }
function replace(next: Entity, state = store) { state.entities = state.entities.map((item) => item.id === next.id ? clone(next) : item); }

const registry: ToolPlugin[] = [
  { id: "select", label: "Select", hint: "Pick scene entities", activate() { store.activeTool = "select"; render("Select tool active"); } },
  { id: "translate", label: "Translate", hint: "Command-based transform", activate() { store.activeTool = "translate"; render("Translate tool: use inspector fields"); } },
  { id: "material", label: "Material", hint: "PBR material patch", activate() { store.activeTool = "material"; render("Material tool: choose an albedo preset"); } },
  { id: "joint", label: "Joint", hint: "Simulation contract", activate() { store.activeTool = "joint"; render("Joint tool: edit limits and drive"); } },
];

function render(message = "Ready") {
  const selected = entity();
  $("#entity-count").textContent = String(store.entities.length);
  $("#history-count").textContent = String(bus.history().length);
  $("#undo") instanceof HTMLButtonElement && (($("#undo") as HTMLButtonElement).disabled = !bus.canUndo());
  $("#redo") instanceof HTMLButtonElement && (($("#redo") as HTMLButtonElement).disabled = !bus.canRedo());
  $("#active-tool").textContent = registry.find((tool) => tool.id === store.activeTool)?.label ?? store.activeTool;
  $("#status").textContent = message;
  $("#timeline-copy").textContent = selected ? `${selected.name} · selected entity state is serializable` : "No selection";
  $("#tools").innerHTML = "";
  registry.forEach((tool) => { const button = document.createElement("button"); button.type = "button"; button.className = "tool"; button.setAttribute("aria-pressed", String(tool.id === store.activeTool)); button.innerHTML = `<b>${tool.label}</b><span>${tool.hint}</span>`; button.onclick = tool.activate; $("#tools").append(button); });
  $("#entities").innerHTML = "";
  store.entities.forEach((item) => { const button = document.createElement("button"); button.type = "button"; button.className = "entity"; button.setAttribute("aria-selected", String(item.id === store.selectedId)); button.innerHTML = `<b>◇ ${item.name}</b><small>${item.joint.type} joint · ${item.material} material</small>`; button.onclick = () => { store.selectedId = item.id; render(`Selected ${item.name}`); }; $("#entities").append(button); });
  const viewport = $("#viewport"); viewport.querySelectorAll(".object").forEach((node) => node.remove());
  store.entities.forEach((item, index) => { const node = document.createElement("button"); node.type = "button"; node.className = `object material-${item.material}${item.id === store.selectedId ? " selected" : ""}`; node.style.left = `calc(50% + ${item.position[0] * 44 - 44}px)`; node.style.top = `calc(52% - ${item.position[2] * 28 + item.position[1] * 16}px)`; node.style.transform += ` rotate(${item.joint.drive * .2}deg)`; node.textContent = item.name; node.onclick = () => { store.selectedId = item.id; render(`Selected ${item.name} in viewport`); }; viewport.append(node); });
  const disabled = !selected;
  document.querySelectorAll<HTMLInputElement>("[data-part] input").forEach((input) => { input.disabled = disabled; if (selected) input.value = String(selected.position[Number(input.dataset.axis)]); });
  const material = $("#material") as HTMLSelectElement; material.disabled = disabled; if (selected) material.value = selected.material;
  ["joint-type", "joint-min", "joint-max", "joint-drive"].forEach((id) => ($("#" + id) as HTMLInputElement | HTMLSelectElement).disabled = disabled);
  if (selected) { ($("#joint-type") as HTMLSelectElement).value = selected.joint.type; ($("#joint-min") as HTMLInputElement).value = String(selected.joint.min); ($("#joint-max") as HTMLInputElement).value = String(selected.joint.max); ($("#joint-drive") as HTMLInputElement).value = String(selected.joint.drive); }
  const history = $("#history"); history.innerHTML = bus.history().slice().reverse().map((label, index) => `<div class="history-item"><strong>${label}</strong>sequence ${bus.history().length - index} · replayable command</div>`).join("") || '<div class="history-item">No commands yet. Add a mesh or edit an inspector field.</div>';
}

$("#add").addEventListener("click", () => bus.execute(new AddEntityCommand(store.entities.length + 1)));
$("#undo").addEventListener("click", () => bus.undo()); $("#redo").addEventListener("click", () => bus.redo());
document.querySelectorAll<HTMLInputElement>("[data-part] input").forEach((input) => input.addEventListener("change", () => { const current = entity(); if (!current) return; const position: Vec3 = [...current.position] as Vec3; position[Number(input.dataset.axis)] = Number(input.value); bus.execute(new PatchEntityCommand("Patch transform component", current.id, { position })); }));
($("#material") as HTMLSelectElement).addEventListener("change", (event) => { const current = entity(); if (current) bus.execute(new PatchEntityCommand("Patch material component", current.id, { material: (event.target as HTMLSelectElement).value as Material })); });
function patchJoint(label: string) { const current = entity(); if (!current) return; const joint: Joint = { type: ($("#joint-type") as HTMLSelectElement).value as Joint["type"], min: Number(($("#joint-min") as HTMLInputElement).value), max: Number(($("#joint-max") as HTMLInputElement).value), drive: Number(($("#joint-drive") as HTMLInputElement).value) }; bus.execute(new PatchEntityCommand(label, current.id, { joint })); }
["joint-type", "joint-min", "joint-max", "joint-drive"].forEach((id) => $("#" + id).addEventListener("change", () => patchJoint("Patch joint contract")));
window.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? bus.redo() : bus.undo(); } });
render();
