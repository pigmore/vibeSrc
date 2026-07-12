(() => {
  "use strict";

  const canvas = document.querySelector("#sync-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  const camera = { yaw: -0.72, pitch: 0.44, zoom: 72 };
  let scene = { assets: [], selectedId: null, revision: 0, target: "Isaac Sim", publishAt: 0 };
  let pointer = null;
  let hitTargets = [];

  const palette = {
    "robot-arm": { fill: "#5eead4", edge: "#c7fff2" },
    "wrist-joint": { fill: "#ffd37c", edge: "#fff1c7" },
    workbench: { fill: "#93a4bd", edge: "#e3ebf8" },
    fallback: { fill: "#b39cff", edge: "#ede6ff" }
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * devicePixelRatio));
    const height = Math.max(1, Math.round(rect.height * devicePixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    return rect;
  }

  function rotate(point) {
    const [x, y, z] = point;
    const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
    const dx = x * cy - z * sy;
    const dz = x * sy + z * cy;
    return [dx, y * cp - dz * sp, y * sp + dz * cp];
  }

  function project(point, rect) {
    const [x, y, depth] = rotate(point);
    const scale = camera.zoom / Math.max(0.28, 1 + (depth + 6) * 0.09);
    return { x: rect.width * 0.5 + x * scale, y: rect.height * 0.58 - y * scale, depth, scale };
  }

  function path(points) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) context.lineTo(points[index].x, points[index].y);
    context.closePath();
  }

  function drawGrid(rect) {
    context.save();
    context.lineWidth = 1;
    for (let value = -8; value <= 8; value += 1) {
      const a = project([value, 0, -8], rect);
      const b = project([value, 0, 8], rect);
      const c = project([-8, 0, value], rect);
      const d = project([8, 0, value], rect);
      context.strokeStyle = value === 0 ? "rgba(94, 234, 212, .46)" : "rgba(132, 159, 194, .16)";
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      context.strokeStyle = value === 0 ? "rgba(179, 156, 255, .46)" : "rgba(132, 159, 194, .16)";
      context.beginPath(); context.moveTo(c.x, c.y); context.lineTo(d.x, d.y); context.stroke();
    }
    const origin = project([0, 0, 0], rect);
    const xAxis = project([1.6, 0, 0], rect);
    const yAxis = project([0, 1.6, 0], rect);
    const zAxis = project([0, 0, 1.6], rect);
    for (const [to, color, label] of [[xAxis, "#ff8796", "X"], [yAxis, "#77e4a5", "Y"], [zAxis, "#7ab8ff", "Z"]]) {
      context.strokeStyle = color; context.lineWidth = 2;
      context.beginPath(); context.moveTo(origin.x, origin.y); context.lineTo(to.x, to.y); context.stroke();
      context.fillStyle = color; context.font = "700 11px system-ui"; context.fillText(label, to.x + 4, to.y - 4);
    }
    context.restore();
  }

  function cuboidFaces(asset, rect) {
    const position = asset.transform;
    const size = asset.id === "workbench" ? [2.6, 0.7, 1.15] : asset.id === "wrist-joint" ? [0.46, 0.46, 0.46] : [0.72, 1.6, 0.72];
    const [sx, sy, sz] = size.map((value) => value / 2);
    const vertices = [
      [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
      [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz]
    ].map(([x, y, z]) => project([x + position[0], y + position[1], z + position[2]], rect));
    return [
      [vertices[0], vertices[1], vertices[2], vertices[3]],
      [vertices[1], vertices[5], vertices[6], vertices[2]],
      [vertices[4], vertices[0], vertices[3], vertices[7]],
      [vertices[3], vertices[2], vertices[6], vertices[7]],
      [vertices[0], vertices[4], vertices[5], vertices[1]]
    ];
  }

  function drawAsset(asset, rect) {
    const colors = palette[asset.id] || palette.fallback;
    const selected = asset.id === scene.selectedId;
    const faces = cuboidFaces(asset, rect).sort((a, b) => (a.reduce((total, point) => total + point.depth, 0) - b.reduce((total, point) => total + point.depth, 0)));
    context.save();
    faces.forEach((face, index) => {
      path(face);
      context.fillStyle = index === 3 ? `${colors.fill}cc` : index === 1 ? `${colors.fill}99` : `${colors.fill}73`;
      context.fill();
      context.strokeStyle = selected ? "#ffffff" : `${colors.edge}b8`;
      context.lineWidth = selected ? 2.5 : 1;
      context.stroke();
    });

    const anchor = project([asset.transform[0], asset.transform[1] + (asset.id === "workbench" ? 0.55 : 1.08), asset.transform[2]], rect);
    if (selected) {
      context.strokeStyle = "rgba(255,255,255,.72)";
      context.setLineDash([4, 4]);
      context.beginPath(); context.arc(anchor.x, anchor.y, 22, 0, Math.PI * 2); context.stroke(); context.setLineDash([]);
    }
    context.fillStyle = "rgba(5, 13, 21, .83)";
    context.strokeStyle = selected ? "#ffffff" : `${colors.edge}90`;
    context.lineWidth = 1;
    const label = asset.name;
    context.font = "700 11px system-ui";
    const labelWidth = context.measureText(label).width + 14;
    context.beginPath(); context.roundRect(anchor.x - labelWidth / 2, anchor.y - 27, labelWidth, 19, 5); context.fill(); context.stroke();
    context.fillStyle = "#f2f8ff"; context.textAlign = "center"; context.fillText(label, anchor.x, anchor.y - 14); context.textAlign = "start";
    hitTargets.push({ id: asset.id, x: anchor.x, y: anchor.y, radius: Math.max(36, anchor.scale * 0.6) });
    context.restore();
  }

  function drawPatch(rect, time) {
    if (!scene.publishAt || time - scene.publishAt > 2600) return;
    const progress = Math.min(1, (time - scene.publishAt) / 1300);
    const alpha = Math.max(0, 1 - (time - scene.publishAt) / 2600);
    const source = project([0, 1.5, 0], rect);
    const end = { x: rect.width - 74, y: 68 };
    const x = source.x + (end.x - source.x) * progress;
    const y = source.y + (end.y - source.y) * progress;
    context.save();
    context.strokeStyle = `rgba(179, 156, 255, ${alpha})`;
    context.lineWidth = 2;
    context.setLineDash([7, 7]);
    context.beginPath(); context.moveTo(source.x, source.y); context.lineTo(end.x, end.y); context.stroke(); context.setLineDash([]);
    context.fillStyle = `rgba(232, 222, 255, ${alpha})`;
    context.shadowColor = "#b39cff"; context.shadowBlur = 18;
    context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill();
    context.shadowBlur = 0;
    context.fillStyle = `rgba(232, 222, 255, ${alpha})`; context.font = "800 10px system-ui"; context.fillText(`PATCH → ${scene.target.toUpperCase()}`, end.x - 132, end.y - 13);
    context.restore();
  }

  function draw(time = performance.now()) {
    const rect = resize();
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#09111d"; context.fillRect(0, 0, rect.width, rect.height);
    hitTargets = [];
    drawGrid(rect);
    [...scene.assets].sort((a, b) => rotate(a.transform)[2] - rotate(b.transform)[2]).forEach((asset) => drawAsset(asset, rect));
    drawPatch(rect, time);
    if (scene.publishAt && time - scene.publishAt < 2600) requestAnimationFrame(draw);
  }

  function updateHud() {
    const revision = document.querySelector("#scene-revision");
    const target = document.querySelector("#scene-target");
    if (revision) revision.textContent = `CANONICAL SCENE · REV ${scene.revision}`;
    if (target) target.textContent = `ROUTING → ${scene.target.toUpperCase()}`;
  }

  window.addEventListener("sync-lab-state", (event) => {
    scene = { ...scene, ...event.detail, assets: event.detail.assets || [] };
    updateHud();
    draw();
  });

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture?.(event.pointerId);
    pointer = { x: event.clientX, y: event.clientY, moved: false };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) pointer.moved = true;
    camera.yaw += dx * 0.008;
    camera.pitch = Math.max(-0.1, Math.min(1.18, camera.pitch + dy * 0.006));
    pointer.x = event.clientX; pointer.y = event.clientY;
    draw();
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointer) return;
    if (!pointer.moved) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = hitTargets.find((target) => Math.hypot(target.x - x, target.y - y) < target.radius);
      if (hit) window.dispatchEvent(new CustomEvent("sync-lab-select", { detail: { id: hit.id } }));
    }
    pointer = null;
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    camera.zoom = Math.max(36, Math.min(140, camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08)));
    draw();
  }, { passive: false });
  canvas.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") { camera.yaw = -0.72; camera.pitch = 0.44; camera.zoom = 72; draw(); }
  });

  new ResizeObserver(draw).observe(canvas);
  draw();
})();
