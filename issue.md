# Issue Log

Use this file to record product, UI, code, documentation, and workflow issues found while building `vibeSrc`.

Do not store secrets, private tokens, customer data, or credentials here.

## Status values

- `open` — reported but not started.
- `in-progress` — being investigated or fixed.
- `resolved` — fixed locally or in a committed change.
- `wontfix` — intentionally not fixed; explain why.

## Entry template

```md
## ISSUE-000 — short title

- **Status:** open | in-progress | resolved | wontfix
- **Priority:** low | medium | high
- **Type:** ui | bug | docs | infra | workflow | accessibility | performance
- **Reported:** YYYY-MM-DD
- **Area:** Page, folder, component, or workflow affected.
- **Problem:** What is wrong?
- **Expected:** What should happen instead?
- **Fix / Decision:** What changed or what should change?
- **Verification:** How the issue was checked.
- **Follow-ups:** Any remaining work.
```

## Issues

## ISSUE-001 — homepage README CTA opened raw Markdown

- **Status:** resolved
- **Priority:** medium
- **Type:** ui
- **Reported:** 2026-07-10
- **Area:** `index.html` homepage primary actions.
- **Problem:** The homepage secondary CTA said “Read the README” and linked directly to `./README.md`. The local static server returned the Markdown file as a raw download-like resource instead of a styled page, which made the homepage action feel wrong for visitors.
- **Expected:** The homepage should send visitors to a useful, readable destination.
- **Fix / Decision:** Replace the CTA with “View on GitHub” linking to `https://github.com/pigmore/vibeSrc`.
- **Verification:** Requested the homepage from the local server and confirmed the old “Read the README” CTA was gone and the new GitHub CTA was present.
- **Follow-ups:** If in-site documentation is needed later, add a dedicated HTML docs/about page instead of linking directly to raw Markdown.
