import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  CalendarCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Star,
  Calendar as CalendarIcon,
  Trophy,
  Check,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel } from "@/components/app/ui";
import {
  useTasks,
  saveTask,
  deleteTask,
  toggleTaskCompleted,
  toggleTaskFocus,
  calculateDailyStats,
  formatTimeRange,
  getTaskDatesInMonth,
  TASK_CATEGORIES,
  type PlannerTask,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/planner-store";
import { toDateKey, parseDateKey } from "@/lib/habit-store";
import { useNow } from "@/lib/birth-store";
import { MONTHS, WEEKDAYS } from "@/lib/birth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_dash/daily-planner/")({
  validateSearch: (search: Record<string, unknown>): { date?: string } => {
    return {
      date: typeof search["date"] === "string" ? (search["date"] as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Daily Planner — DOBverse" },
      {
        name: "description",
        content:
          "Plan your day, track tasks, and stay productive with local privacy-first storage.",
      },
    ],
  }),
  component: DailyPlannerPage,
});

const PRIORITY_BADGES: Record<TaskPriority, { label: string; className: string }> = {
  Low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  Medium: { label: "Medium", className: "bg-info/15 text-info border-info/30" },
  High: { label: "High", className: "bg-warn/15 text-warn border-warn/30" },
  Urgent: {
    label: "Urgent",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Study: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  Project: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  College: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  Exercise: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Personal: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Meeting: "bg-pink-500/15 text-pink-500 border-pink-500/30",
  Other: "bg-muted text-muted-foreground border-border",
};

function DailyPlannerPage() {
  const search = Route.useSearch();
  const queryDate = search.date;
  const liveNow = useNow(60_000);
  const now = useMemo(() => liveNow ?? new Date(), [liveNow]);
  const navigate = useNavigate();

  // Selected Planner Date
  const [selectedDate, setSelectedDate] = useState(() => queryDate || toDateKey(now));

  // Sync if query date changes
  useEffect(() => {
    if (queryDate && queryDate !== selectedDate) {
      setSelectedDate(queryDate);
      const parsed = parseDateKey(queryDate);
      setCalendarYear(parsed.getFullYear());
      setCalendarMonth(parsed.getMonth());
    }
  }, [queryDate, selectedDate]);

  // Calendar Widget Month State
  const [calendarYear, setCalendarYear] = useState(() => {
    const d = queryDate ? parseDateKey(queryDate) : now;
    return d.getFullYear();
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = queryDate ? parseDateKey(queryDate) : now;
    return d.getMonth();
  });

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<TaskCategory>("Study");

  // Task Delete State
  const [taskToDelete, setTaskToDelete] = useState<PlannerTask | null>(null);

  // Store data
  const allTasks = useTasks();

  // Date Navigation
  const handlePrevDay = () => {
    const current = parseDateKey(selectedDate);
    current.setDate(current.getDate() - 1);
    const newDateStr = toDateKey(current);
    setSelectedDate(newDateStr);
    setCalendarYear(current.getFullYear());
    setCalendarMonth(current.getMonth());
  };

  const handleNextDay = () => {
    const current = parseDateKey(selectedDate);
    current.setDate(current.getDate() + 1);
    const newDateStr = toDateKey(current);
    setSelectedDate(newDateStr);
    setCalendarYear(current.getFullYear());
    setCalendarMonth(current.getMonth());
  };

  const handleGoToday = () => {
    const todayStr = toDateKey(now);
    setSelectedDate(todayStr);
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
  };

  // Selected date's tasks
  const dayTasks = useMemo(() => {
    return allTasks.filter((t) => t.date === selectedDate);
  }, [allTasks, selectedDate]);

  // Focus tasks for selected date
  const focusTasks = useMemo(() => {
    return dayTasks.filter((t) => t.isFocus);
  }, [dayTasks]);

  // Daily statistics
  const stats = useMemo(() => {
    return calculateDailyStats(allTasks, selectedDate, now);
  }, [allTasks, selectedDate, now]);

  // Set of dates with tasks in the calendar month
  const taskDatesInMonth = useMemo(() => {
    return getTaskDatesInMonth(allTasks, calendarYear, calendarMonth);
  }, [allTasks, calendarYear, calendarMonth]);

  // Quick Add Handler: Saves immediately on selectedDate, does NOT navigate
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    saveTask({
      title: quickTitle.trim(),
      date: selectedDate,
      category: quickCategory,
      priority: "Medium",
      completed: false,
      isFocus: false,
    });

    setQuickTitle("");
    toast.success("Task added to planner!");
  };

  // Calendar Month Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    // Convert to Monday-start (0 = Mon, ..., 6 = Sun)
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      hasTasks: boolean;
      isSelected: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = toDateKey(now);

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthIdx = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        hasTasks: allTasks.some((t) => t.date === dateStr),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        hasTasks: taskDatesInMonth.has(dateStr),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        hasTasks: allTasks.some((t) => t.date === dateStr),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [calendarYear, calendarMonth, allTasks, taskDatesInMonth, selectedDate, now]);

  const selectedDateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <Topbar title="Daily Planner" subtitle="Plan your day, stay organized and get things done." />

      {/* Date Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-card text-card-foreground shadow-soft transition hover:bg-accent"
            aria-label="Previous Day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-2 text-sm font-semibold shadow-soft">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <div>
              <span>
                {MONTHS[selectedDateObj.getMonth()]} {selectedDateObj.getDate()},{" "}
                {selectedDateObj.getFullYear()}
              </span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {WEEKDAYS[selectedDateObj.getDay()]}
              </span>
            </div>
          </div>

          <button
            onClick={handleNextDay}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-card text-card-foreground shadow-soft transition hover:bg-accent"
            aria-label="Next Day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleGoToday}
            className="rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold shadow-soft transition hover:bg-accent"
          >
            Today
          </button>
        </div>

        <Link
          to="/daily-planner/add"
          search={{ date: selectedDate } as Record<string, string>}
          className="flex items-center gap-2 rounded-xl bg-gradient-cta px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Main Column (7 cols on lg, 8 on xl) */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Today's Tasks Panel */}
          <Panel className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Today's Tasks</h3>
                  <p className="text-xs text-muted-foreground">
                    {stats.completed} of {stats.total} completed
                  </p>
                </div>
              </div>

              {/* Top Progress bar */}
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-cta transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary">{stats.progress}%</span>
              </div>
            </div>

            {/* Tasks List */}
            {dayTasks.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <div className="text-base font-semibold">No tasks planned for today</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add a task to start planning your day, stay organized, and build momentum.
                  </p>
                  <Link
                    to="/daily-planner/add"
                    search={{ date: selectedDate } as Record<string, string>}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-cta px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayTasks.map((task) => {
                  const timeFormatted = formatTimeRange(task.startTime, task.endTime);
                  const priorityMeta = task.priority ? PRIORITY_BADGES[task.priority] : null;
                  const catColor = task.category ? CATEGORY_COLORS[task.category] : null;

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-xl border bg-card/80 p-3.5 shadow-sm transition hover:border-primary/50 hover:bg-accent/40",
                        task.completed && "bg-muted/30 opacity-75",
                      )}
                    >
                      {/* Left: Checkbox & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleTaskCompleted(task.id)}
                          aria-label={task.completed ? "Mark incomplete" : "Mark completed"}
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition",
                            task.completed
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm dark:bg-emerald-500"
                              : "border-border bg-background hover:border-primary/60",
                          )}
                        >
                          {task.completed && <Check className="h-4 w-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-sm font-semibold text-foreground transition truncate",
                              task.completed && "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle / Metadata badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        {timeFormatted && (
                          <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            <Clock className="h-3 w-3 text-primary" />
                            {timeFormatted}
                          </span>
                        )}

                        {task.category && (
                          <span
                            className={cn(
                              "rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
                              catColor,
                            )}
                          >
                            {task.category}
                          </span>
                        )}

                        {priorityMeta && (
                          <span
                            className={cn(
                              "hidden md:inline-block rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
                              priorityMeta.className,
                            )}
                          >
                            {priorityMeta.label}
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskFocus(task.id)}
                          title={task.isFocus ? "Remove from Focus" : "Add to Focus"}
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-lg transition",
                            task.isFocus
                              ? "text-amber-500 hover:bg-amber-500/10"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <Star className={cn("h-4 w-4", task.isFocus && "fill-amber-500")} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              to: "/daily-planner/add",
                              search: { edit: task.id, date: selectedDate } as Record<
                                string,
                                string
                              >,
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                          aria-label="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Today's Progress Card */}
            <Panel className="flex items-center gap-4 p-5">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center">
                <svg className="h-20 w-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-primary transition-all duration-500"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 32 * (1 - (stats.total > 0 ? stats.progress / 100 : 0))
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-base font-bold">{stats.progress}%</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-muted-foreground">Today's Progress</div>
                <div className="text-base font-bold">
                  {stats.completed} of {stats.total} completed
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trophy className="h-4 w-4 text-warn" />
                  <span>
                    {stats.progress === 100 && stats.total > 0
                      ? "All done! Great work! 🎉"
                      : stats.progress >= 50
                        ? "Keep going, doing great!"
                        : "Start tackling your tasks!"}
                  </span>
                </div>
              </div>
            </Panel>

            {/* Task Summary Card */}
            <Panel className="p-5">
              <div className="text-xs font-semibold text-muted-foreground mb-3">Task Summary</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Completed */}
                <div className="rounded-xl border bg-muted/20 p-2.5">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Completed</div>
                  <div className="text-lg font-bold text-foreground">{stats.completed}</div>
                </div>

                {/* Pending */}
                <div className="rounded-xl border bg-muted/20 p-2.5">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-info/15 text-info mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Pending</div>
                  <div className="text-lg font-bold text-foreground">{stats.pending}</div>
                </div>

                {/* Overdue */}
                <div className="rounded-xl border bg-muted/20 p-2.5">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-destructive/15 text-destructive mb-1">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Overdue</div>
                  <div className="text-lg font-bold text-foreground">{stats.overdue}</div>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Right Column (5 cols on lg, 4 on xl) */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          {/* 1. Mini Monthly Calendar */}
          <Panel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-foreground">
                {MONTHS[calendarMonth]} {calendarYear}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear((y) => y - 1);
                    } else {
                      setCalendarMonth((m) => m - 1);
                    }
                  }}
                  className="grid h-7 w-7 place-items-center rounded-lg border text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear((y) => y + 1);
                    } else {
                      setCalendarMonth((m) => m + 1);
                    }
                  }}
                  className="grid h-7 w-7 place-items-center rounded-lg border text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground mb-1.5">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((d) => {
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={cn(
                      "relative grid h-8 w-full place-items-center rounded-lg font-medium transition",
                      !d.isCurrentMonth && "text-muted-foreground/40",
                      d.isCurrentMonth && "text-foreground hover:bg-accent",
                      d.isSelected &&
                        "border border-primary bg-primary text-primary-foreground font-bold shadow-sm",
                      d.isToday &&
                        !d.isSelected &&
                        "border border-primary/50 text-primary font-bold",
                    )}
                  >
                    <span>{d.dayNumber}</span>
                    {d.hasTasks && (
                      <span
                        className={cn(
                          "absolute bottom-1 h-1 w-1 rounded-full",
                          d.isSelected ? "bg-white" : "bg-primary",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* 2. Quick Add Task */}
          <Panel className="space-y-3.5 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" />
              Quick Add Task
            </h4>

            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="What do you want to do?"
                  className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="rounded-xl bg-gradient-cta px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* Quick Category Chips */}
              <div className="flex flex-wrap gap-1.5">
                {TASK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setQuickCategory(cat)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition",
                      quickCategory === cat
                        ? "border-primary bg-primary/15 text-primary font-semibold"
                        : "bg-background text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </form>
          </Panel>

          {/* 3. Today's Focus */}
          <Panel className="space-y-3.5 p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Today's Focus
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {focusTasks.length} {focusTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {focusTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No focus tasks set for today. Star any task in your list to highlight it here.
              </p>
            ) : (
              <div className="space-y-2">
                {focusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded border transition",
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-border bg-background",
                        )}
                      >
                        {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <span
                        className={cn(
                          "truncate font-medium",
                          task.completed && "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.category && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0">
                        {task.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{taskToDelete?.title}"</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  deleteTask(taskToDelete.id);
                  toast.success(`Deleted task "${taskToDelete.title}"`);
                  setTaskToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
