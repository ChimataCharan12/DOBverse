import { useSyncExternalStore } from "react";

const SIGNS = [
  { name: "Capricorn", sym: "♑", el: "Earth", ruler: "Saturn", from: [12, 22] },
  { name: "Aquarius", sym: "♒", el: "Air", ruler: "Uranus", from: [1, 20] },
  { name: "Pisces", sym: "♓", el: "Water", ruler: "Neptune", from: [2, 19] },
  { name: "Aries", sym: "♈", el: "Fire", ruler: "Mars", from: [3, 21] },
  { name: "Taurus", sym: "♉", el: "Earth", ruler: "Venus", from: [4, 20] },
  { name: "Gemini", sym: "♊", el: "Air", ruler: "Mercury", from: [5, 21] },
  { name: "Cancer", sym: "♋", el: "Water", ruler: "Moon", from: [6, 21] },
  { name: "Leo", sym: "♌", el: "Fire", ruler: "Sun", from: [7, 23] },
  { name: "Virgo", sym: "♍", el: "Earth", ruler: "Mercury", from: [8, 23] },
  { name: "Libra", sym: "♎", el: "Air", ruler: "Venus", from: [9, 23] },
  { name: "Scorpio", sym: "♏", el: "Water", ruler: "Pluto", from: [10, 23] },
  { name: "Sagittarius", sym: "♐", el: "Fire", ruler: "Jupiter", from: [11, 22] },
];
export function zodiac(d: Date) {
  const m = d.getMonth() + 1,
    day = d.getDate();
  let idx = 0;
  for (let i = 1; i < SIGNS.length; i++) {
    const [fm, fd] = SIGNS[i].from;
    if (m > fm || (m === fm && day >= fd)) idx = i;
  }
  if (m === 12 && day >= 22) idx = 0;
  return SIGNS[idx];
}

export function moonPhase(d: Date) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((((d.getTime() - ref) / 86_400_000) % 29.530588) + 29.530588) % 29.530588;
  const illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / 29.530588)) / 2) * 100);
  const names = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  const icons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const i = Math.floor((age / 29.530588) * 8 + 0.5) % 8;
  return { name: names[i], icon: icons[i], illum };
}

const FLOWERS = [
  "Carnation",
  "Violet",
  "Daffodil",
  "Daisy",
  "Lily of the Valley",
  "Rose",
  "Larkspur",
  "Gladiolus",
  "Aster",
  "Marigold",
  "Chrysanthemum",
  "Narcissus",
];
const STONES = [
  "Garnet",
  "Amethyst",
  "Aquamarine",
  "Diamond",
  "Emerald",
  "Pearl",
  "Ruby",
  "Peridot",
  "Sapphire",
  "Opal",
  "Topaz",
  "Turquoise",
];
export const birthFlower = (d: Date) => FLOWERS[d.getMonth()];
export const birthstone = (d: Date) => STONES[d.getMonth()];

/* ---------- App preferences (Settings) ---------- */
export type Prefs = {
  theme: "light" | "dark" | "system";
  accent: string; // oklch value or "" for default
  language: string;
  notifications: boolean;
  birthdayReminders: boolean;
  celebration: boolean;
  reminderTime: string;
  music: boolean;
  song: string;
};
const PKEY = "dobverse.prefs";
const PDEFAULT: Prefs = {
  theme: "light",
  accent: "",
  language: "en",
  notifications: true,
  birthdayReminders: true,
  celebration: true,
  reminderTime: "09:00",
  music: true,
  song: "classic",
};
const pl = new Set<() => void>();
let pc: { raw: string | null; val: Prefs } = { raw: null, val: PDEFAULT };
function readP(): Prefs {
  const raw = localStorage.getItem(PKEY);
  if (raw !== pc.raw) {
    try {
      if (!raw) {
        pc = {
          raw,
          val: {
            ...PDEFAULT,
            theme: localStorage.getItem("dobverse.theme") === "dark" ? "dark" : "light",
          },
        };
      } else {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          pc = {
            raw,
            val: { ...PDEFAULT, ...parsed },
          };
        } else {
          pc = { raw, val: PDEFAULT };
        }
      }
    } catch {
      pc = { raw, val: PDEFAULT };
    }
  }
  return pc.val;
}
export function usePrefs() {
  return useSyncExternalStore(
    (cb) => {
      pl.add(cb);
      return () => pl.delete(cb);
    },
    readP,
    () => PDEFAULT,
  );
}
export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...readP(), ...patch };
  localStorage.setItem(PKEY, JSON.stringify(next));
  applyPrefs(next);
  pl.forEach((l) => l());
}
export function applyPrefs(p: Prefs = readP()) {
  const dark =
    p.theme === "dark" ||
    (p.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  localStorage.setItem("dobverse.theme", dark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", dark);
  const s = document.documentElement.style;
  if (p.accent) {
    s.setProperty("--primary", p.accent);
    s.setProperty("--ring", p.accent);
  } else {
    s.removeProperty("--primary");
    s.removeProperty("--ring");
  }
}

/** Simple synthesized "Happy Birthday" melody. */
export function playBirthdaySong() {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const N: Record<string, number> = {
    C: 262,
    D: 294,
    E: 330,
    F: 349,
    G: 392,
    A: 440,
    Bb: 466,
    C5: 523,
  };
  const tune: [string, number][] = [
    ["C", 0.75],
    ["C", 0.25],
    ["D", 1],
    ["C", 1],
    ["F", 1],
    ["E", 2],
    ["C", 0.75],
    ["C", 0.25],
    ["D", 1],
    ["C", 1],
    ["G", 1],
    ["F", 2],
  ];
  let t = ctx.currentTime + 0.05;
  for (const [n, d] of tune) {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = N[n];
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.45);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d * 0.45);
    t += d * 0.45;
  }
}
