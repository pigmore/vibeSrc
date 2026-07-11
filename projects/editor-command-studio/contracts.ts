// TypeScript-first contracts mirrored by the runnable browser implementation in main.js.
export type Vec3 = [number, number, number];
export type ToolId = "select" | "translate" | "material" | "joint";

export interface Entity {
  id: string;
  name: string;
  kind: "mesh" | "joint";
  position: Vec3;
  rotation: Vec3;
  material: { color: string; roughness: number };
  joint?: { type: "revolute" | "prismatic"; lower: number; upper: number; drive: number };
}

export interface EditorState {
  revision: number;
  selectedId: string | null;
  activeTool: ToolId;
  entities: Map<string, Entity>;
}

export interface EditorCommand {
  id: string;
  label: string;
  execute(state: EditorState): void;
  undo(state: EditorState): void;
  serialize(): Record<string, unknown>;
}

export interface ToolPlugin {
  id: ToolId;
  label: string;
  shortcut: string;
  activate(state: EditorState): void;
  createCommand(input: unknown, state: EditorState): EditorCommand | null;
}

export interface CommandBus {
  execute(command: EditorCommand): void;
  undo(): void;
  redo(): void;
}
