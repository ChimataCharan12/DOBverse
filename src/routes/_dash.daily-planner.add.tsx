import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  Clock,
  Star,
  Check,
  BookOpen,
  Laptop,
  GraduationCap,
  Dumbbell,
  User,
  Users,
  Tag,
  Calendar,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader } from "@/components/app/ui";
import {
  saveTask,
  getTaskById,
  formatTimeRange,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/planner-store";
import { toDateKey } from "@/lib/habit-store";
import { useNow } from "@/lib/birth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_dash/daily-planner/add")({
  validateSearch: (search: Record<string, unknown>): { edit?: string; date?: string } => {
    return {
      edit: typeof search["edit"] === "string" ? (search["edit"] as string) : undefined,
      date: typeof search["date"] === "string" ? (search["date"] as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Add New Task — DOBverse" },
      { name: "description", content: "Create or edit a task in your daily planner." },
    ],
  }),
  component: AddTaskPage,
});

const CATEGORY_META: Record<
  TaskCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Study: { label: "Study", icon: BookOpen },
  Project: { label: "Project", icon: Laptop },
  College: { label: "College", icon: GraduationCap },
  Exercise: { label: "Exercise", icon: Dumbbell },
  Personal: { label: "Personal", icon: User },
  Meeting: { label: "Meeting", icon: Users },
  Other: { label: "Other", icon: Tag },
};

function AddTaskPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const editId = search.edit;
  const initialDate = search.date;
  const now = useNow(60_000) ?? new Date();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => initialDate || toDateKey(now));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Study");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [isFocus, setIsFocus] = useState(false);
  const [error, setError] = useState("");

  // Load existing task if editing
  useEffect(() => {
    if (editId) {
      const existing = getTaskById(editId);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || "");
        setDate(existing.date);
        setStartTime(existing.startTime || "");
        setEndTime(existing.endTime || "");
        setCategory(existing.category || "Study");
        setPriority(existing.priority || "Medium");
        setIsFocus(!!existing.isFocus);
      }
    }
  }, [editId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task name is required");
      return;
    }

    if (startTime && endTime && endTime < startTime) {
      setError("End time cannot be earlier than start time");
      return;
    }

    setError("");

    const existingTask = editId ? getTaskById(editId) : undefined;

    saveTask({
      ...(editId ? { id: editId } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      priority,
      completed: existingTask?.completed ?? false,
      isFocus,
    });

    toast.success(editId ? "Task updated successfully!" : "Task added to planner!");
    navigate({ to: "/daily-planner", search: { date } as Record<string, string> });
  };

  const formattedTimePreview = useMemo(() => {
    return formatTimeRange(startTime, endTime);
  }, [startTime, endTime]);

  const CategoryIcon = CATEGORY_META[category]?.icon || Tag;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <Topbar
        title={editId ? "Edit Task" : "Add New Task"}
        subtitle="Create a task for your day. Keep it simple and focused."
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/daily-planner",
              search: date ? ({ date } as Record<string, string>) : undefined,
            })
          }
          className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold shadow-soft transition hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-cta px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
        >
          <Save className="h-4 w-4" />
          Save Task
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {/* Main Grid: Form Left, Preview & Guide Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Task Form (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section 1: Task Details */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                1
              </span>
              Task Details
            </h3>

            {/* Task Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Task Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Complete DBMS notes, Workout, Meeting..."
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                rows={3}
                className="w-full rounded-xl border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </Panel>

          {/* Section 2: Time (Optional) */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  2
                </span>
                Time (Optional)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 ml-8">
                Set a time if you want. You can skip this.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border bg-muted/20 p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </Panel>

          {/* Section 3: Category */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                3
              </span>
              Category
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TASK_CATEGORIES.map((cat) => {
                const MetaIcon = CATEGORY_META[cat].icon;
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <MetaIcon className="h-4 w-4" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Section 4: Priority (Optional) */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                4
              </span>
              Priority (Optional)
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TASK_PRIORITIES.map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      isSelected
                        ? p === "Urgent"
                          ? "border-destructive bg-destructive text-destructive-foreground shadow-sm"
                          : p === "High"
                            ? "border-warn bg-warn text-foreground shadow-sm"
                            : p === "Medium"
                              ? "border-info bg-info text-foreground shadow-sm"
                              : "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Focus Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFocusCheck"
                checked={isFocus}
                onChange={(e) => setIsFocus(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500"
              />
              <label
                htmlFor="isFocusCheck"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Add to Today's Focus
              </label>
            </div>
          </Panel>
        </div>

        {/* Right: Live Preview & Quick Tips (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Live Task Preview */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <PanelHeader
              title="Task Preview"
              subtitle="This is how your task will appear in the planner."
            />

            <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-6 w-6 rounded-lg border border-border bg-background grid place-items-center" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-foreground">
                      {title.trim() || "Task Name"}
                    </div>
                    {description.trim() && (
                      <div className="text-xs text-muted-foreground truncate">
                        {description.trim()}
                      </div>
                    )}
                  </div>
                </div>

                {isFocus && <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />}
              </div>

              {/* Badges preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                <span className="inline-flex items-center gap-1 rounded-lg border bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <CategoryIcon className="h-3 w-3" />
                  {category}
                </span>

                {formattedTimePreview && (
                  <span className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3 text-primary" />
                    {formattedTimePreview}
                  </span>
                )}

                <span className="rounded-lg border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {priority}
                </span>
              </div>
            </div>
          </Panel>

          {/* Quick Tips */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <PanelHeader
              title="Quick Tips"
              subtitle="Keep your tasks simple, actionable, and focused."
            />

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  1
                </span>
                <div>
                  <div className="font-semibold text-foreground">Use a clear, actionable name</div>
                  <p className="text-muted-foreground">
                    e.g., "Complete DBMS notes" instead of just "Study".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  2
                </span>
                <div>
                  <div className="font-semibold text-foreground">Add time only if needed</div>
                  <p className="text-muted-foreground">
                    You can skip times for tasks that can be done anytime during the day.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  3
                </span>
                <div>
                  <div className="font-semibold text-foreground">Choose the right category</div>
                  <p className="text-muted-foreground">
                    Organizing by category helps group your study, project, and personal work.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  4
                </span>
                <div>
                  <div className="font-semibold text-foreground">Set priority for key tasks</div>
                  <p className="text-muted-foreground">
                    Use High or Urgent for time-sensitive commitments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  5
                </span>
                <div>
                  <div className="font-semibold text-foreground">Keep it simple</div>
                  <p className="text-muted-foreground">
                    A short and clear task is far easier to complete.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
