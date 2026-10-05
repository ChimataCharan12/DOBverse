import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Target,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Flame,
  Trophy,
  BarChart3,
  Check,
  X,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader, Donut, IconBubble } from "@/components/app/ui";
import {
  useHabits,
  useHabitCompletions,
  cycleHabitCompletion,
  toggleHabitPause,
  deleteHabit,
  calculateMonthStats,
  getMonthWeekGroups,
  formatGoalString,
  isHabitExpectedOnDate,
  getCompletionKey,
  type Habit,
} from "@/lib/habit-store";
import { useNow } from "@/lib/birth-store";
import { MONTHS } from "@/lib/birth";
import { HabitIcon } from "@/components/app/productivity-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export const Route = createFileRoute("/_dash/habit-tracker/")({
  head: () => ({
    meta: [
      { title: "Habit Tracker — DOBverse" },
      {
        name: "description",
        content: "Track your daily habits, streaks, and routines with privacy-first local storage.",
      },
    ],
  }),
  component: HabitTrackerPage,
});

function HabitTrackerPage() {
  const liveNow = useNow(60_000);
  const now = useMemo(() => liveNow ?? new Date(), [liveNow]);
  const navigate = useNavigate();

  // Selected Month State
  const [selectedYear, setSelectedYear] = useState(() => now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => now.getMonth());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all");

  // Delete Confirmation State
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  // Store data
  const habits = useHabits();
  const completions = useHabitCompletions();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      if (filterStatus === "active" && h.status !== "active") return false;
      if (filterStatus === "paused" && h.status !== "paused") return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(query);
        const matchesCat = h.category.toLowerCase().includes(query);
        const matchesGoal = (h.targetValue || "").toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesGoal) return false;
      }
      return true;
    });
  }, [habits, filterStatus, searchQuery]);

  // Dynamic statistics
  const stats = useMemo(() => {
    return calculateMonthStats(habits, completions, selectedYear, selectedMonth, now);
  }, [habits, completions, selectedYear, selectedMonth, now]);

  const weekGroups = useMemo(() => {
    return getMonthWeekGroups(selectedYear, selectedMonth, now);
  }, [selectedYear, selectedMonth, now]);

  const handleDeleteConfirm = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      toast.success(`Deleted habit "${habitToDelete.name}"`);
      setHabitToDelete(null);
    }
  };

  const handleCellClick = (habitId: string, dateStr: string) => {
    cycleHabitCompletion(habitId, dateStr);
  };

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <Topbar title="Habit Tracker" subtitle="Track your daily habits and build a better you." />

      {/* Month Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-card text-card-foreground shadow-soft transition hover:bg-accent"
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold shadow-soft">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-card text-card-foreground shadow-soft transition hover:bg-accent"
            aria-label="Next Month"
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
          to="/habit-tracker/add"
          className="flex items-center gap-2 rounded-xl bg-gradient-cta px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </Link>
      </div>

      {/* Summary / Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Progress */}
        <Panel className="flex items-center gap-4 p-5">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center">
            <svg className="h-16 w-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                className="text-primary transition-all duration-500"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${
                  2 *
                  Math.PI *
                  26 *
                  (1 - (stats.totalExpected > 0 ? stats.monthlyProgress / 100 : 0))
                }`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold">{stats.monthlyProgress}%</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">Monthly Progress</div>
            <div className="text-lg font-bold">
              {stats.totalCompleted} / {stats.totalExpected}
            </div>
            <div className="text-xs text-muted-foreground">completed check-ins</div>
          </div>
        </Panel>

        {/* Current Streak */}
        <Panel className="flex items-center gap-4 p-5">
          <IconBubble tone="warn">
            <Flame className="h-6 w-6 fill-warn text-warn" />
          </IconBubble>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Current Streak</div>
            <div className="text-2xl font-bold">
              {stats.currentStreak}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {stats.currentStreak === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.currentStreak > 0 ? "🚀 Keep going!" : "Build your streak today"}
            </div>
          </div>
        </Panel>

        {/* Perfect Habits */}
        <Panel className="flex items-center gap-4 p-5">
          <IconBubble tone="primary">
            <Trophy className="h-6 w-6 text-primary" />
          </IconBubble>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Perfect Habits</div>
            <div className="text-2xl font-bold">{stats.perfectHabitsCount}</div>
            <div className="text-xs text-muted-foreground">100% this month</div>
          </div>
        </Panel>

        {/* Total Habits */}
        <Panel className="flex items-center gap-4 p-5">
          <IconBubble tone="info">
            <BarChart3 className="h-6 w-6 text-info" />
          </IconBubble>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Total Habits</div>
            <div className="text-2xl font-bold">{stats.totalHabits}</div>
            <div className="text-xs text-muted-foreground">
              {stats.activeHabits} active • {stats.pausedHabits} paused
            </div>
          </div>
        </Panel>
      </div>

      {/* Main Monthly Habit Tracker Table */}
      <Panel className="space-y-4 p-5 sm:p-6">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border bg-muted/40 p-1">
            <button
              onClick={() => setFilterStatus("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                filterStatus === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All ({habits.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                filterStatus === "active"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Active ({stats.activeHabits})
            </button>
            <button
              onClick={() => setFilterStatus("paused")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                filterStatus === "paused"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Paused ({stats.pausedHabits})
            </button>
          </div>
        </div>

        {/* Matrix Container with horizontal scrolling */}
        <div className="overflow-x-auto rounded-xl border bg-card/60 overscroll-x-contain">
          <table className="min-w-full w-max border-collapse text-left text-sm">
            <thead>
              {/* Row 1: Week grouping headers */}
              <tr className="border-b bg-muted/30">
                <th className="w-[180px] min-w-[180px] max-w-[180px] border-r bg-card px-3 py-3 font-semibold sm:sticky sm:left-0 sm:z-20 sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] sm:px-4">
                  Habit
                </th>
                <th className="w-[110px] min-w-[110px] max-w-[110px] border-r bg-card px-2.5 py-3 font-semibold sm:sticky sm:left-[220px] sm:z-20 sm:w-[130px] sm:min-w-[130px] sm:max-w-[130px] sm:px-3 sm:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  Goal
                </th>
                {weekGroups.map((group) => (
                  <th
                    key={group.weekNumber}
                    colSpan={group.days.length}
                    className="border-r border-border/80 px-2 py-2 text-center text-xs font-semibold"
                  >
                    <div className="font-bold text-foreground">{group.label}</div>
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {group.dateRangeLabel}
                    </div>
                  </th>
                ))}
                <th className="w-[80px] min-w-[80px] max-w-[80px] border-l px-2 py-3 text-center text-xs font-semibold sm:px-3">
                  Done / Days
                </th>
                <th className="w-[60px] min-w-[60px] max-w-[60px] px-1.5 py-3 text-center text-xs font-semibold sm:px-2">
                  %
                </th>
                <th className="w-[70px] min-w-[70px] max-w-[70px] px-2 py-3 text-center text-xs font-semibold sm:px-3">
                  Streak
                </th>
              </tr>

              {/* Row 2: Day number and weekday */}
              <tr className="border-b bg-muted/20 text-xs">
                <th className="w-[180px] min-w-[180px] max-w-[180px] border-r bg-card px-3 py-2 text-xs text-muted-foreground font-medium sm:sticky sm:left-0 sm:z-20 sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] sm:px-4">
                  {filteredHabits.length} {filteredHabits.length === 1 ? "habit" : "habits"}
                </th>
                <th className="w-[110px] min-w-[110px] max-w-[110px] border-r bg-card px-2.5 py-2 text-xs text-muted-foreground font-medium sm:sticky sm:left-[220px] sm:z-20 sm:w-[130px] sm:min-w-[130px] sm:max-w-[130px] sm:px-3 sm:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  Target
                </th>
                {weekGroups.flatMap((group) =>
                  group.days.map((day) => (
                    <th
                      key={day.dateStr}
                      className={cn(
                        "w-9 min-w-[36px] max-w-[36px] border-r border-border/40 p-1 text-center font-medium",
                        day.isToday && "bg-primary/10 text-primary font-bold",
                      )}
                    >
                      <div>{day.dayNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{day.weekdayShort}</div>
                    </th>
                  )),
                )}
                <th className="w-[80px] min-w-[80px] max-w-[80px] border-l px-1.5 py-2 text-center text-[11px] text-muted-foreground font-medium sm:px-2">
                  Total
                </th>
                <th className="w-[60px] min-w-[60px] max-w-[60px] px-1 py-2 text-center text-[11px] text-muted-foreground font-medium sm:px-1.5">
                  Rate
                </th>
                <th className="w-[70px] min-w-[70px] max-w-[70px] px-1.5 py-2 text-center text-[11px] text-muted-foreground font-medium sm:px-2">
                  🔥
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredHabits.length === 0 ? (
                <tr>
                  <td
                    colSpan={2 + weekGroups.reduce((acc, g) => acc + g.days.length, 0) + 3}
                    className="p-10 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="text-base font-semibold">No habits yet</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery
                          ? "No habits match your search filter."
                          : "Add your first habit to start building consistency and tracking your progress."}
                      </p>
                      <Link
                        to="/habit-tracker/add"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-cta px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                      >
                        <Plus className="h-4 w-4" />
                        Add Habit
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => {
                  const habitStat = stats.habitStatsMap[habit.id] || {
                    expectedCount: 0,
                    completedCount: 0,
                    missedCount: 0,
                    completionRate: 0,
                    streak: 0,
                    isPerfect: false,
                  };

                  return (
                    <tr
                      key={habit.id}
                      className={cn(
                        "group border-b transition hover:bg-accent/40",
                        habit.status === "paused" && "opacity-60",
                      )}
                    >
                      {/* Habit Name & Icon Cell */}
                      <td className="w-[180px] min-w-[180px] max-w-[180px] border-r bg-card px-3 py-3 group-hover:bg-muted/80 transition-colors sm:sticky sm:left-0 sm:z-10 sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] sm:px-4">
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <HabitIcon name={habit.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-foreground text-xs sm:text-sm flex items-center gap-1">
                                <span className="truncate">{habit.name}</span>
                                {habit.status === "paused" && (
                                  <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] sm:text-[10px] text-muted-foreground font-normal">
                                    Paused
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-[10px] sm:text-[11px] text-muted-foreground">
                                {habit.category}
                              </div>
                            </div>
                          </div>

                          {/* Context Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                                aria-label="Habit options"
                              >
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate({
                                    to: "/habit-tracker/add",
                                    search: { edit: habit.id } as Record<string, string>,
                                  })
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleHabitPause(habit.id)}>
                                {habit.status === "active" ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4 text-warn" />
                                    Pause Habit
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4 text-success" />
                                    Resume Habit
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setHabitToDelete(habit)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>

                      {/* Goal Cell */}
                      <td className="w-[110px] min-w-[110px] max-w-[110px] border-r bg-card px-2.5 py-3 text-xs text-muted-foreground group-hover:bg-muted/80 transition-colors sm:sticky sm:left-[220px] sm:z-10 sm:w-[130px] sm:min-w-[130px] sm:max-w-[130px] sm:px-3 sm:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                        <span className="truncate block font-medium">
                          {formatGoalString(habit)}
                        </span>
                      </td>

                      {/* Daily Completion Cells */}
                      {weekGroups.flatMap((group) =>
                        group.days.map((day) => {
                          const key = getCompletionKey(habit.id, day.dateStr);
                          const status = completions[key] || "unmarked";
                          const isExpected = isHabitExpectedOnDate(habit, day.dateStr);
                          const isBeforeStart = day.dateStr < habit.startDate;

                          return (
                            <td
                              key={day.dateStr}
                              className={cn(
                                "w-9 min-w-[36px] max-w-[36px] border-r border-border/40 p-1 text-center align-middle",
                                day.isToday && "bg-primary/5",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => handleCellClick(habit.id, day.dateStr)}
                                title={`${habit.name} on ${day.dateStr}: ${status}`}
                                aria-label={`${habit.name} on ${day.dateStr}: ${status}`}
                                className={cn(
                                  "mx-auto grid h-7 w-7 place-items-center rounded-lg border text-xs font-bold transition duration-150",
                                  status === "completed" &&
                                    "border-emerald-500 bg-emerald-500/20 text-emerald-500 dark:border-emerald-400 dark:bg-emerald-400/25 dark:text-emerald-300 shadow-sm",
                                  status === "missed" &&
                                    "border-destructive/80 bg-destructive/15 text-destructive",
                                  status === "unmarked" &&
                                    isExpected &&
                                    "border-border/80 bg-muted/30 text-transparent hover:border-primary/60 hover:bg-accent",
                                  status === "unmarked" &&
                                    !isExpected &&
                                    "border-border/30 bg-muted/10 opacity-40 hover:opacity-100",
                                  isBeforeStart && "cursor-default opacity-30",
                                )}
                              >
                                {status === "completed" && <Check className="h-4 w-4 stroke-[3]" />}
                                {status === "missed" && <X className="h-3.5 w-3.5 stroke-[2.5]" />}
                              </button>
                            </td>
                          );
                        }),
                      )}

                      {/* Done / Days */}
                      <td className="w-[80px] min-w-[80px] max-w-[80px] border-l px-2 py-3 text-center text-xs font-semibold sm:px-3">
                        {habitStat.completedCount} / {habitStat.expectedCount}
                      </td>

                      {/* Completion % */}
                      <td className="w-[60px] min-w-[60px] max-w-[60px] px-1.5 py-3 text-center text-xs sm:px-2">
                        <span
                          className={cn(
                            "inline-block rounded-md px-1.5 py-0.5 font-bold",
                            habitStat.completionRate >= 80
                              ? "bg-emerald-500/15 text-emerald-500"
                              : habitStat.completionRate >= 50
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {habitStat.completionRate}%
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="w-[70px] min-w-[70px] max-w-[70px] px-2 py-3 text-center text-xs font-bold sm:px-3">
                        {habitStat.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-warn">
                            <Flame className="h-3.5 w-3.5 fill-warn" />
                            {habitStat.streak}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Matrix Footer: Add Action & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Link
            to="/habit-tracker/add"
            className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Habit
          </Link>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded border border-emerald-500 bg-emerald-500/20 text-emerald-500 text-[10px]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded border border-destructive/80 bg-destructive/15 text-destructive text-[10px]">
                <X className="h-3 w-3 stroke-[3]" />
              </span>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-4 w-4 rounded border border-border bg-muted/40" />
              <span>Not marked</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Analytics Section (Below Tracker in the SAME page) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Habit Completion Rate (Weekly) */}
        <Panel className="p-5 sm:p-6">
          <PanelHeader
            title="Habit Completion Rate"
            subtitle="Weekly completion trends for this month"
          />
          {habits.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              No habit data available yet
            </div>
          ) : (
            <div className="mt-4 flex h-48 items-end justify-between gap-2 px-2">
              {stats.weeklyCompletionRates.map((w) => (
                <div key={w.week.weekNumber} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-foreground">{w.rate}%</span>
                  <div className="w-full max-w-[36px] rounded-t-lg bg-muted relative h-32 overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-cta transition-all duration-500"
                      style={{ height: `${w.rate}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{w.week.label}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* 2. Category Distribution */}
        <Panel className="p-5 sm:p-6">
          <PanelHeader title="Category Distribution" subtitle="Active habits across categories" />
          {stats.categoryDistribution.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              No categorized habits yet
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
              <Donut
                segments={stats.categoryDistribution.map((c) => ({
                  value: c.count,
                  color: c.color,
                }))}
                size={140}
                stroke={20}
              >
                <div className="text-center">
                  <div className="text-xl font-bold">{stats.totalHabits}</div>
                  <div className="text-[10px] text-muted-foreground">Habits</div>
                </div>
              </Donut>

              <div className="space-y-2 text-xs">
                {stats.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-foreground w-24 truncate">
                      {cat.category}
                    </span>
                    <span className="font-bold text-muted-foreground">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* 3. Top Performing Habits */}
        <Panel className="p-5 sm:p-6">
          <PanelHeader title="Top Performing Habits" subtitle="Ranked by completion consistency" />
          {stats.topHabits.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              No active habits to rank yet
            </div>
          ) : (
            <div className="space-y-3.5 pt-2">
              {stats.topHabits.slice(0, 5).map((item, index) => {
                const badges = ["🏆", "🥈", "🥉", "4️⃣", "5️⃣"];
                return (
                  <div key={item.habit.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium truncate">
                        <span>{badges[index] || "•"}</span>
                        <span className="truncate">{item.habit.name}</span>
                      </div>
                      <span className="font-bold text-primary">{item.stats.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-cta transition-all duration-500"
                        style={{ width: `${item.stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{habitToDelete?.name}"</strong>? This will
              permanently remove the habit and all its recorded check-in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
