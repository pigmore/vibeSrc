# Prompt Record

Use this file to record important AI prompts, decisions, and outcomes. Do not store secrets, private tokens, customer data, or credentials here.

## How to use

Add a new entry when a prompt meaningfully changes the project direction, architecture, feature design, or coding rules.

## Entry template

```md
## YYYY-MM-DD — short title

- **Goal:** What were we trying to build or decide?
- **Prompt:** The important user prompt or summarized prompt.
- **Context files:** Files the agent/developer read before answering.
- **Decision:** What was decided or implemented?
- **Changed files:** List of files changed.
- **Verification:** Commands run, screenshots checked, or manual test result.
- **Follow-ups:** TODOs or risks discovered.
```

## Records

## 2026-07-11 — add Ape ECS simulation playground

- **Goal:** Add a browser-runnable ECS demo grounded in the upstream `fritzy/ape-ecs` library.
- **Prompt:** "https://github.com/fritzy/ape-ecs. base on ecs, build a demo of ecs"
- **Context files:** Upstream `README.md`, `docs/Overview.md`, `docs/World.md`, `docs/System.md`, `docs/Entity.md`, local project listings, and static-demo conventions.
- **Decision:** Vendor the MIT-licensed upstream v1.3.0 browser build alongside its license notice; run its actual `World`, `Component`, `System`, query, dynamic-component, and `getObject()` serialization APIs in a self-contained Canvas 2D simulation.
- **Changed files:** `projects/ape-ecs-simulation-playground/`, `index.html`, `projects/index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Load the browser build locally, verify 18 live ECS entities, select one, dynamically add `Glow`, run the system group, inspect tick progression, and confirm the console has no errors.
- **Follow-ups:** Add an import path for `world.createEntities()` snapshots, a query-change feed visualization, or a WebGL renderer driven by the same Ape ECS world.

## 2026-07-10 — add browser 3D editor portfolio labs

- **Goal:** Create several browser-runnable demos that concretely address a senior browser 3D editor / simulation-editor job description.
- **Prompt:** Build demos for command-layer editor architecture, Gaussian splat rendering performance, and simulation synchronization across USD/MJCF/SDF/glTF.
- **Context files:** `rules.md`, `tech-principle.md`, `README.md`, `projects/index.html`, and the existing `projects/ecs-obj-editor/` demo.
- **Decision:** Keep the new demos dependency-free and static so they can be opened directly, while showing TypeScript contracts and renderer/system boundaries that can be connected to Three.js, WebGPU, Spark.js/gsplat.js, or engine bridges in production.
- **Changed files:** `projects/editor-command-studio/`, `projects/gaussian-splat-render-lab/`, `projects/simulation-sync-lab/`, `index.html`, `projects/index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Type-check the command contracts, syntax-check each browser module, serve all routes, test command undo/redo and joint controls, inspect WebGL splat metrics, and publish a simulation transform patch in the browser.
- **Follow-ups:** Add a real Three.js/WebGPU implementation, PLY/.splat loaders with depth sorting, worker-based streaming, live engine bridge endpoints, and CRDT collaboration if these move from portfolio labs to a product.

## 2026-07-10 — add homepage donation panel

- **Goal:** Give visitors a clear way to support vibeSrc.
- **Prompt:** "https://buymeacoffee.com/pigmore here is my donate link, gen a donate div show this link as qrcode and this link button in the home page."
- **Context files:** `index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Decision:** Add an accessible homepage support panel with a locally generated QR image and two external, safe new-tab links to the supplied Buy Me a Coffee page.
- **Changed files:** `index.html`, `assets/buymeacoffee-pigmore-qr.png`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Serve the homepage, confirm the donation heading/button/QR image load, and inspect the external link URL in a browser.
- **Follow-ups:** Replace the donation destination only when the public support URL changes.

## 2026-07-10 — expand OBJ editor into SketchUp-lite modeling demo

- **Goal:** Add practical direct-modeling features to the WebGL OBJ ECS editor.
- **Prompt:** "implement more feature like skectchup lite version"
- **Context files:** `projects/ecs-obj-editor/index.html`, `projects/ecs-obj-editor/README.md`.
- **Decision:** Split the interactive logic into `editor.js` and add a tool palette for select/orbit, grid box placement, move, rotate, push/pull, grid snap, camera views, duplicate, and undo/redo. Keep the rendering path dependency-free and ECS-oriented.
- **Changed files:** `projects/ecs-obj-editor/index.html`, `projects/ecs-obj-editor/editor.js`, `projects/ecs-obj-editor/README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Browser-load the WebGL editor, add/duplicate/undo boxes, drag with the Move tool, place a grid box, import a sample OBJ, and inspect the browser console for errors.
- **Follow-ups:** Add face-level selection, real drag gizmos, measurements, edge inference, groups/components, booleans, and glTF support if this becomes a more complete modeling tool.

## 2026-07-10 — correct OBJ viewer vertical orbit direction

- **Goal:** Make vertical drag behavior match the viewer's horizontal drag behavior.
- **Prompt:** "rotate the viewer left right is correct, up and down is wrong, please fix"
- **Context files:** `projects/ecs-obj-editor/index.html`.
- **Decision:** Reverse only the vertical pointer delta applied to camera pitch; leave the horizontal yaw mapping unchanged.
- **Changed files:** `projects/ecs-obj-editor/index.html`, `promptRecord.md`.
- **Verification:** Load the WebGL editor in a browser, dispatch a vertical pointer drag, confirm the corrected pitch expression is active, and inspect the console for runtime errors.
- **Follow-ups:** Keep orbit control conventions consistent if touch, keyboard, or trackball controls are introduced.

## 2026-07-10 — add OBJ ECS editor demo

- **Goal:** Build a NodeNote-style standalone project for editing OBJ meshes in 3D.
- **Prompt:** "use the proj nodeNote as a reference make a similar proj to process 3d obj editor, vanillajs, entity-component-system architechtrue"
- **Context files:** `projects/nodeNote/index.html`, `projects/nodeNote/README.md`, `rules.md`, `tech-principle.md`.
- **Decision:** Create a dependency-free single-page WebGL demo whose ECS world keeps entity IDs and component stores separate from rendering/input/editor systems.
- **Changed files:** `projects/ecs-obj-editor/index.html`, `projects/ecs-obj-editor/README.md`, `index.html`, `projects/index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Serve the route, inspect browser console, add/select/edit a cube, and import a sample OBJ file.
- **Follow-ups:** Add proper ray-cast picking, OBJ normal/material support, textures, undo/redo, and glTF support if this grows beyond a teaching demo.

## 2026-07-10 — add issue log

- **Goal:** Add a dedicated project issue log.
- **Prompt:** "add an issue.md to record the issues,"
- **Context files:** `README.md`, `filePath.md`, `promptRecord.md`.
- **Decision:** Create `issue.md` with status/type conventions, an entry template, and the first resolved homepage CTA issue.
- **Changed files:** `issue.md`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Confirm `issue.md` exists and README/path map reference it.
- **Follow-ups:** Move future bug reports and UX fixes into `issue.md`; keep `promptRecord.md` for decisions and important prompts.

## 2026-07-10 — fix homepage README CTA

- **Goal:** Fix the homepage secondary action that pointed visitors directly to the raw local `README.md` file.
- **Prompt:** "read the readme in the home page is not right"
- **Context files:** `index.html`, server response headers for `/README.md`.
- **Decision:** Replace the local `README.md` CTA with a GitHub repository link so visitors do not hit an unstyled/raw Markdown file from the static server.
- **Changed files:** `index.html`, `promptRecord.md`.
- **Verification:** Request the homepage and confirm the CTA text/link changed.
- **Follow-ups:** If project docs need to be readable inside the site later, add a dedicated HTML docs/about page instead of linking directly to raw Markdown.

## 2026-07-10 — add NodeNote as project submodule

- **Goal:** Treat the existing NodeNote vanilla JavaScript repo as a vibeSrc project.
- **Prompt:** "https://github.com/pigmore/nodeNote is one of my vanillajs demo, treat it as a project and a github submoudule"
- **Context files:** `index.html`, `projects/index.html`, `README.md`, `filePath.md`, `projects/nodeNote/README.md`.
- **Decision:** Add `pigmore/nodeNote` as a Git submodule at `projects/nodeNote` and link it from the project listings.
- **Changed files:** `.gitmodules`, `projects/nodeNote`, `index.html`, `projects/index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Initialize the submodule and request the NodeNote route through the local static server.
- **Follow-ups:** Keep the submodule pinned intentionally; update it with `git submodule update --remote projects/nodeNote` when NodeNote should advance.

## 2026-07-10 — add local static web server

- **Goal:** Make the static demo site easy to run from the repository.
- **Prompt:** "setup web server"
- **Context files:** `README.md`, `filePath.md`, existing static demo pages.
- **Decision:** Add a no-dependency Python standard-library server and npm convenience scripts.
- **Changed files:** `scripts/serve.py`, `package.json`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Start the server and request the homepage/project demo routes over HTTP.
- **Follow-ups:** If this becomes a packaged app, replace the helper with a Vite or framework-specific dev server.

## 2026-07-10 — add static welcome and vanilla demos

- **Goal:** Add a simple browser entry point and first demo projects.
- **Prompt:** "gen a index html to welcome the users and projects folder with two simple demo a hello world and a count +1 vanillajs"
- **Context files:** `README.md`, `coding.md`, `filePath.md`, `promptRecord.md`.
- **Decision:** Keep the first implementation framework-free with static HTML, CSS, and vanilla JavaScript.
- **Changed files:** `index.html`, `projects/index.html`, `projects/hello-world/index.html`, `projects/count-plus-one/index.html`, `README.md`, `filePath.md`, `promptRecord.md`.
- **Verification:** Serve the repo with `python3 -m http.server` and request the static pages.
- **Follow-ups:** Choose whether future demos stay vanilla or move into a formal Vite/TypeScript app scaffold.

## 2026-07-10 — initialize startup docs

- **Goal:** Create initial open-source frontend project guide files.
- **Prompt:** "here is my new opensrc frontend project, make me a startup. gen me some kides like rules.md, tech-princple.md, coding.md(like claude.md), filePath.md,promptRecord.md,or something u need."
- **Context files:** `README.md`, `LICENSE`.
- **Decision:** Add starter docs for rules, technical principles, coding-agent guidance, path map, prompt recording, and roadmap.
- **Changed files:** `README.md`, `rules.md`, `tech-principle.md`, `coding.md`, `filePath.md`, `promptRecord.md`, `roadmap.md`.
- **Verification:** Confirm files exist and git status shows expected new docs.
- **Follow-ups:** Choose actual frontend stack and scaffold the app.
