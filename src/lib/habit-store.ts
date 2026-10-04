import { useSyncExternalStore } from "react";
import { MONTHS } from "./birth";

export type HabitCategory = "Personal" | "Health" | "Fitness" | "Study" | "Productivity" | "Other";

export type TargetType = "time" | "quantity" | "yesno";
export type FrequencyType = "everyday" | "weekdays" | "custom";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  targetType: TargetType;
  targetValue?: string; // e.g. "3L per day", "10 pages", "2 hours"
  targetStartTime?: string; // e.g. "05:00"
  targetEndTime?: string; // e.g. "06:00"
  frequency: FrequencyType;
  customDays?: number[]; // [0 = Sun, 1 = Mon, ..., 6 = Sat]
  startDate: string; // YYYY-MM-DD
  notes?: string;
  status: "active" | "paused";
  createdAt: string;
  updatedAt: string;
};

export type HabitCompletionStatus = "completed" | "missed" | "unmarked";

export type HabitCompletion = {
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitCompletionStatus;
};

export const HABIT_CATEGORIES: HabitCategory[] = [
  "Personal",
  "Health",
  "Fitness",
  "Study",
  "Productivity",
  "Other",
];

export const HABIT_ICONS = [
  { name: "AlarmClock", label: "Alarm" },
  { name: "Dumbbell", label: "Fitness" },
  { name: "BookOpen", label: "Reading" },
  { name: "Droplets", label: "Water" },
  { name: "Coffee", label: "Routine" },
  { name: "GraduationCap", label: "Study" },
  { name: "Laptop", label: "Work" },
  { name: "Sparkles", label: "Meditation" },
  { name: "Heart", label: "Health" },
  { name: "Smile", label: "Mood" },
  { name: "Target", label: "Goal" },
  { name: "Footprints", label: "Walk" },
  { name: "Moon", label: "Sleep" },
  { name: "Sun", label: "Morning" },
  { name: "Apple", label: "Diet" },
  { name: "CheckCircle2", label: "Check" },
] as const;

const HABITS_KEY = "dobverse.habits";
const COMPLETIONS_KEY = "dobverse.habitCompletions";

const habitListeners = new Set<() => void>();
const completionListeners = new Set<() => void>();

let habitsCache: { raw: string | null; val: Habit[] } = { raw: null, val: [] };
let completionsCache: { raw: string | null; val: Record<string, HabitCompletionStatus> } = {
  raw: null,
  val: {},
};

const EMPTY_HABITS: Habit[] = [];
const EMPTY_COMPLETIONS: Record<string, HabitCompletionStatus> = {};

export const newId = () => Math.random().toString(36).slice(2, 10);

export function readHabits(): Habit[] {
  if (typeof window === "undefined") return EMPTY_HABITS;
  const raw = localStorage.getItem(HABITS_KEY);
  if (raw !== habitsCache.raw) {
    try {
      if (!raw) {
        habitsCache = { raw, val: [] };
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          habitsCache = { raw, val: parsed };
        } else {
          habitsCache = { raw, val: [] };
        }
      }
    } catch {
      habitsCache = { raw, val: [] };
    }
  }
  return habitsCache.val;
}

function writeHabits(list: Habit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(list));
  habitsCache = { raw: JSON.stringify(list), val: list };
  habitListeners.forEach((l) => l());
}

export function readCompletions(): Record<string, HabitCompletionStatus> {
  if (typeof window === "undefined") return EMPTY_COMPLETIONS;
  const raw = localStorage.getItem(COMPLETIONS_KEY);
  if (raw !== completionsCache.raw) {
    try {
      if (!raw) {
        completionsCache = { raw, val: {} };
      } else {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          completionsCache = { raw, val: parsed };
        } else {
          completionsCache = { raw, val: {} };
        }
      }
    } catch {
      completionsCache = { raw, val: {} };
    }
  }
  return completionsCache.val;
}

function writeCompletions(map: Record<string, HabitCompletionStatus>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(map));
  completionsCache = { raw: JSON.stringify(map), val: map };
  completionListeners.forEach((l) => l());
}

export function useHabits(): Habit[] {
  return useSyncExternalStore(
    (cb) => {
      habitListeners.add(cb);
      return () => habitListeners.delete(cb);
    },
    readHabits,
    () => EMPTY_HABITS,
  );
}

export function useHabitCompletions(): Record<string, HabitCompletionStatus> {
  return useSyncExternalStore(
    (cb) => {
      completionListeners.add(cb);
      return () => completionListeners.delete(cb);
    },
    readCompletions,
    () => EMPTY_COMPLETIONS,
  );
}

export function getHabitById(id: string): Habit | undefined {
  return readHabits().find((h) => h.id === id);
}

export function saveHabit(
  habitData: Omit<Habit, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Habit {
  const habits = readHabits();
  const nowStr = new Date().toISOString();

  if (habitData.id) {
    const existing = habits.find((h) => h.id === habitData.id);
    if (existing) {
      const updated: Habit = {
        ...existing,
        ...habitData,
        id: habitData.id,
        updatedAt: nowStr,
      };
      writeHabits(habits.map((h) => (h.id === updated.id ? updated : h)));
      return updated;
    }
  }

  const newHabit: Habit = {
    ...habitData,
    id: newId(),
    status: habitData.status || "active",
    createdAt: nowStr,
    updatedAt: nowStr,
  };
  writeHabits([...habits, newHabit]);
  return newHabit;
}

export function toggleHabitPause(id: string) {
  const habits = readHabits();
  const target = habits.find((h) => h.id === id);
  if (!target) return;
  const newStatus = target.status === "active" ? "paused" : "active";
  writeHabits(
    habits.map((h) =>
      h.id === id ? { ...h, status: newStatus, updatedAt: new Date().toISOString() } : h,
    ),
  );
}

export function deleteHabit(id: string) {
  const habits = readHabits().filter((h) => h.id !== id);
  writeHabits(habits);

  // Clean up completions for this habit
  const completions = { ...readCompletions() };
  let changed = false;
  for (const key of Object.keys(completions)) {
    if (key.startsWith(`${id}:`)) {
      delete completions[key];
      changed = true;
    }
  }
  if (changed) {
    writeCompletions(completions);
  }
}

export function getCompletionKey(habitId: string, dateStr: string): string {
  return `${habitId}:${dateStr}`;
}

export function setHabitCompletion(
  habitId: string,
  dateStr: string,
  status: HabitCompletionStatus,
) {
  const completions = { ...readCompletions() };
  const key = getCompletionKey(habitId, dateStr);
  if (status === "unmarked") {
    delete completions[key];
  } else {
    completions[key] = status;
  }
  writeCompletions(completions);
}

/** Toggle completion state: unmarked -> completed -> missed -> unmarked */
export function cycleHabitCompletion(habitId: string, dateStr: string): HabitCompletionStatus {
  const completions = readCompletions();
  const key = getCompletionKey(habitId, dateStr);
  const current = completions[key] || "unmarked";
  let next: HabitCompletionStatus = "completed";
  if (current === "completed") next = "missed";
  else if (current === "missed") next = "unmarked";
  else next = "completed";

  setHabitCompletion(habitId, dateStr, next);
  return next;
}

// -------------------------------------------------------------
// Date & Statistics Calculation Helpers
// -------------------------------------------------------------

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatGoalString(habit: Habit): string {
  if (habit.targetType === "time") {
    if (habit.targetStartTime && habit.targetEndTime) {
      return `${fmtTimeStr(habit.targetStartTime)} – ${fmtTimeStr(habit.targetEndTime)}`;
    }
    if (habit.targetStartTime) {
      return fmtTimeStr(habit.targetStartTime);
    }
    return "Scheduled Time";
  }
  if (habit.targetType === "quantity") {
    return habit.targetValue || "Daily Target";
  }
  return habit.targetValue || "Yes / No";
}

export function fmtTimeStr(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Check if a habit was expected to be completed on a specific calendar date */
export function isHabitExpectedOnDate(habit: Habit, dateStr: string): boolean {
  if (dateStr < habit.startDate) return false;
  // If habit is paused, it shouldn't generate future expectations, but historical or explicitly marked ones count
  if (habit.status === "paused") {
    return false;
  }

  const d = parseDateKey(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (habit.frequency === "everyday") {
    return true;
  }
  if (habit.frequency === "weekdays") {
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
  }
  if (habit.frequency === "custom") {
    return (habit.customDays || []).includes(dayOfWeek);
  }

  return true;
}

export type WeekGroup = {
  weekNumber: number;
  label: string; // "Week 1"
  dateRangeLabel: string; // "Oct 1 – Oct 4"
  days: {
    date: Date;
    dateStr: string; // "2026-10-01"
    dayNumber: number; // 1
    weekdayShort: string; // "Thu"
    isToday: boolean;
    isPast: boolean;
    isFuture: boolean;
  }[];
};

export const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Split a month into dynamic week groups (Week 1, Week 2, ...).
 * Week 1 begins on day 1 and runs to the first Sunday.
 * Subsequent weeks run Mon-Sun, and the final week ends on the month's last day.
 */
export function getMonthWeekGroups(
  year: number,
  monthIndex: number,
  today: Date = new Date(),
): WeekGroup[] {
  const todayKey = toDateKey(today);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthNameShort = MONTHS[monthIndex].slice(0, 3);

  const groups: WeekGroup[] = [];
  let currentDays: WeekGroup["days"] = [];
  let weekNum = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    const dateStr = toDateKey(d);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday

    currentDays.push({
      date: d,
      dateStr,
      dayNumber: day,
      weekdayShort: SHORT_WEEKDAYS[dayOfWeek],
      isToday: dateStr === todayKey,
      isPast: dateStr < todayKey,
      isFuture: dateStr > todayKey,
    });

    // Close the week group on Sunday (0) or on the last day of the month
    if (dayOfWeek === 0 || day === daysInMonth) {
      const firstDay = currentDays[0].dayNumber;
      const lastDay = currentDays[currentDays.length - 1].dayNumber;
      groups.push({
        weekNumber: weekNum,
        label: `Week ${weekNum}`,
        dateRangeLabel: `${monthNameShort} ${firstDay} – ${monthNameShort} ${lastDay}`,
        days: currentDays,
      });
      currentDays = [];
      weekNum++;
    }
  }

  return groups;
}

/** Calculate consecutive expected completed days up to today */
export function calculateHabitStreak(
  habit: Habit,
  completions: Record<string, HabitCompletionStatus>,
  today: Date = new Date(),
): number {
  let streak = 0;
  const curr = new Date(today);
  const todayStr = toDateKey(today);

  // Check today first
  const todayExpected = isHabitExpectedOnDate(habit, todayStr);
  const todayKey = getCompletionKey(habit.id, todayStr);
  const todayStatus = completions[todayKey];

  if (todayExpected) {
    if (todayStatus === "completed") {
      streak++;
    } else if (todayStatus === "missed") {
      return 0;
    }
    // If unmarked today, we don't break streak yet; we look backwards from yesterday.
  }

  // Go backwards day by day
  curr.setDate(curr.getDate() - 1);
  const maxLookbackDays = 365;
  let count = 0;

  while (count < maxLookbackDays) {
    const dateStr = toDateKey(curr);
    if (dateStr < habit.startDate) break;

    const expected = isHabitExpectedOnDate(habit, dateStr);
    if (expected) {
      const key = getCompletionKey(habit.id, dateStr);
      const status = completions[key];
      if (status === "completed") {
        streak++;
      } else {
        // Any missed or unmarked past expected day breaks the current streak
        break;
      }
    }
    curr.setDate(curr.getDate() - 1);
    count++;
  }

  return streak;
}

export type HabitMonthStats = {
  habitId: string;
  expectedCount: number;
  completedCount: number;
  missedCount: number;
  completionRate: number; // 0 - 100
  streak: number;
  isPerfect: boolean;
};

export type TrackerMonthStats = {
  totalHabits: number;
  activeHabits: number;
  pausedHabits: number;
  totalExpected: number;
  totalCompleted: number;
  monthlyProgress: number; // 0 - 100
  currentStreak: number;
  perfectHabitsCount: number;
  habitStatsMap: Record<string, HabitMonthStats>;
  topHabits: { habit: Habit; stats: HabitMonthStats }[];
  weeklyCompletionRates: { week: WeekGroup; completed: number; expected: number; rate: number }[];
  categoryDistribution: {
    category: HabitCategory;
    count: number;
    percentage: number;
    color: string;
  }[];
};

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health: "var(--color-success)",
  Productivity: "var(--color-primary)",
  Study: "var(--color-info)",
  Personal: "var(--color-warn)",
  Fitness: "var(--color-magenta)",
  Other: "var(--color-chart-5)",
};

export function calculateMonthStats(
  habits: Habit[],
  completions: Record<string, HabitCompletionStatus>,
  year: number,
  monthIndex: number,
  today: Date = new Date(),
): TrackerMonthStats {
  const weekGroups = getMonthWeekGroups(year, monthIndex, today);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const habitStatsMap: Record<string, HabitMonthStats> = {};
  let totalExpected = 0;
  let totalCompleted = 0;
  let maxStreak = 0;

  const activeHabitsList = habits.filter((h) => h.status === "active");
  const pausedHabitsList = habits.filter((h) => h.status === "paused");

  for (const habit of habits) {
    let expectedCount = 0;
    let completedCount = 0;
    let missedCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIndex, d);
      const dateStr = toDateKey(dateObj);
      const key = getCompletionKey(habit.id, dateStr);
      const status = completions[key];

      // If habit is paused, historical records are preserved
      const isExpected = isHabitExpectedOnDate(habit, dateStr);
      if (isExpected) {
        expectedCount++;
        if (status === "completed") completedCount++;
        else if (status === "missed") missedCount++;
      } else if (status === "completed") {
        // If marked completed even if not strictly expected
        completedCount++;
      }
    }

    const completionRate =
      expectedCount > 0 ? Math.round((completedCount / expectedCount) * 100) : 0;
    const streak = calculateHabitStreak(habit, completions, today);
    if (habit.status === "active" && streak > maxStreak) {
      maxStreak = streak;
    }

    const isPerfect = expectedCount > 0 && completedCount >= expectedCount;

    habitStatsMap[habit.id] = {
      habitId: habit.id,
      expectedCount,
      completedCount,
      missedCount,
      completionRate,
      streak,
      isPerfect,
    };

    if (habit.status === "active") {
      totalExpected += expectedCount;
      totalCompleted += completedCount;
    }
  }

  const monthlyProgress =
    totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

  const perfectHabitsCount = activeHabitsList.filter((h) => habitStatsMap[h.id]?.isPerfect).length;

  // Top performing habits (active habits sorted by completion rate descending)
  const topHabits = activeHabitsList
    .map((h) => ({
      habit: h,
      stats: habitStatsMap[h.id] || {
        habitId: h.id,
        expectedCount: 0,
        completedCount: 0,
        missedCount: 0,
        completionRate: 0,
        streak: 0,
        isPerfect: false,
      },
    }))
    .sort((a, b) => b.stats.completionRate - a.stats.completionRate);

  // Weekly completion rates
  const weeklyCompletionRates = weekGroups.map((week) => {
    let weekExpected = 0;
    let weekCompleted = 0;

    for (const habit of activeHabitsList) {
      for (const day of week.days) {
        if (isHabitExpectedOnDate(habit, day.dateStr)) {
          weekExpected++;
          const key = getCompletionKey(habit.id, day.dateStr);
          if (completions[key] === "completed") {
            weekCompleted++;
          }
        }
      }
    }

    const rate = weekExpected > 0 ? Math.round((weekCompleted / weekExpected) * 100) : 0;
    return {
      week,
      expected: weekExpected,
      completed: weekCompleted,
      rate,
    };
  });

  // Category distribution
  const categoryCounts: Record<HabitCategory, number> = {
    Health: 0,
    Productivity: 0,
    Study: 0,
    Personal: 0,
    Fitness: 0,
    Other: 0,
  };

  habits.forEach((h) => {
    if (categoryCounts[h.category] !== undefined) {
      categoryCounts[h.category]++;
    } else {
      categoryCounts.Other++;
    }
  });

  const totalHabitsCount = habits.length;
  const categoryDistribution = HABIT_CATEGORIES.map((cat) => {
    const count = categoryCounts[cat] || 0;
    const percentage = totalHabitsCount > 0 ? Math.round((count / totalHabitsCount) * 100) : 0;
    return {
      category: cat,
      count,
      percentage,
      color: CATEGORY_COLORS[cat] || "var(--color-primary)",
    };
  }).filter((c) => c.count > 0);

  return {
    totalHabits: habits.length,
    activeHabits: activeHabitsList.length,
    pausedHabits: pausedHabitsList.length,
    totalExpected,
    totalCompleted,
    monthlyProgress,
    currentStreak: maxStreak,
    perfectHabitsCount,
    habitStatsMap,
    topHabits,
    weeklyCompletionRates,
    categoryDistribution,
  };
}
