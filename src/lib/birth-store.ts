import { setPrefs } from "./astro";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { BirthInfo } from "./birth";

const KEY = "dobverse.birth";
const listeners = new Set<() => void>();
let cache: { raw: string | null; val: BirthInfo | null } = { raw: null, val: null };

function read(): BirthInfo | null {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    try {
      if (!raw) {
        cache = { raw, val: null };
      } else {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          typeof parsed.dob === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(parsed.dob)
        ) {
          cache = { raw, val: parsed as BirthInfo };
        } else {
          cache = { raw, val: null };
        }
      }
    } catch {
      cache = { raw, val: null };
    }
  }
  return cache.val;
}

export function saveBirth(info: BirthInfo) {
  localStorage.setItem(KEY, JSON.stringify(info));
  listeners.forEach((l) => l());
}

export function useBirth(): BirthInfo | null | undefined {
  const hydrated = useHydrated();
  const val = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => null,
  );
  return hydrated ? val : undefined;
}

let hydratedOnce = false;
export function useHydrated() {
  const [h, setH] = useState(hydratedOnce);
  useEffect(() => {
    hydratedOnce = true;
    setH(true);
  }, []);
  return h;
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("dobverse.theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    setPrefs({ theme: d ? "dark" : "light" });
  };
  return { dark, toggle };
}

import { createContext, useContext } from "react";
export const BirthContext = createContext<BirthInfo | null>(null);
/** Birth info inside the dashboard layout (guaranteed present there). */
export function useCurrentBirth(): BirthInfo {
  const b = useContext(BirthContext);
  if (!b) throw new Error("useCurrentBirth used outside dashboard layout");
  return b;
}
