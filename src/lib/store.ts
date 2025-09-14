const LIB_KEY = "sg:library";
import type { LibraryItem } from "./types";

export function getLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(LIB_KEY);
    return raw ? (JSON.parse(raw) as LibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function addToLibrary(item: LibraryItem) {
  const lib = getLibrary();
  lib.unshift(item);
  localStorage.setItem(LIB_KEY, JSON.stringify(lib));
}

export function clearLibrary() {
  localStorage.removeItem(LIB_KEY);
}

/* NEW: update & delete */
export function updateLibraryItem(id: string, patch: Partial<LibraryItem>) {
  const lib = getLibrary();
  const i = lib.findIndex((x) => x.id === id);
  if (i >= 0) {
    lib[i] = { ...lib[i], ...patch };
    localStorage.setItem(LIB_KEY, JSON.stringify(lib));
  }
}

export function removeFromLibrary(id: string) {
  const lib = getLibrary().filter((x) => x.id !== id);
  localStorage.setItem(LIB_KEY, JSON.stringify(lib));
}
