(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#viewport");
  const context = canvas.getContext("2d");
  const COLORS = ["#5eead4", "#b6a3ff", "#ffd27c", "#ff91a4", "#82b8ff"];
  if (!window.ApeECS || !context) { $("#status").textContent = "Ape ECS browser build or Canvas 2D is unavailable."; return; }

  // These are real ApeECS.Component definitions and are registered on the World below.
  class Position extends ApeECS.Component {}
  Position.properties = { x: 0, y: 0 };
  class Velocity extends ApeECS.Component {}
  Velocity.properties = { x: 0, y: 0 };
  class Renderable extends ApeECS.Component {}
  Renderable.properties = { color: "#5eead4", radius: 7 };
  class Lifetime extends ApeECS.Component {}
  Lifetime.properties = { age: 0, max: 12 };
  class FrameInfo extends ApeECS.Component {}
  FrameInfo.properties = { delta: 1 / 60 };
  class Glow extends ApeECS.Component {}
  Glow.properties = { intensity: 0.8 };

  const world = new ApeECS.World({ trackChanges: true });
  for (const component of [Position, Velocity, Renderable, Lifetime, FrameInfo, Glow]) world.registerComponent(component, 32);
  world.registerTags("Simulated");
  const frame = world.createEntity({ id: "frame", c: { frameInfo: { type: "FrameInfo", delta: 1 / 60 } } });

  class GravitySystem extends ApeECS.System {
    init() { this.query = this.createQuery().fromAll("Position", "Velocity", "Simulated").persist(); }
    update() {
      const dt = this.world.getEntity("frame").c.frameInfo.delta;
      for (const entity of this.query.execute()) {
        entity.c.velocity.y += 240 * dt;
        entity.c.velocity.update();
      }
    }
  }
  class IntegrateSystem extends ApeECS.System {
    init() { this.query = this.createQuery().fromAll("Position", "Velocity", "Simulated").persist(); }
    update() {
      const dt = this.world.getEntity("frame").c.frameInfo.delta;
      for (const entity of this.query.execute()) {
        const position = entity.c.position, velocity = entity.c.velocity;
        position.x += velocity.x * dt; position.y += velocity.y * dt;
        if (position.x < 10 || position.x > 990) { velocity.x *= -0.88; position.x = Math.max(10, Math.min(990, position.x)); }
        if (position.y < 10 || position.y > 610) { velocity.y *= -0.84; position.y = Math.max(10, Math.min(610, position.y)); }
        position.update(); velocity.update();
      }
    }
  }
  class LifetimeSystem extends ApeECS.System {
    init() { this.query = this.createQuery().fromAll("Position", "Lifetime", "Simulated").persist(); }
    update() {
      const dt = this.world.getEntity("frame").c.frameInfo.delta;
      for (const entity of this.query.execute()) {
        entity.c.lifetime.age += dt;
        if (entity.c.lifetime.age > entity.c.lifetime.max) { entity.c.lifetime.age = 0; entity.c.position.x = 80 + Math.random() * 840; entity.c.position.y = 80 + Math.random() * 260; }
        entity.c.lifetime.update(); entity.c.position.update();
      }
    }
  }
  world.registerSystem("simulation", GravitySystem);
  world.registerSystem("simulation", IntegrateSystem);
  world.registerSystem("simulation", LifetimeSystem);
  const state = { running: true, selectedId: null, systemRuns: 0, last: performance.now(), spawnIndex: 0, snapshotAt: 0 };
  function spawnEntity(redraw = true) {
    state.spawnIndex += 1;
    const entity = world.createEntity({
      id: `particle-${Date.now()}-${state.spawnIndex}`,
      tags: ["Simulated"],
      c: {
        position: { type: "Position", x: 100 + Math.random() * 800, y: 60 + Math.random() * 300 },
        velocity: { type: "Velocity", x: -130 + Math.random() * 260, y: -85 + Math.random() * 100 },
        renderable: { type: "Renderable", color: COLORS[state.spawnIndex % COLORS.length], radius: 5 + Math.random() * 7 },
        lifetime: { type: "Lifetime", max: 7 + Math.random() * 8 },
      },
    });
    state.selectedId = entity.id;
    setStatus(`Created ${entity.id} through world.createEntity() with 4 components and the Simulated tag.`);
    renderUi();
    if (redraw) draw();
  }
  for (let index = 0; index < 18; index++) spawnEntity(false);
  state.selectedId = null;

  // The renderer uses a direct tag index while the systems above demonstrate persisted system queries.
  function entities() { return [...world.getEntities("Simulated")].filter((entity) => entity.has("Renderable")); }
  function selected() { return state.selectedId ? world.getEntity(state.selectedId) : null; }
  function setStatus(message) { $("#status").textContent = message; }
  function runStep(dt) {
    frame.c.frameInfo.delta = Math.min(.04, Math.max(.001, dt)); frame.c.frameInfo.update();
    world.runSystems("simulation"); world.tick(); state.systemRuns += 3;
  }
  function resize() { const width = Math.max(1, canvas.clientWidth * devicePixelRatio), height = Math.max(1, canvas.clientHeight * devicePixelRatio); if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; } }
  function draw() {
    resize(); const width = canvas.width, height = canvas.height, sx = width / 1000, sy = height / 620;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#08101a"; context.fillRect(0, 0, width, height);
    const selectedEntity = selected();
    for (const entity of entities()) {
      const p = entity.c.position, visual = entity.c.renderable, radius = visual.radius * Math.min(sx, sy), x = p.x * sx, y = p.y * sy;
      if (entity.has("Glow")) { context.beginPath(); context.fillStyle = `${visual.color}33`; context.arc(x, y, radius * 2.6, 0, Math.PI * 2); context.fill(); }
      context.beginPath(); context.fillStyle = visual.color; context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
      if (selectedEntity?.id === entity.id) { context.strokeStyle = "#ffffff"; context.lineWidth = 2 * devicePixelRatio; context.beginPath(); context.arc(x, y, radius + 5 * devicePixelRatio, 0, Math.PI * 2); context.stroke(); }
    }
  }
  function countComponents(entity) { return Object.values(entity.types || {}).reduce((total, components) => total + components.size, 0); }
  function renderUi() {
    const all = entities(), entity = selected();
    $("#query-count").textContent = `${all.length} matches`;
    $("#tick-chip").textContent = `World tick ${world.currentTick}`;
    $("#run-chip").textContent = state.running ? "Running" : "Paused";
    $("#entities").innerHTML = all.map((item) => `<button class="entity ${item.id === state.selectedId ? "selected" : ""}" type="button" data-entity="${item.id}"><i style="background:${item.c.renderable.color}"></i><span><strong>${item.id}</strong><small>Position + Velocity + Renderable + Lifetime${item.has("Glow") ? " + Glow" : ""}</small></span></button>`).join("");
    document.querySelectorAll("[data-entity]").forEach((button) => button.addEventListener("click", () => { state.selectedId = button.dataset.entity; setStatus(`Selected ${state.selectedId}; component data comes from Ape ECS entity stores.`); renderUi(); }));
    $("#selected-id").textContent = entity?.id || "none"; $("#toggle-glow").disabled = !entity;
    $("#inspector").innerHTML = entity ? [
      ["Position", entity.c.position], ["Velocity", entity.c.velocity], ["Renderable", entity.c.renderable], ["Lifetime", entity.c.lifetime],
      ...(entity.has("Glow") ? [["Glow", entity.c.glow]] : []),
    ].map(([name, value]) => `<article class="component"><b>${name}</b><code>${escapeHtml(JSON.stringify(value.getObject ? value.getObject() : value, null, 2))}</code></article>`).join("") : '<p class="note">Click a particle or an entity-list row to inspect its real Ape ECS components.</p>';
    $("#ticks").textContent = String(world.currentTick); $("#systems").textContent = String(state.systemRuns); $("#entities-count").textContent = String(all.length); $("#components").textContent = String(all.reduce((total, item) => total + countComponents(item), 0));
  }
  function escapeHtml(text) { const element = document.createElement("span"); element.textContent = text; return element.innerHTML; }
  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect(), x = (clientX - rect.left) / rect.width * 1000, y = (clientY - rect.top) / rect.height * 620;
    let winner = null, distance = Infinity;
    for (const entity of entities()) { const d = Math.hypot(entity.c.position.x - x, entity.c.position.y - y); if (d < distance) { winner = entity; distance = d; } }
    if (winner && distance < winner.c.renderable.radius + 18) { state.selectedId = winner.id; setStatus(`Picked ${winner.id} through the render query.`); renderUi(); }
  }
  function exportWorld() {
    const json = JSON.stringify(world.getObject(), null, 2); const blob = new Blob([json], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "ape-ecs-world.json"; link.click(); URL.revokeObjectURL(link.href); setStatus(`Exported ${json.length.toLocaleString()} bytes from world.getObject().`);
  }

  $("#spawn").addEventListener("click", spawnEntity);
  $("#spawn-canvas").addEventListener("click", spawnEntity);
  $("#step").addEventListener("click", () => { runStep(1 / 60); setStatus("Ran Gravity, Integrate, and Lifetime systems for one ECS tick."); renderUi(); });
  $("#toggle-run").addEventListener("click", (event) => { state.running = !state.running; event.currentTarget.textContent = state.running ? "Pause" : "Resume"; renderUi(); });
  $("#toggle-glow").addEventListener("click", () => { const entity = selected(); if (!entity) return; if (entity.has("Glow")) { entity.removeComponent(entity.c.glow); setStatus(`Removed Glow from ${entity.id}; persisted queries will refresh at the next tick.`); } else { entity.addComponent({ type: "Glow", key: "glow", intensity: .85 }); setStatus(`Added Glow to ${entity.id} with entity.addComponent().`); } world.updateIndexes(); renderUi(); });
  $("#export").addEventListener("click", exportWorld);
  canvas.addEventListener("click", (event) => pick(event.clientX, event.clientY));
  function loop(now) { const dt = (now - state.last) / 1000; state.last = now; if (state.running) runStep(dt); draw(); if (now - state.snapshotAt > 180) { state.snapshotAt = now; renderUi(); } requestAnimationFrame(loop); }
  renderUi(); requestAnimationFrame(loop);
})();
