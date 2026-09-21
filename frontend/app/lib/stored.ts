import { useSyncExternalStore } from "react";

// Kept in memory too, so a choice still holds for the visit when localStorage is blocked (private mode).
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A per-device preference, parsed from storage; `parse(null)` is the default. */
export function readStored<T>(key: string, parse: (raw: string | null) => T): T {
  return parse(readRaw(key));
}

export function writeStored(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the in-memory copy carries the visit.
  }
  listeners.forEach((listener) => listener());
}

/** A per-device preference as React state. Renders the default on the server and during hydration. */
export function useStored<T>(key: string, parse: (raw: string | null) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => readStored(key, parse),
    () => parse(null),
  );
}
