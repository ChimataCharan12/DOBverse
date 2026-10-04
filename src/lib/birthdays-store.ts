import { useSyncExternalStore } from "react";
import { addYears, birthDate, type BirthInfo } from "./birth";

export type Category = "family" | "friends" | "relatives" | "colleagues" | "others";
export type BirthdayRepeat = "yearly" | "once";

export type Person = {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  time?: string;
  city?: string;
  country?: string;
  relation?: string;
  category: Category;
  repeat?: BirthdayRepeat; // "yearly" (default) or "once"
  targetYear?: number; // for repeat === "once"
  pinned?: boolean;
  note?: string;
  /** Per-person reminder. Missing = enabled using the global default timing. */
  reminder?: { enabled: boolean; daysBefore: number };
};

export const REMINDER_OPTIONS = [0, 1, 3, 7] as const;
export const reminderLabel = (n: number) =>
  n === 0 ? "On birthday" : `${n} day${n > 1 ? "s" : ""} before`;

const KEY = "dobverse.birthdays";
const listeners = new Set<() => void>();
let cache: { raw: string | null; val: Person[] } = { raw: null, val: [] };
const EMPTY: Person[] = [];

function read(): Person[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    try {
      if (!raw) {
        cache = { raw, val: [] };
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (x) =>
              x &&
              typeof x === "object" &&
              typeof x.id === "string" &&
              typeof x.name === "string" &&
              typeof x.dob === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(x.dob),
          ) as Person[];
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
function write(list: Person[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

export function useBirthdays(): Person[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}

export const newId = () => Math.random().toString(36).slice(2, 10);
export function upsertBirthday(p: Person) {
  const list = read();
  const i = list.findIndex((x) => x.id === p.id);
  write(i >= 0 ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]);
}
export function addBirthdays(ps: Omit<Person, "id">[]) {
  write([...read(), ...ps.map((p) => ({ ...p, id: newId() }))]);
}
export function setPersonReminder(
  id: string,
  r: { enabled: boolean; daysBefore: number } | undefined,
) {
  write(read().map((x) => (x.id === id ? { ...x, reminder: r } : x)));
}
export function removeBirthday(id: string) {
  write(read().filter((x) => x.id !== id));
}
export function togglePin(id: string) {
  write(read().map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)));
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function parseDob(dob: string) {
  const [y, m, d] = dob.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Next occurrence of this birthday with recurrence & leap-year handling. */
export function nextOccurrence(
  personOrDob: Person | string,
  now: Date,
  explicitRepeat?: BirthdayRepeat,
  explicitTargetYear?: number,
) {
  const dob = typeof personOrDob === "string" ? personOrDob : personOrDob.dob;
  const repeat: BirthdayRepeat =
    explicitRepeat ??
    (typeof personOrDob === "object" ? personOrDob.repeat : undefined) ??
    "yearly";
  const targetYear =
    explicitTargetYear ?? (typeof personOrDob === "object" ? personOrDob.targetYear : undefined);

  const b = parseDob(dob);
  const today = startOfDay(now);
  const currentYear = today.getFullYear();

  // Helper to get occurrence date in year y with Feb 29 leap day clamping
  const at = (y: number) => {
    const d = addYears(b, y);
    return d.getMonth() !== b.getMonth() ? new Date(d.getFullYear(), b.getMonth() + 1, 0) : d;
  };

  if (repeat === "once") {
    const ty = targetYear ?? currentYear;
    const diffYears = ty - b.getFullYear();
    const date = at(diffYears);
    const turning = diffYears;
    const daysLeft = Math.round((date.getTime() - today.getTime()) / DAY);
    return {
      date,
      turning,
      daysLeft,
      isPast: date < today,
      repeat: "once" as const,
      targetYear: ty,
    };
  }

  // Yearly recurrence:
  let years = currentYear - b.getFullYear();
  let date = at(years);
  if (date < today) {
    years++;
    date = at(years);
  }
  return {
    date,
    turning: years,
    daysLeft: Math.round((date.getTime() - today.getTime()) / DAY),
    isPast: false,
    repeat: "yearly" as const,
  };
}

export function occursOn(
  personOrDob: Person | string,
  day: Date,
  explicitRepeat?: BirthdayRepeat,
  explicitTargetYear?: number,
) {
  const dob = typeof personOrDob === "string" ? personOrDob : personOrDob.dob;
  const repeat: BirthdayRepeat =
    explicitRepeat ??
    (typeof personOrDob === "object" ? personOrDob.repeat : undefined) ??
    "yearly";
  const targetYear =
    explicitTargetYear ?? (typeof personOrDob === "object" ? personOrDob.targetYear : undefined);

  if (repeat === "once") {
    const ty = targetYear ?? parseDob(dob).getFullYear();
    if (day.getFullYear() !== ty) return false;
  }

  const b = parseDob(dob);
  if (b.getMonth() === 1 && b.getDate() === 29) {
    const leap = new Date(day.getFullYear(), 1, 29).getMonth() === 1;
    const matchesDay = leap
      ? day.getMonth() === 1 && day.getDate() === 29
      : day.getMonth() === 1 && day.getDate() === 28;
    return matchesDay && (repeat === "once" ? true : day.getFullYear() >= b.getFullYear());
  }

  return (
    b.getMonth() === day.getMonth() &&
    b.getDate() === day.getDate() &&
    (repeat === "once" ? true : day.getFullYear() >= b.getFullYear())
  );
}

export function withNext(list: Person[], now: Date) {
  return list
    .map((p) => ({ ...p, next: nextOccurrence(p, now) }))
    .filter((p) => p.next.repeat !== "once" || !p.next.isPast)
    .sort((a, b) => a.next.daysLeft - b.next.daysLeft);
}

export function summary(list: Person[], now: Date) {
  const w = withNext(list, now);
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  return {
    total: list.length,
    thisYear: w.filter((p) => p.next.date <= yearEnd).length,
    thisMonth: w.filter(
      (p) =>
        p.next.date.getMonth() === now.getMonth() &&
        p.next.date.getFullYear() === now.getFullYear(),
    ).length,
    thisWeek: w.filter((p) => p.next.daysLeft <= 7).length,
    today: w.filter((p) => p.next.daysLeft === 0).length,
  };
}

/** The current user's own birth info, shaped as a Person (for compare). */
export function selfAsPerson(b: BirthInfo): Person {
  return {
    id: "self",
    name: b.name || "You",
    dob: b.dob,
    time: b.time,
    city: b.city,
    country: b.country,
    category: "others",
  };
}
export const personDate = (p: Person) => birthDate({ dob: p.dob, time: p.time });

/** Effective reminder for a person + its dynamically computed reminder date. */
export function reminderFor(p: Person, now: Date, defaultDays: number) {
  const r = p.reminder ?? { enabled: true, daysBefore: defaultDays };
  const next = nextOccurrence(p, now);
  const remindOn = new Date(next.date);
  remindOn.setDate(remindOn.getDate() - r.daysBefore);
  const today = startOfDay(now);
  const status: "off" | "today" | "due" | "scheduled" = !r.enabled
    ? "off"
    : next.daysLeft === 0
      ? "today"
      : next.daysLeft <= r.daysBefore
        ? "due"
        : "scheduled";
  return {
    ...r,
    custom: !!p.reminder,
    next,
    remindOn: remindOn < today ? today : remindOn,
    status,
  };
}

// Reminder settings
export type ReminderSettings = {
  browser: boolean;
  email?: boolean;
  daysBefore: number;
  bannerDismissed?: boolean;
};
const SKEY = "dobverse.reminderSettings";
const sListeners = new Set<() => void>();
let sCache: { raw: string | null; val: ReminderSettings } = {
  raw: null,
  val: { browser: false, daysBefore: 3 },
};
const SDEFAULT: ReminderSettings = { browser: false, daysBefore: 3 };
function readS(): ReminderSettings {
  const raw = localStorage.getItem(SKEY);
  if (raw !== sCache.raw) {
    try {
      if (!raw) {
        sCache = { raw, val: SDEFAULT };
      } else {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          sCache = {
            raw,
            val: {
              browser: typeof parsed.browser === "boolean" ? parsed.browser : SDEFAULT.browser,
              daysBefore:
                typeof parsed.daysBefore === "number" && !isNaN(parsed.daysBefore)
                  ? parsed.daysBefore
                  : SDEFAULT.daysBefore,
              bannerDismissed:
                typeof parsed.bannerDismissed === "boolean" ? parsed.bannerDismissed : undefined,
            },
          };
        } else {
          sCache = { raw, val: SDEFAULT };
        }
      }
    } catch {
      sCache = { raw, val: SDEFAULT };
    }
  }
  return sCache.val;
}
export function useReminderSettings() {
  return useSyncExternalStore(
    (cb) => {
      sListeners.add(cb);
      return () => sListeners.delete(cb);
    },
    readS,
    () => SDEFAULT,
  );
}
export function setReminderSettings(patch: Partial<ReminderSettings>) {
  localStorage.setItem(SKEY, JSON.stringify({ ...readS(), ...patch }));
  sListeners.forEach((l) => l());
}

export async function enableBrowserNotifications(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  const perm =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  const ok = perm === "granted";
  setReminderSettings({ browser: ok });
  return ok;
}

/** Show browser notifications for birthdays within the reminder window (once per day per person). */
export function runReminderCheck(list: Person[], now: Date) {
  const s = readS();
  if (!s.browser || typeof Notification === "undefined" || Notification.permission !== "granted")
    return;
  const stamp = now.toISOString().slice(0, 10);
  for (const p of withNext(list, now)) {
    const r = reminderFor(p, now, s.daysBefore);
    if (!r.enabled || p.next.daysLeft > r.daysBefore) continue;
    const k = `dobverse.notified.${p.id}.${stamp}`;
    if (localStorage.getItem(k)) continue;
    localStorage.setItem(k, "1");
    new Notification(
      p.next.daysLeft === 0
        ? `🎉 It's ${p.name}'s birthday today!`
        : `🎂 ${p.name}'s birthday in ${p.next.daysLeft} day${p.next.daysLeft > 1 ? "s" : ""}`,
      { body: `Turning ${p.next.turning}` },
    );
  }
}

export function toICS(list: Person[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DOBverse//Birthdays//EN"];
  for (const p of list) {
    const [y, m, d] = p.dob.split("-");
    const repeat = p.repeat ?? "yearly";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${p.id}@dobverse`,
      `SUMMARY:${p.name}'s Birthday`,
      `DTSTART;VALUE=DATE:${y}${m}${d}`,
    );
    if (repeat === "yearly") {
      lines.push("RRULE:FREQ=YEARLY");
    }
    lines.push(`CATEGORIES:${p.category}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Parse .ics (SUMMARY + DTSTART) or CSV (name,YYYY-MM-DD[,category]). */
export function parseImport(text: string): Omit<Person, "id">[] {
  const out: Omit<Person, "id">[] = [];
  const cats: Category[] = ["family", "friends", "relatives", "colleagues", "others"];
  if (text.includes("BEGIN:VEVENT")) {
    for (const ev of text.split("BEGIN:VEVENT").slice(1)) {
      const sum = /SUMMARY[^:]*:(.+)/.exec(ev)?.[1]?.trim();
      const dt = /DTSTART[^:]*:(\d{4})(\d{2})(\d{2})/.exec(ev);
      if (sum && dt)
        out.push({
          name: sum.replace(/'s Birthday$/i, ""),
          dob: `${dt[1]}-${dt[2]}-${dt[3]}`,
          category: "others",
        });
    }
    return out;
  }
  for (const line of text.split(/\r?\n/)) {
    const [name, dob, cat] = line.split(",").map((s) => s?.trim());
    if (name && dob && /^\d{4}-\d{2}-\d{2}$/.test(dob))
      out.push({
        name,
        dob,
        category: cats.includes(cat as Category) ? (cat as Category) : "others",
      });
  }
  return out;
}

export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
