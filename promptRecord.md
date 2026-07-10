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
