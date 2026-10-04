import { useSyncExternalStore } from "react";
import floral from "@/assets/card/tpl-floral.jpg";
import gold from "@/assets/card/tpl-gold.jpg";
import pink from "@/assets/card/tpl-pink.jpg";
import green from "@/assets/card/tpl-green.jpg";
import balloon from "@/assets/card/tpl-balloon.jpg";
import cakeBackground from "@/assets/card/tpl-cake.jpg";
import cosmic from "@/assets/card/tpl-cosmic.jpg";
import celebration from "@/assets/card/tpl-celebration.jpg";

/* ---------------- Model ---------------- */
export type ElType =
  | "heading"
  | "message"
  | "quote"
  | "name"
  | "photo"
  | "dob"
  | "age"
  | "zodiac"
  | "flower"
  | "birthstone"
  | "moon"
  | "countdown"
  | "qr"
  | "divider"
  | "balloons"
  | "cake"
  | "icon"
  | "shape"
  | "statDays"
  | "statHeartbeats"
  | "statMoon"
  | "statZodiac"
  | "wish";

export type CardEl = {
  id: string;
  type: ElType;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  locked?: boolean;
  text?: string;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  font?: "script" | "display" | "sans";
  icon?: string;
  shape?: "circle" | "rect" | "heart" | "star";
};

export type CardTheme = "light" | "dark";
export type Design = {
  personId: string;
  sizeKey: SizeKey;
  theme: CardTheme;
  templateId: string;
  bg: string | null; // background swatch id (overrides template image)
  bgColor: string | null; // solid color (overrides everything)
  photo: string | null; // data URL, local only
  elements: CardEl[];
};

export const SIZES = {
  portrait: { label: "Portrait (1080 × 1350)", w: 1080, h: 1350 },
  square: { label: "Square (1080 × 1080)", w: 1080, h: 1080 },
  story: { label: "Story (1080 × 1920)", w: 1080, h: 1920 },
  landscape: { label: "Landscape (1350 × 1080)", w: 1350, h: 1080 },
} as const;
export type SizeKey = keyof typeof SIZES;

/** Colours that belong to the card artwork itself (not the app UI theme). */
export const INK: Record<
  CardTheme,
  { ink: string; sub: string; accent: string; chip: string; chipBorder: string }
> = {
  light: {
    ink: "#2a1a5e",
    sub: "#6b5a8e",
    accent: "#7c3aed",
    chip: "rgba(255,255,255,0.82)",
    chipBorder: "rgba(124,58,237,0.18)",
  },
  dark: {
    ink: "#fdf6e3",
    sub: "#d9c9a3",
    accent: "#f2c66d",
    chip: "rgba(20,14,40,0.62)",
    chipBorder: "rgba(242,198,109,0.35)",
  },
};

export const BACKGROUNDS = [
  { id: "lavender", css: "linear-gradient(160deg,#f3eefe,#e9e1fb)" },
  { id: "blush", css: "linear-gradient(160deg,#fff1f3,#fde3e8)" },
  { id: "mint", css: "linear-gradient(160deg,#eef8ef,#dcefdf)" },
  { id: "violet", css: "linear-gradient(160deg,#ede4ff,#d9c8ff)" },
  { id: "sky", css: "linear-gradient(160deg,#e6f6fd,#cdeaf8)" },
  { id: "peach", css: "linear-gradient(160deg,#fff3ec,#fde2d3)" },
];
export const BG_COLORS = [
  "#ffffff",
  "#f9a8d4",
  "#fb923c",
  "#fcd34d",
  "#86efac",
  "#93c5fd",
  "#a78bfa",
  "conic-gradient(#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa,#f87171)",
];

export type Template = {
  id: string;
  label: string;
  image: string;
  theme: CardTheme;
  layout: "classic" | "centered" | "cake" | "celebration";
};
export const TEMPLATES: Template[] = [
  { id: "floral", label: "Floral light", image: floral, theme: "light", layout: "classic" },
  {
    id: "celebration",
    label: "Cosmic Celebration",
    image: celebration,
    theme: "dark",
    layout: "celebration",
  },
  { id: "gold", label: "Dark & gold", image: gold, theme: "dark", layout: "centered" },
  { id: "pink", label: "Pink floral", image: pink, theme: "light", layout: "centered" },
  { id: "green", label: "Green floral", image: green, theme: "light", layout: "centered" },
  { id: "balloon", label: "Balloons", image: balloon, theme: "light", layout: "classic" },
  { id: "cake", label: "Birthday cake", image: cakeBackground, theme: "light", layout: "cake" },
  { id: "cosmic", label: "Cosmic night", image: cosmic, theme: "dark", layout: "centered" },
];
export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const newElId = () => Math.random().toString(36).slice(2, 9);
const el = (
  type: ElType,
  x: number,
  y: number,
  w: number,
  h: number,
  extra: Partial<CardEl> = {},
): CardEl => ({ id: newElId(), type, x, y, w, h, rot: 0, ...extra });

/** Default element layout for a template, laid out on a 1080-wide frame and scaled to the card size. */
export function templateElements(t: Template, sizeKey: SizeKey): CardEl[] {
  const { w: W, h: H } = SIZES[sizeKey];
  const base: CardEl[] =
    t.layout === "celebration"
      ? [
          el("heading", 140, 55, 800, 75, {
            text: "Happy Birthday,",
            font: "script",
            fontSize: 68,
            color: "#fdf6e3",
          }),
          el("name", 140, 130, 800, 110, {
            text: "",
            font: "script",
            fontSize: 94,
            color: "#f2c66d",
          }),
          el("message", 190, 240, 700, 45, {
            text: "Today is your special day. ✨",
            fontSize: 26,
            color: "#fdf6e3",
          }),
          el("age", 290, 680, 500, 65, {
            color: "#f2c66d",
          }),
          el("statDays", 40, 760, 235, 135),
          el("statHeartbeats", 290, 760, 235, 135),
          el("moon", 540, 760, 235, 135),
          el("zodiac", 790, 760, 250, 135),
          el("quote", 90, 915, 900, 80, {
            text: "\u201CEvery year is another chapter in your story. May this one be your best yet. \u2728\u201D",
            fontSize: 24,
            italic: true,
            color: "#fdf6e3",
          }),
          el("wish", 90, 1005, 900, 100, {
            fontSize: 22,
            color: "#fdf6e3",
          }),
        ]
      : t.layout === "classic"
        ? [
            el("balloons", 30, 30, 210, 290, { rot: -6 }),
            el("heading", 250, 80, 600, 230, {
              text: "Happy Birthday!",
              font: "script",
              fontSize: 120,
            }),
            el("cake", 110, 450, 210, 210),
            el("photo", 390, 340, 300, 300),
            el("message", 730, 400, 300, 220, {
              text: "May your special day be filled with love, laughter and wonderful memories.",
              fontSize: 30,
            }),
            el("name", 250, 665, 580, 130, { font: "script", fontSize: 96 }),
            el("dob", 160, 830, 245, 120),
            el("age", 418, 830, 245, 120),
            el("countdown", 676, 830, 245, 120),
            el("zodiac", 110, 975, 205, 110),
            el("flower", 323, 975, 205, 110),
            el("birthstone", 536, 975, 205, 110),
            el("moon", 749, 975, 220, 110),
            el("qr", 850, 1130, 170, 170),
          ]
        : t.layout === "cake"
          ? [
              el("heading", 190, 70, 700, 220, {
                text: "Happy Birthday!",
                font: "script",
                fontSize: 120,
              }),
              el("name", 240, 290, 600, 130, { font: "script", fontSize: 96 }),
              el("cake", 340, 430, 400, 400),
              el("message", 190, 850, 700, 130, {
                text: "Wishing you a year as sweet as cake!",
                fontSize: 40,
                font: "display",
              }),
              el("age", 290, 1010, 245, 120),
              el("countdown", 545, 1010, 245, 120),
              el("divider", 340, 1170, 400, 30),
            ]
          : [
              el("heading", 190, 110, 700, 220, {
                text: "Happy Birthday!",
                font: "script",
                fontSize: 120,
              }),
              el("photo", 390, 350, 300, 300),
              el("name", 240, 670, 600, 130, { font: "script", fontSize: 96 }),
              el("divider", 390, 800, 300, 30),
              el("quote", 190, 845, 700, 120, {
                text: "\u201CCount your life by smiles, not tears.\u201D",
                fontSize: 34,
                italic: true,
              }),
              el("dob", 160, 1000, 245, 120),
              el("age", 418, 1000, 245, 120),
              el("zodiac", 676, 1000, 245, 120),
            ];
  const sx = W / 1080,
    sy = H / 1350;
  return base.map((e) => ({
    ...e,
    x: e.x * sx,
    y: e.y * sy,
    w: e.w * Math.min(sx, sy),
    h: e.h * Math.min(sx, sy),
    fontSize: e.fontSize ? e.fontSize * Math.min(sx, sy) : undefined,
  }));
}

export function defaultDesign(
  personId = "self",
  templateId = "floral",
  sizeKey: SizeKey = "portrait",
): Design {
  const t = templateById(templateId);
  return {
    personId,
    sizeKey,
    theme: t.theme,
    templateId: t.id,
    bg: null,
    bgColor: null,
    photo: null,
    elements: templateElements(t, sizeKey),
  };
}

/** Defaults for a freshly inserted element (centered on the card). */
export function newElement(
  type: ElType,
  W: number,
  H: number,
  extra: Partial<CardEl> = {},
): CardEl {
  const dims: Partial<Record<ElType, [number, number]>> = {
    photo: [280, 280],
    name: [560, 130],
    heading: [600, 200],
    message: [360, 200],
    quote: [560, 140],
    qr: [180, 180],
    divider: [320, 30],
    balloons: [220, 300],
    cake: [220, 220],
    icon: [140, 140],
    shape: [180, 180],
    statDays: [240, 140],
    statHeartbeats: [240, 140],
    statMoon: [240, 140],
    statZodiac: [240, 140],
    wish: [600, 120],
  };
  const [w, h] = dims[type] ?? [245, 120];
  const text: Partial<Record<ElType, Partial<CardEl>>> = {
    heading: { text: "Happy Birthday!", font: "script", fontSize: 110 },
    message: { text: "Wishing you all the happiness in the world!", fontSize: 32 },
    quote: {
      text: "\u201CThe more you praise and celebrate your life, the more there is to celebrate.\u201D",
      fontSize: 30,
      italic: true,
    },
    wish: {
      text: "Wishing you a year filled with happiness, growth, love and endless success. \uD83D\uDC9C",
      fontSize: 24,
    },
    name: { font: "script", fontSize: 92 },
    icon: { icon: "heart" },
    shape: { shape: "circle" },
  };
  return {
    id: newElId(),
    type,
    x: (W - w) / 2,
    y: (H - h) / 2,
    w,
    h,
    rot: 0,
    ...text[type],
    ...extra,
  };
}

/* ---------------- Saved designs (local only) ---------------- */
export type SavedDesign = { id: string; savedAt: number; design: Design; thumb: string | null };
const KEY = "dobverse.cardDesigns";
const listeners = new Set<() => void>();
let cache: { raw: string | null; val: SavedDesign[] } = { raw: null, val: [] };
const EMPTY: SavedDesign[] = [];
function read(): SavedDesign[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    try {
      if (!raw) {
        cache = { raw, val: [] };
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (d) =>
              d &&
              typeof d === "object" &&
              typeof d.id === "string" &&
              typeof d.savedAt === "number" &&
              d.design &&
              typeof d.design === "object" &&
              Array.isArray(d.design.elements),
          ) as SavedDesign[];
          cache = { raw, val: valid };
        } else {
          cache = { raw, val: [] };
        }
      }
    } catch {
      cache = { raw, val: [] };
    }
  }
  return cache.val;
}
export function useSavedDesigns() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
/** Saves (or updates) a design. Returns false when browser storage is full. */
export function saveDesign(entry: SavedDesign): boolean {
  let list = [entry, ...read().filter((d) => d.id !== entry.id)].slice(0, 12);
  for (;;) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      listeners.forEach((l) => l());
      return true;
    } catch {
      if (list.length <= 1) return false;
      list = list.slice(0, -1);
    }
  }
}
export function deleteDesign(id: string) {
  localStorage.setItem(KEY, JSON.stringify(read().filter((d) => d.id !== id)));
  listeners.forEach((l) => l());
}

/* ---------------- Undo / redo history ---------------- */
export type History<T> = { past: T[]; present: T; future: T[] };
export const historyInit = <T>(v: T): History<T> => ({ past: [], present: v, future: [] });
/** commit=true records an undo step; base lets drags record the pre-drag state once. */
export function historySet<T>(h: History<T>, next: T, commit = true, base?: T): History<T> {
  if (!commit) return { ...h, present: next };
  return { past: [...h.past, base ?? h.present].slice(-80), present: next, future: [] };
}
export const historyUndo = <T>(h: History<T>): History<T> =>
  h.past.length
    ? {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future],
      }
    : h;
export const historyRedo = <T>(h: History<T>): History<T> =>
  h.future.length
    ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
    : h;

/* ---------------- Geometry ---------------- */
const rad = (d: number) => (d * Math.PI) / 180;
const rotate = (x: number, y: number, deg: number) => ({
  x: x * Math.cos(rad(deg)) - y * Math.sin(rad(deg)),
  y: x * Math.sin(rad(deg)) + y * Math.cos(rad(deg)),
});
/** Resize from the bottom-right handle of a rotated box, keeping the opposite corner fixed. */
export function resizeBox(e: CardEl, dx: number, dy: number, keepRatio: boolean) {
  const l = rotate(dx, dy, -e.rot);
  let w = Math.max(30, e.w + l.x),
    h = Math.max(20, e.h + l.y);
  if (keepRatio) {
    const s = Math.max(w / e.w, h / e.h);
    w = Math.max(30, e.w * s);
    h = Math.max(20, e.h * s);
  }
  const c = rotate((w - e.w) / 2, (h - e.h) / 2, e.rot);
  const cx = e.x + e.w / 2 + c.x,
    cy = e.y + e.h / 2 + c.y;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
