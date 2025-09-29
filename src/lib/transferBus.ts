// /lib/transferBus.ts
export type EditorEdits = {
  lighting: "none" | "retro" | "cinematic" | "cool";
  intensity: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  aspect: "16:9" | "1:1" | "9:16" | "4:3" | string;
  playbackRate: number;
};

export type EditorPayload = {
  kind: "video" | "image";
  src: string;   // blob: URL from URL.createObjectURL
  name?: string;
  type?: string;
  ts?: number;
  edits?: EditorEdits;
};

// Simple in-memory singleton (works across SPA navigations)
let lastUpload: EditorPayload | null = null;

export function setLastUpload(p: EditorPayload) {
  lastUpload = p;
}

export function takeLastUpload(): EditorPayload | null {
  const p = lastUpload;
  lastUpload = null;
  return p;
}
