# Technical Principles

These principles guide technical choices for `vibeSrc`.

## 1. Frontend-first, framework-aware

This repository is about frontend features. Code should make UI behavior, state, accessibility, and interaction patterns easy to study.

- Prefer TypeScript for new code.
- Prefer small, composable modules over large magic abstractions.
- Keep framework-specific code isolated from framework-independent logic.
- When possible, separate pure logic from UI rendering.

## 2. Copyable but production-minded

Examples should be easy to copy into real projects.

- Include realistic loading, error, and empty states.
- Avoid demo-only shortcuts that would be dangerous in production.
- Name files and functions clearly.
- Prefer explicit data flow over hidden global state.

## 3. Accessibility is a feature

A UI feature is incomplete if users cannot operate it.

- Use semantic HTML before ARIA.
- Keep visible focus states.
- Support keyboard interaction for menus, dialogs, tabs, forms, and drag/drop where possible.
- Provide text alternatives for visual-only information.
- Test reduced motion for animation-heavy examples.

## 4. Performance budget

Frontend features should stay responsive.

- Avoid unnecessary client JavaScript.
- Split heavy dependencies away from the main path.
- Use virtualization for long lists.
- Debounce or throttle high-frequency events.
- Prefer CSS transitions/animations for simple motion.
- Measure before introducing complex optimization.

## 5. Dependency policy

Dependencies are allowed, but they must earn their place.

Ask before adding a dependency:

1. Does the platform already solve this?
2. Is the dependency maintained?
3. Is the license compatible with MIT open source?
4. Does it significantly increase bundle size?
5. Can the feature still be understood after adding it?

## 6. Styling principles

- Keep styles local to the feature when possible.
- Use design tokens or CSS variables for colors, spacing, radius, and shadows.
- Avoid hard-coded magic values unless they are explained.
- Design responsive states from the start.
- Prefer predictable layouts over clever CSS tricks.

## 7. Testing principles

Use the testing level that matches the risk:

- Pure logic: unit tests.
- Components and interactions: component tests.
- Critical user flows: end-to-end tests.
- Visual behavior: screenshots, stories, or manual visual checklist.

## 8. Documentation principles

Every feature should answer:

- What problem does this solve?
- When should I use it?
- How do I install/copy/use it?
- What are the important props, events, options, or APIs?
- What are the accessibility/performance caveats?
