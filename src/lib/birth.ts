export type BirthInfo = {
  name?: string;
  dob: string; // YYYY-MM-DD
  time?: string; // HH:mm
  country?: string;
  city?: string;
};

const DAY = 86_400_000;
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function birthDate(info: BirthInfo): Date {
  const [y, m, d] = info.dob.split("-").map(Number);
  const [hh, mm] = (info.time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
}

export const weekday = (d: Date) => WEEKDAYS[d.getDay()];
export const fmtDate = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
export const fmtLong = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtTime = (info: BirthInfo) => {
  if (!info.time) return "Not provided";
  const [h, m] = info.time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const fmtPlace = (info: BirthInfo) =>
  [info.city, info.country].filter(Boolean).join(", ") || "Not provided";
export const pad = (n: number) => String(n).padStart(2, "0");

export function addYears(d: Date, n: number) {
  const r = new Date(d);
  r.setFullYear(d.getFullYear() + n);
  if (r.getMonth() !== d.getMonth()) {
    return new Date(
      r.getFullYear(),
      d.getMonth() + 1,
      0,
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
    );
  }
  return r;
}

export function ageParts(birth: Date, now: Date) {
  let years = now.getFullYear() - birth.getFullYear();
  let anchor = addYears(birth, years);
  if (anchor > now) {
    years--;
    anchor = addYears(birth, years);
  }
  let months = 0;
  let m = new Date(anchor);
  while (true) {
    const next = new Date(anchor);
    next.setMonth(anchor.getMonth() + months + 1);
    if (next > now) break;
    months++;
    m = next;
  }
  let rest = now.getTime() - m.getTime();
  const days = Math.floor(rest / DAY);
  rest -= days * DAY;
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  return { years, months, days, hours, minutes, seconds };
}

export function totals(birth: Date, now: Date) {
  const ms = Math.max(0, now.getTime() - birth.getTime());
  const a = ageParts(birth, now);
  return {
    ms,
    days: Math.floor(ms / DAY),
    weeks: Math.floor(ms / (7 * DAY)),
    months: a.years * 12 + a.months,
    years: a.years,
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor(ms / 60_000),
    seconds: Math.floor(ms / 1000),
  };
}

export function leapYearsLived(birth: Date, now: Date) {
  let c = 0;
  for (let y = birth.getFullYear(); y <= now.getFullYear(); y++) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) {
      const f = new Date(y, 1, 29);
      if (f >= birth && f <= now) c++;
    }
  }
  return c;
}

export function nextBirthday(birth: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let years = today.getFullYear() - birth.getFullYear();
  let target = addYears(birth, years);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  if (targetDay.getTime() === today.getTime()) {
    return {
      date: target,
      turning: years,
      progress: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      daysLeft: 0,
    };
  }

  if (targetDay < today) {
    years++;
    target = addYears(birth, years);
  }

  const prev = addYears(birth, years - 1);
  const remaining = Math.max(0, target.getTime() - now.getTime());
  const totalSpan = target.getTime() - prev.getTime();
  const progress = Math.min(1, Math.max(0, (now.getTime() - prev.getTime()) / totalSpan));

  return {
    date: target,
    turning: years,
    progress,
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
    daysLeft: Math.ceil(remaining / DAY),
  };
}

export function humanIn(target: Date, now: Date) {
  const days = Math.ceil((target.getTime() - now.getTime()) / DAY);
  if (days < 365) return `In ${days} days`;
  const y = Math.floor(days / 365.25);
  const rd = Math.round(days - y * 365.25);
  return rd > 0 && y < 10 ? `In ${y} year${y > 1 ? "s" : ""}, ${rd} days` : `In ${y} years`;
}

export type Milestone = {
  key: string;
  title: string;
  desc?: string;
  badge: string;
  date: Date;
  kind: "birthday" | "days" | "seconds" | "born";
  dayNumber: number;
  age: number;
};

export function milestones(birth: Date): Milestone[] {
  const list: Milestone[] = [];
  const dayN = (d: Date) => Math.round((d.getTime() - birth.getTime()) / DAY) + 1;
  const ageAt = (d: Date) => (d.getTime() - birth.getTime()) / (365.25 * DAY);
  const push = (m: Omit<Milestone, "dayNumber" | "age">) =>
    list.push({ ...m, dayNumber: dayN(m.date), age: ageAt(m.date) });
  push({
    key: "born",
    title: "You Were Born",
    desc: "The beginning of your amazing journey.",
    badge: "★",
    date: birth,
    kind: "born",
  });
  const dayMs: [number, string, string?][] = [
    [100, "100", "Your first 100 days in this world."],
    [500, "500"],
    [1000, "1K"],
    [2500, "2.5K"],
    [5000, "5K"],
    [7500, "7.5K"],
    [10000, "10K"],
    [15000, "15K"],
    [20000, "20K"],
    [25000, "25K"],
    [30000, "30K"],
  ];
  for (const [n, badge, desc] of dayMs)
    push({
      key: `d${n}`,
      title: `${n.toLocaleString()} Days of Life`,
      desc,
      badge,
      date: new Date(birth.getTime() + (n - 1) * DAY),
      kind: "days",
    });
  const bdays: [number, string, string?][] = [
    [1, "First Birthday", "You completed your first year."],
    [5, "5th Birthday", "Half a decade of memories!"],
    [10, "10th Birthday", "Double digits unlocked!"],
    [13, "13th Birthday", "Officially a teenager!"],
    [16, "16th Birthday"],
    [18, "18th Birthday", "Officially an adult."],
    [21, "21st Birthday"],
    [25, "25th Birthday", "A quarter century!"],
    [30, "30th Birthday"],
    [35, "35th Birthday"],
    [40, "40th Birthday"],
    [50, "50th Birthday", "Half a century!"],
    [60, "60th Birthday (Retirement Age)", "A new chapter of life begins."],
  ];
  for (const [n, title, desc] of bdays)
    push({
      key: `b${n}`,
      title,
      desc,
      badge: String(n),
      date: addYears(birth, n),
      kind: "birthday",
    });
  push({
    key: "s01",
    title: "100 Million Seconds of Life",
    badge: "100M",
    date: new Date(birth.getTime() + 1e11),
    kind: "seconds",
  });
  push({
    key: "s05",
    title: "500 Million Seconds of Life",
    badge: "500M",
    date: new Date(birth.getTime() + 5e11),
    kind: "seconds",
  });
  push({
    key: "s1",
    title: "1 Billion Seconds of Life",
    desc: "You've lived 1 billion seconds!",
    badge: "1B",
    date: new Date(birth.getTime() + 1e12),
    kind: "seconds",
  });
  push({
    key: "s2",
    title: "2 Billion Seconds of Life",
    badge: "2B",
    date: new Date(birth.getTime() + 2e12),
    kind: "seconds",
  });
  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Estimates based on commonly cited averages.
export function lifeStats(birth: Date, now: Date) {
  const days = Math.max(0, (now.getTime() - birth.getTime()) / DAY);
  const min = days * 1440;
  let sundays = 0;
  const first = new Date(birth);
  first.setDate(first.getDate() + ((7 - first.getDay()) % 7));
  if (first <= now) sundays = Math.floor((now.getTime() - first.getTime()) / (7 * DAY)) + 1;
  return {
    days,
    heartbeats: min * 80,
    breaths: min * 16,
    steps: days * 5000,
    blinks: days * 16 * 60 * 15,
    hoursSlept: days * 8 * 0.95,
    water: days * 2.2,
    calories: days * 2100,
    thoughts: days * 6200,
    seasons: Math.floor(days / 91.31),
    sundays,
    fullMoons: Math.floor(days / 29.53),
    sunrises: Math.floor(days),
  };
}

export function compact(n: number) {
  if (n >= 1e9) return { v: (n / 1e9).toFixed(2).replace(/\.?0+$/, ""), u: "Billion", s: "B" };
  if (n >= 1e6)
    return { v: (n / 1e6).toFixed(n >= 1e8 ? 0 : 2).replace(/\.?0+$/, ""), u: "Million", s: "M" };
  if (n >= 1e3) return { v: (n / 1e3).toFixed(1).replace(/\.0$/, ""), u: "K", s: "K" };
  return { v: Math.round(n).toString(), u: "", s: "" };
}
export const short = (n: number) => {
  const c = compact(n);
  return `${c.v}${c.s}`;
};
export const words = (n: number) => {
  const c = compact(n);
  return `${c.v} ${c.u}`.trim();
};

export function decadeBreakdown(birth: Date, now: Date) {
  const age = (now.getTime() - birth.getTime()) / (365.25 * DAY);
  const ranges: [string, number, number][] = [
    ["0 – 10 Years", 0, 10],
    ["10 – 20 Years", 10, 20],
    ["20 – 30 Years", 20, 30],
    ["30 – 40 Years", 30, 40],
    ["40+ Years", 40, 200],
  ];
  return ranges.map(([label, a, b]) => ({
    label,
    pct: age <= 0 ? 0 : (Math.max(0, Math.min(age, b) - a) / age) * 100,
  }));
}

export function greeting(now: Date) {
  const h = now.getHours();
  return h < 12 ? "Good Morning!" : h < 17 ? "Good Afternoon!" : "Good Evening!";
}
