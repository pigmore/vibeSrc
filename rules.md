# Project Rules

`vibeSrc` is an open-source frontend feature playground: a place to collect, explain, and ship useful UI patterns, components, interactions, and product-ready frontend examples.

## 1. Project direction

- Build reusable frontend features, not one-off demos.
- Every feature should be easy to read, run, copy, and adapt.
- Prefer practical product UI over abstract toy examples.
- Keep examples small enough to understand, but complete enough to be useful.
- Document the idea, usage, edge cases, and trade-offs for each feature.

## 2. Open-source rules

- Use the MIT license already included in this repository.
- Do not commit private keys, tokens, customer data, or paid assets.
- Credit external code, design references, images, icons, and algorithms.
- Prefer dependencies with permissive licenses: MIT, Apache-2.0, BSD, ISC.
- Avoid copying proprietary UI implementations directly.

## 3. Contribution rules

A contribution should include:

1. The feature source code.
2. A short README or comment explaining what the feature does.
3. Screenshots, GIFs, or a live demo link when the feature is visual.
4. Basic test coverage or a clear manual test checklist.
5. Notes for browser support, accessibility, and performance risks.

## 4. Quality gates

Before merging a change, run the project checks once they exist:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If this project later uses another package manager, update this section and `coding.md` together.

## 5. Feature acceptance checklist

- [ ] The feature has a clear name and purpose.
- [ ] The public API/props/events are documented.
- [ ] Empty, loading, error, disabled, and edge states are considered.
- [ ] Keyboard navigation works where relevant.
- [ ] Color contrast and focus states are acceptable.
- [ ] The feature works on mobile and desktop sizes.
- [ ] Heavy work is lazy-loaded, memoized, virtualized, or deferred.
- [ ] No secrets or local-only paths are committed.

## 6. Communication style

- Write docs in simple English.
- Prefer examples over long theory.
- Record important prompts and decisions in `promptRecord.md`.
- Keep disagreements technical: discuss trade-offs, not people.
