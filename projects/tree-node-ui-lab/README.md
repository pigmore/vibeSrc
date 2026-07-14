# Tree Node UI Lab

A dependency-free browser prototype for an entity-first UI model.

## Premise

This demo treats every rendered item as a **tree node entity**. There is no hidden component boundary that owns reuse. To reuse something, select a real node, promote it to a reusable definition, and add a `Reference` node that points at that definition.

## Try it

1. Add `Frame`, `Text`, `Action`, or `Reference` nodes from the palette.
2. Select a node in the tree or canvas and edit its entity label.
3. Promote a non-root node into a reusable definition.
4. Add a `Reference` node and choose a definition target in the inspector.
5. Copy the full tree JSON.

Everything runs locally in the browser with no build step or dependencies.
