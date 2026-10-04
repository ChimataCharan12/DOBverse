import { useSyncExternalStore } from "react";
import { toDateKey } from "./habit-store";

export type TaskCategory =
  "Study" | "Project" | "College" | "Exercise" | "Personal" | "Meeting" | "Other";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type PlannerTask = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category?: TaskCategory;
  priority?: TaskPriority;
  completed: boolean;
  isFocus?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const TASK_CATEGORIES: TaskCategory[] = [
  "Study",
  "Project",
  "College",
  "Exercise",
  "Personal",
  "Meeting",
  "Other",
];

export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

const TASKS_KEY = "dobverse.tasks";
const taskListeners = new Set<() => void>();
let tasksCache: { raw: string | null; val: PlannerTask[] } = { raw: null, val: [] };
const EMPTY_TASKS: PlannerTask[] = [];

export const newTaskId = () => Math.random().toString(36).slice(2, 10);

export function readTasks(): PlannerTask[] {
  if (typeof window === "undefined") return EMPTY_TASKS;
  const raw = localStorage.getItem(TASKS_KEY);
  if (raw !== tasksCache.raw) {
    try {
      if (!raw) {
        tasksCache = { raw, val: [] };
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          tasksCache = { raw, val: parsed };
        } else {
          tasksCache = { raw, val: [] };
        }
      }
    } catch {
      tasksCache = { raw, val: [] };
    }
  }
  return tasksCache.val;
}

function writeTasks(list: PlannerTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(list));
  tasksCache = { raw: JSON.stringify(list), val: list };
  taskListeners.forEach((l) => l());
}

export function useTasks(): PlannerTask[] {
  return useSyncExternalStore(
    (cb) => {
      taskListeners.add(cb);
      return () => taskListeners.delete(cb);
    },
    readTasks,
    () => EMPTY_TASKS,
  );
}

export function getTaskById(id: string): PlannerTask | undefined {
  return readTasks().find((t) => t.id === id);
}

export function saveTask(
  taskData: Omit<PlannerTask, "id" | "createdAt" | "updatedAt"> & { id?: string },
): PlannerTask {
  const tasks = readTasks();
  const nowStr = new Date().toISOString();

  if (taskData.id) {
    const existing = tasks.find((t) => t.id === taskData.id);
    if (existing) {
      const updated: PlannerTask = {
        ...existing,
        ...taskData,
        id: taskData.id,
        updatedAt: nowStr,
      };
      writeTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      return updated;
    }
  }

  const newTask: PlannerTask = {
    ...taskData,
    id: newTaskId(),
    completed: taskData.completed ?? false,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
  writeTasks([...tasks, newTask]);
  return newTask;
}

export function deleteTask(id: string) {
  const tasks = readTasks().filter((t) => t.id !== id);
  writeTasks(tasks);
}

export function toggleTaskCompleted(id: string) {
  const tasks = readTasks();
  writeTasks(
    tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t,
    ),
  );
}

export function toggleTaskFocus(id: string) {
  const tasks = readTasks();
  writeTasks(
    tasks.map((t) =>
      t.id === id ? { ...t, isFocus: !t.isFocus, updatedAt: new Date().toISOString() } : t,
    ),
  );
}

export function formatTimeRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  if (start && end) {
    return `${formatTime(start)} – ${formatTime(end)}`;
  }
  if (start) {
    return formatTime(start);
  }
  return formatTime(end);
}

export type DailyPlannerStats = {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  progress: number; // 0 - 100
};

export function calculateDailyStats(
  tasks: PlannerTask[],
  dateStr: string,
  now: Date = new Date(),
): DailyPlannerStats {
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const todayStr = toDateKey(now);
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // Overdue logic:
  // If task is incomplete:
  // - If task date is in the past: it is overdue.
  // - If task date is today AND it has a specified endTime (or startTime) that has already passed: it is overdue.
  const overdue = dayTasks.filter((t) => {
    if (t.completed) return false;
    if (t.date < todayStr) return true;
    if (t.date === todayStr) {
      const dueTime = t.endTime || t.startTime;
      if (dueTime && dueTime < currentTimeStr) {
        return true;
      }
    }
    return false;
  }).length;

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    overdue,
    progress,
  };
}

export function getTaskDatesInMonth(
  tasks: PlannerTask[],
  year: number,
  monthIndex: number,
): Set<string> {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const set = new Set<string>();
  tasks.forEach((t) => {
    if (t.date.startsWith(prefix)) {
      set.add(t.date);
    }
  });
  return set;
}
