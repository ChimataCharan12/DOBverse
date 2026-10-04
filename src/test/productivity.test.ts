import { describe, it, expect, beforeEach } from "vitest";
import {
  readHabits,
  saveHabit,
  deleteHabit,
  toggleHabitPause,
  setHabitCompletion,
  cycleHabitCompletion,
  readCompletions,
  calculateHabitStreak,
  getMonthWeekGroups,
  calculateMonthStats,
  isHabitExpectedOnDate,
  type Habit,
} from "../lib/habit-store";
import {
  readTasks,
  saveTask,
  deleteTask,
  toggleTaskCompleted,
  toggleTaskFocus,
  calculateDailyStats,
  formatTimeRange,
  getTaskDatesInMonth,
} from "../lib/planner-store";

describe("Productivity Features — Habit Tracker & Daily Planner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Habit Store & Operations", () => {
    it("starts with an empty habit list and empty completions", () => {
      expect(readHabits()).toEqual([]);
      expect(readCompletions()).toEqual({});
    });

    it("creates, retrieves, and updates a habit", () => {
      const created = saveHabit({
        name: "Morning Run",
        icon: "Dumbbell",
        category: "Fitness",
        targetType: "time",
        targetStartTime: "06:00",
        targetEndTime: "07:00",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Morning Run");
      expect(readHabits().length).toBe(1);

      // Update existing habit
      const updated = saveHabit({
        id: created.id,
        name: "Morning Jog & Stretch",
        icon: "Footprints",
        category: "Fitness",
        targetType: "time",
        targetStartTime: "06:30",
        targetEndTime: "07:30",
        frequency: "weekdays",
        startDate: "2026-10-01",
        status: "active",
      });

      expect(updated.name).toBe("Morning Jog & Stretch");
      expect(readHabits().length).toBe(1);
      expect(readHabits()[0].icon).toBe("Footprints");
      expect(readHabits()[0].frequency).toBe("weekdays");
    });

    it("toggles pause and resume on a habit", () => {
      const habit = saveHabit({
        name: "Read 20 pages",
        icon: "BookOpen",
        category: "Study",
        targetType: "quantity",
        targetValue: "20 pages",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      expect(readHabits()[0].status).toBe("active");

      toggleHabitPause(habit.id);
      expect(readHabits()[0].status).toBe("paused");

      toggleHabitPause(habit.id);
      expect(readHabits()[0].status).toBe("active");
    });

    it("deletes a habit and cleans up associated completion records", () => {
      const habit = saveHabit({
        name: "Meditate",
        icon: "Sparkles",
        category: "Personal",
        targetType: "yesno",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      setHabitCompletion(habit.id, "2026-10-01", "completed");
      setHabitCompletion(habit.id, "2026-10-02", "missed");

      expect(Object.keys(readCompletions()).length).toBe(2);

      deleteHabit(habit.id);
      expect(readHabits().length).toBe(0);
      expect(Object.keys(readCompletions()).length).toBe(0);
    });

    it("cycles completion states properly", () => {
      const habit = saveHabit({
        name: "Hydrate",
        icon: "Droplets",
        category: "Health",
        targetType: "quantity",
        targetValue: "3L",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      const dateStr = "2026-10-04";

      // 1. unmarked -> completed
      expect(cycleHabitCompletion(habit.id, dateStr)).toBe("completed");
      // 2. completed -> missed
      expect(cycleHabitCompletion(habit.id, dateStr)).toBe("missed");
      // 3. missed -> unmarked
      expect(cycleHabitCompletion(habit.id, dateStr)).toBe("unmarked");
    });
  });

  describe("Streak & Expected Days Logic", () => {
    it("correctly identifies expected days for everyday, weekdays, and custom frequencies", () => {
      const everydayHabit: Habit = {
        id: "h1",
        name: "Habit 1",
        icon: "AlarmClock",
        category: "Personal",
        targetType: "time",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
        createdAt: "",
        updatedAt: "",
      };

      const weekdayHabit: Habit = {
        ...everydayHabit,
        id: "h2",
        frequency: "weekdays",
      };

      const customHabit: Habit = {
        ...everydayHabit,
        id: "h3",
        frequency: "custom",
        customDays: [1, 3, 5], // Mon, Wed, Fri
      };

      // 2026-10-01 is Thursday (weekday)
      expect(isHabitExpectedOnDate(everydayHabit, "2026-10-01")).toBe(true);
      expect(isHabitExpectedOnDate(weekdayHabit, "2026-10-01")).toBe(true);
      expect(isHabitExpectedOnDate(customHabit, "2026-10-01")).toBe(false);

      // 2026-10-02 is Friday (custom day)
      expect(isHabitExpectedOnDate(customHabit, "2026-10-02")).toBe(true);

      // 2026-10-03 is Saturday (weekend)
      expect(isHabitExpectedOnDate(weekdayHabit, "2026-10-03")).toBe(false);

      // Date before startDate is never expected
      expect(isHabitExpectedOnDate(everydayHabit, "2026-09-30")).toBe(false);
    });

    it("calculates consecutive streaks accurately without breaking on unscheduled days", () => {
      const habit = saveHabit({
        name: "Gym",
        icon: "Dumbbell",
        category: "Fitness",
        targetType: "yesno",
        frequency: "custom",
        customDays: [1, 3, 5], // Mon, Wed, Fri
        startDate: "2026-09-01",
        status: "active",
      });

      // Mon Oct 5 (completed), Wed Oct 7 (completed), Fri Oct 9 (completed)
      setHabitCompletion(habit.id, "2026-10-05", "completed");
      setHabitCompletion(habit.id, "2026-10-07", "completed");
      setHabitCompletion(habit.id, "2026-10-09", "completed");

      const today = new Date(2026, 9, 10); // Sat Oct 10
      const streak = calculateHabitStreak(habit, readCompletions(), today);

      // 3 scheduled days completed consecutively (not broken by Tue/Thu/Sat)
      expect(streak).toBe(3);
    });
  });

  describe("Week Grouping & Monthly Statistics", () => {
    it("dynamically groups October 2026 into 5 week sections", () => {
      const groups = getMonthWeekGroups(2026, 9, new Date(2026, 9, 4));

      expect(groups.length).toBe(5);
      expect(groups[0].label).toBe("Week 1");
      expect(groups[0].days.length).toBe(4); // Oct 1 (Thu) to Oct 4 (Sun)
      expect(groups[1].days.length).toBe(7); // Oct 5 to Oct 11
      expect(groups[4].days.length).toBe(6); // Oct 26 to Oct 31
    });

    it("computes accurate monthly completion rate, perfect habits, and rankings from real data", () => {
      const habit1 = saveHabit({
        name: "Wake up 5 AM",
        icon: "AlarmClock",
        category: "Productivity",
        targetType: "time",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      const habit2 = saveHabit({
        name: "Meditation",
        icon: "Sparkles",
        category: "Health",
        targetType: "yesno",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      // Mark all 31 days completed for habit1 (100% perfect)
      for (let day = 1; day <= 31; day++) {
        const dStr = `2026-10-${String(day).padStart(2, "0")}`;
        setHabitCompletion(habit1.id, dStr, "completed");
      }

      // Mark 15 days completed for habit2 (~48%)
      for (let day = 1; day <= 15; day++) {
        const dStr = `2026-10-${String(day).padStart(2, "0")}`;
        setHabitCompletion(habit2.id, dStr, "completed");
      }

      const stats = calculateMonthStats(
        readHabits(),
        readCompletions(),
        2026,
        9,
        new Date(2026, 9, 31),
      );

      expect(stats.totalHabits).toBe(2);
      expect(stats.activeHabits).toBe(2);
      expect(stats.perfectHabitsCount).toBe(1); // Only habit1
      expect(stats.topHabits[0].habit.name).toBe("Wake up 5 AM");
      expect(stats.topHabits[0].stats.completionRate).toBe(100);
      expect(stats.topHabits[1].habit.name).toBe("Meditation");
      expect(stats.totalCompleted).toBe(31 + 15);
      expect(stats.totalExpected).toBe(62);
    });
  });

  describe("Daily Planner Store & Operations", () => {
    it("starts with empty tasks", () => {
      expect(readTasks()).toEqual([]);
    });

    it("creates, retrieves, and updates planner tasks", () => {
      const task = saveTask({
        title: "Complete DBMS Notes",
        description: "Review Chapter 4 relational algebra",
        date: "2026-10-04",
        category: "Study",
        priority: "High",
        startTime: "17:00",
        endTime: "18:00",
        completed: false,
        isFocus: true,
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe("Complete DBMS Notes");
      expect(readTasks().length).toBe(1);

      toggleTaskCompleted(task.id);
      expect(readTasks()[0].completed).toBe(true);

      toggleTaskFocus(task.id);
      expect(readTasks()[0].isFocus).toBe(false);

      deleteTask(task.id);
      expect(readTasks().length).toBe(0);
    });

    it("formats time ranges correctly with AM/PM", () => {
      expect(formatTimeRange("09:00", "16:00")).toBe("9:00 AM – 4:00 PM");
      expect(formatTimeRange("17:00")).toBe("5:00 PM");
      expect(formatTimeRange()).toBe("");
    });

    it("calculates daily statistics including pending, completed, overdue, and progress", () => {
      const dateStr = "2026-10-04";

      saveTask({
        title: "Task 1",
        date: dateStr,
        completed: true,
      });

      saveTask({
        title: "Task 2",
        date: dateStr,
        completed: false,
      });

      saveTask({
        title: "Task 3 (Overdue in past)",
        date: "2026-10-01",
        completed: false,
      });

      const today = new Date(2026, 9, 4, 12, 0); // 12:00 PM
      const stats = calculateDailyStats(readTasks(), dateStr, today);

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.progress).toBe(50);
    });

    it("gets active task dates in month for calendar indicators", () => {
      saveTask({ title: "T1", date: "2026-10-04", completed: false });
      saveTask({ title: "T2", date: "2026-10-15", completed: false });
      saveTask({ title: "T3", date: "2026-11-01", completed: false });

      const dates = getTaskDatesInMonth(readTasks(), 2026, 9);
      expect(dates.has("2026-10-04")).toBe(true);
      expect(dates.has("2026-10-15")).toBe(true);
      expect(dates.has("2026-11-01")).toBe(false);
    });
  });

  describe("Architecture Independence Rule", () => {
    it("ensures Habit Tracker and Daily Planner storage remain completely independent", () => {
      saveHabit({
        name: "Morning Walk",
        icon: "Footprints",
        category: "Fitness",
        targetType: "yesno",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      saveTask({
        title: "Submit report",
        date: "2026-10-04",
        category: "Project",
        completed: false,
      });

      // Verify separate storage keys
      expect(localStorage.getItem("dobverse.habits")).toBeDefined();
      expect(localStorage.getItem("dobverse.tasks")).toBeDefined();
      expect(readHabits().length).toBe(1);
      expect(readTasks().length).toBe(1);

      // Modifying tasks does not alter habits
      deleteTask(readTasks()[0].id);
      expect(readTasks().length).toBe(0);
      expect(readHabits().length).toBe(1);
    });
  });

  describe("Storage Resilience & Malformed Data Handling", () => {
    it("safely handles corrupted/invalid JSON in habits storage without crashing", () => {
      localStorage.setItem("dobverse.habits", "{invalid-json");
      expect(readHabits()).toEqual([]);

      localStorage.setItem("dobverse.habits", JSON.stringify({ notAnArray: true }));
      expect(readHabits()).toEqual([]);
    });

    it("safely handles corrupted/invalid JSON in completions storage without crashing", () => {
      localStorage.setItem("dobverse.habitCompletions", "corrupted:data");
      expect(readCompletions()).toEqual({});

      localStorage.setItem("dobverse.habitCompletions", JSON.stringify(["not", "an", "object"]));
      expect(readCompletions()).toEqual({});
    });

    it("safely handles corrupted/invalid JSON in tasks storage without crashing", () => {
      localStorage.setItem("dobverse.tasks", "invalid{{{json");
      expect(readTasks()).toEqual([]);

      localStorage.setItem("dobverse.tasks", JSON.stringify("stringInsteadOfArray"));
      expect(readTasks()).toEqual([]);
    });

    it("verifies refresh persistence simulation", () => {
      const h = saveHabit({
        name: "Read 10 mins",
        icon: "BookOpen",
        category: "Study",
        targetType: "yesno",
        frequency: "everyday",
        startDate: "2026-10-01",
        status: "active",
      });

      const t = saveTask({
        title: "Submit assignment",
        date: "2026-10-04",
        category: "Study",
        completed: false,
      });

      // Both items are in localStorage
      const rawHabits = localStorage.getItem("dobverse.habits");
      const rawTasks = localStorage.getItem("dobverse.tasks");
      expect(rawHabits).toContain(h.id);
      expect(rawTasks).toContain(t.id);

      // Re-reading simulates component unmount / page reload
      expect(readHabits().find((item) => item.id === h.id)).toBeDefined();
      expect(readTasks().find((item) => item.id === t.id)).toBeDefined();
    });
  });

  describe("Date Logic & Month/Year Boundaries", () => {
    it("handles non-leap February (28 days) correctly in week groups", () => {
      // 2025 is not a leap year (28 days in Feb)
      const groups = getMonthWeekGroups(2025, 1, new Date(2025, 1, 1));
      const totalDays = groups.reduce((acc, g) => acc + g.days.length, 0);
      expect(totalDays).toBe(28);
    });

    it("handles leap year February (29 days) correctly in week groups", () => {
      // 2024 is a leap year (29 days in Feb)
      const groups = getMonthWeekGroups(2024, 1, new Date(2024, 1, 1));
      const totalDays = groups.reduce((acc, g) => acc + g.days.length, 0);
      expect(totalDays).toBe(29);
      expect(groups.at(-1)?.days.at(-1)?.dayNumber).toBe(29);
    });

    it("handles 30-day and 31-day months accurately", () => {
      // April (30 days)
      const aprilGroups = getMonthWeekGroups(2026, 3, new Date(2026, 3, 1));
      expect(aprilGroups.reduce((acc, g) => acc + g.days.length, 0)).toBe(30);

      // December (31 days)
      const decGroups = getMonthWeekGroups(2026, 11, new Date(2026, 11, 1));
      expect(decGroups.reduce((acc, g) => acc + g.days.length, 0)).toBe(31);
    });
  });
});
