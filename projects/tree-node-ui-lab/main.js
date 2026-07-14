const palette = [
  { type: 'Frame', glyph: '□', hint: 'Structural parent node' },
  { type: 'Text', glyph: 'T', hint: 'Plain content entity' },
  { type: 'Action', glyph: '↗', hint: 'Interactive intent node' },
  { type: 'Reference', glyph: '↳', hint: 'Instance a definition' }
];

const fresh = () => ({
  root: {
    id: 'root', type: 'Frame', label: 'Product card', children: [
      { id: 'title', type: 'Text', label: 'Entity-first UI' },
      { id: 'copy', type: 'Text', label: 'This is data, not a hidden component boundary.' },
      { id: 'cta', type: 'Action', label: 'Promote a node, then reuse it as a Reference.' }
    ]
  },
  definitions: {},
  selectedId: 'root'
});

let state = fresh();
const $ = (id) => document.getElementById(id);
const uuid = () => `node-${crypto.randomUUID().slice(0, 8)}`;
const find = (node, id, parent = null) => {
  if (node.id === id) return { node, parent };
  for (const child of node.children || []) { const found = find(child, id, node); if (found) return found; }
  return null;
};
const selected = () => find(state.root, state.selectedId)?.node || state.root;
const toast = (message) => { const el = $('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 1800); };

function renderPalette() {
  $('palette').innerHTML = palette.map((item) => `<button class="node-action" data-type="${item.type}"><span class="glyph">${item.glyph}</span><span><strong>${item.type}</strong><small>${item.hint}</small></span></button>`).join('');
  $('palette').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => addNode(button.dataset.type)));
}

function renderNode(node) {
  const isSelected = node.id === state.selectedId;
  const isReference = node.type === 'Reference';
  const definition = isReference ? state.definitions[node.definitionId] : null;
  const label = definition ? `${node.label} → ${definition.label}` : node.label;
  const children = node.children?.length ? `<div class="children">${node.children.map(renderNode).join('')}</div>` : '';
  return `<div class="render-node ${isSelected ? 'selected' : ''}" data-id="${node.id}" role="button" tabindex="0"><span><span class="type ${isReference ? 'ref' : ''}">${node.type}</span><span class="content">${escapeHtml(label)}</span>${children}</span></div>`;
}
function renderCanvas() {
  $('canvasRoot').innerHTML = renderNode(state.root);
  $('canvasRoot').querySelectorAll('[data-id]').forEach((element) => element.addEventListener('click', (event) => { event.stopPropagation(); state.selectedId = element.dataset.id; render(); }));
}
function treeRows(node, depth = 0) {
  const label = node.type === 'Reference' && state.definitions[node.definitionId] ? `${node.label} ↳ ${state.definitions[node.definitionId].label}` : node.label;
  const row = `<button class="tree-row ${node.id === state.selectedId ? 'selected' : ''}" data-id="${node.id}"><span class="indent" style="--depth:${depth}"></span><span class="tree-type">${node.type}</span><span>${escapeHtml(label)}</span></button>`;
  return row + (node.children || []).map((child) => treeRows(child, depth + 1)).join('');
}
function renderTree() {
  $('tree').innerHTML = treeRows(state.root);
  $('tree').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { state.selectedId = button.dataset.id; render(); }));
}
function renderDefinitions() {
  const entries = Object.values(state.definitions);
  $('definitions').innerHTML = entries.length ? entries.map((definition) => `<div class="definition"><code>${definition.id}</code><br>${escapeHtml(definition.label)}</div>`).join('') : '<div class="inspector-empty">No reusable definitions yet. Select a node and promote it.</div>';
}
function renderInspector() {
  const node = selected();
  const target = $('inspector');
  const refOptions = Object.values(state.definitions).map((definition) => `<option value="${definition.id}" ${node.definitionId === definition.id ? 'selected' : ''}>${escapeHtml(definition.label)}</option>`).join('');
  target.innerHTML = `<div class="field"><span>Entity ID</span><input value="${node.id}" disabled></div><div class="field"><span>Node type</span><input value="${node.type}" disabled></div><label class="field"><span>Label</span><input id="labelInput" value="${escapeAttribute(node.label)}"></label>${node.type === 'Reference' ? `<label class="field"><span>Definition target</span><select id="definitionSelect"><option value="">Choose definition</option>${refOptions}</select></label>` : ''}<div class="inspector-actions"><button class="button primary" id="saveNode">Save entity</button>${node.id !== 'root' ? '<button class="button" id="promote">Promote to reusable definition</button><button class="button danger" id="remove">Remove node</button>' : ''}</div>`;
  $('saveNode').onclick = () => { node.label = $('labelInput').value.trim() || node.type; if (node.type === 'Reference') node.definitionId = $('definitionSelect').value; render(); toast('Tree entity saved'); };
  if ($('promote')) $('promote').onclick = () => promote(node);
  if ($('remove')) $('remove').onclick = () => remove(node.id);
}
function addNode(type) {
  const parent = selected();
  const target = parent.type === 'Text' || parent.type === 'Action' || parent.type === 'Reference' ? find(state.root, parent.id).parent : parent;
  const node = { id: uuid(), type, label: type === 'Text' ? 'New text node' : type === 'Action' ? 'New action' : type === 'Reference' ? 'Reusable instance' : 'New frame', children: type === 'Frame' ? [] : undefined, definitionId: type === 'Reference' ? Object.keys(state.definitions)[0] || '' : undefined };
  (target.children ||= []).push(node); state.selectedId = node.id; render(); toast(`${type} node added`);
}
function promote(node) {
  const id = `def-${node.id}`;
  state.definitions[id] = structuredClone({ ...node, id, children: node.children || [] });
  toast(`${node.label} is now a reusable definition`); render();
}
function remove(id) {
  const entry = find(state.root, id); if (!entry?.parent) return;
  entry.parent.children = entry.parent.children.filter((child) => child.id !== id); state.selectedId = entry.parent.id; render(); toast('Node removed');
}
function escapeHtml(value = '') { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function escapeAttribute(value = '') { return escapeHtml(value).replace(/"/g, '&quot;'); }
function render() { renderCanvas(); renderTree(); renderDefinitions(); renderInspector(); $('selection').textContent = `${selected().type} · ${selected().id}`; }

$('reset').onclick = () => { state = fresh(); render(); toast('Scene reset'); };
$('export').onclick = async () => { await navigator.clipboard.writeText(JSON.stringify({ root: state.root, definitions: state.definitions }, null, 2)); toast('Tree JSON copied'); };
renderPalette(); render();
