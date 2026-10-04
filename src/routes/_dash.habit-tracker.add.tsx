import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Check,
  Clock,
  Sparkles,
  HelpCircle,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader } from "@/components/app/ui";
import {
  saveHabit,
  getHabitById,
  toDateKey,
  HABIT_CATEGORIES,
  HABIT_ICONS,
  fmtTimeStr,
  type HabitCategory,
  type TargetType,
  type FrequencyType,
} from "@/lib/habit-store";
import { HabitIcon } from "@/components/app/productivity-icons";
import { useNow } from "@/lib/birth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_dash/habit-tracker/add")({
  validateSearch: (search: Record<string, unknown>): { edit?: string } => {
    return {
      edit: typeof search["edit"] === "string" ? (search["edit"] as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Add New Habit — DOBverse" },
      { name: "description", content: "Create or edit a daily habit in DOBverse." },
    ],
  }),
  component: AddHabitPage,
});

const WEEKDAY_NAMES = [
  { day: 1, label: "Mon", short: "M" },
  { day: 2, label: "Tue", short: "T" },
  { day: 3, label: "Wed", short: "W" },
  { day: 4, label: "Thu", short: "T" },
  { day: 5, label: "Fri", short: "F" },
  { day: 6, label: "Sat", short: "S" },
  { day: 0, label: "Sun", short: "S" },
];

function AddHabitPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const editId = search.edit;
  const liveNow = useNow(60_000);
  const now = useMemo(() => liveNow ?? new Date(), [liveNow]);

  // Form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("AlarmClock");
  const [category, setCategory] = useState<HabitCategory>("Personal");
  const [targetType, setTargetType] = useState<TargetType>("time");
  const [targetStartTime, setTargetStartTime] = useState("05:00");
  const [hasEndTime, setHasEndTime] = useState(true);
  const [targetEndTime, setTargetEndTime] = useState("06:00");
  const [targetValue, setTargetValue] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("everyday");
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(() => toDateKey(now));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Load existing habit if editing
  useEffect(() => {
    if (editId) {
      const existing = getHabitById(editId);
      if (existing) {
        setName(existing.name);
        setIcon(existing.icon || "AlarmClock");
        setCategory(existing.category);
        setTargetType(existing.targetType);
        setTargetStartTime(existing.targetStartTime || "05:00");
        setHasEndTime(!!existing.targetEndTime);
        setTargetEndTime(existing.targetEndTime || "06:00");
        setTargetValue(existing.targetValue || "");
        setFrequency(existing.frequency);
        setCustomDays(existing.customDays || [1, 2, 3, 4, 5]);
        setStartDate(existing.startDate || toDateKey(now));
        setNotes(existing.notes || "");
      }
    }
  }, [editId, now]);

  const handleCustomDayToggle = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    if (targetType === "quantity" && !targetValue.trim()) {
      setError("Please specify your target quantity (e.g. 3 liters, 10 pages)");
      return;
    }

    if (frequency === "custom" && customDays.length === 0) {
      setError("Please select at least one day for custom frequency");
      return;
    }

    setError("");

    const existingHabit = editId ? getHabitById(editId) : undefined;

    saveHabit({
      ...(editId ? { id: editId } : {}),
      name: name.trim(),
      icon,
      category,
      targetType,
      targetStartTime: targetType === "time" ? targetStartTime : undefined,
      targetEndTime: targetType === "time" && hasEndTime ? targetEndTime : undefined,
      targetValue:
        targetType === "quantity"
          ? targetValue.trim()
          : targetType === "yesno"
            ? targetValue.trim() || "Yes / No"
            : undefined,
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      startDate,
      notes: notes.trim(),
      status: existingHabit?.status || "active",
    });

    toast.success(editId ? "Habit updated successfully!" : "Habit created successfully!");
    navigate({ to: "/habit-tracker" });
  };

  // Live formatted target summary
  const formattedGoalPreview = useMemo(() => {
    if (targetType === "time") {
      if (targetStartTime && hasEndTime && targetEndTime) {
        return `${fmtTimeStr(targetStartTime)} – ${fmtTimeStr(targetEndTime)}`;
      }
      if (targetStartTime) {
        return fmtTimeStr(targetStartTime);
      }
      return "Scheduled Time";
    }
    if (targetType === "quantity") {
      return targetValue.trim() || "e.g., 3L per day";
    }
    return targetValue.trim() || "Done or Not";
  }, [targetType, targetStartTime, hasEndTime, targetEndTime, targetValue]);

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <Topbar
        title={editId ? "Edit Habit" : "Add New Habit"}
        subtitle="Set up a habit to track your consistency and build a better you."
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/habit-tracker" })}
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
          Save Habit
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {/* Main Grid: Form Left, Preview & Guide Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Habit Form (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section 1: Habit Details */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                1
              </span>
              Habit Details
            </h3>

            {/* Habit Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Habit Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Wake up, Exercise, Read, Drink Water"
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Icon</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    title={item.label}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl border text-muted-foreground transition hover:bg-accent",
                      icon === item.name
                        ? "border-primary bg-primary/15 text-primary shadow-sm ring-2 ring-primary/30"
                        : "bg-background",
                    )}
                  >
                    <HabitIcon name={item.name} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Category <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {HABIT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      category === cat
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* Section 2: Target / Goal */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                2
              </span>
              Target / Goal
            </h3>

            {/* Target Type Toggle */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("time")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  targetType === "time"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Time / Routine
              </button>
              <button
                type="button"
                onClick={() => setTargetType("quantity")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  targetType === "quantity"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Quantity / Count
              </button>
              <button
                type="button"
                onClick={() => setTargetType("yesno")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  targetType === "yesno"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Simple Yes/No
              </button>
            </div>

            {/* Dynamic Target Inputs */}
            {targetType === "time" && (
              <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Target Time</label>
                    <input
                      type="time"
                      value={targetStartTime}
                      onChange={(e) => setTargetStartTime(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">
                        End Time (Optional)
                      </label>
                      <input
                        type="checkbox"
                        checked={hasEndTime}
                        onChange={(e) => setHasEndTime(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                    </div>
                    <input
                      type="time"
                      disabled={!hasEndTime}
                      value={targetEndTime}
                      onChange={(e) => setTargetEndTime(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Scheduled: <strong>{formattedGoalPreview}</strong>
                  </span>
                </div>
              </div>
            )}

            {targetType === "quantity" && (
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Target Quantity / Metric
                </label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 3L per day, 10 pages, 30 minutes, 2 hours"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {targetType === "yesno" && (
              <div className="rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground">
                <p>
                  Simple completion tracker. Mark as completed or missed each day without requiring
                  specific numbers.
                </p>
              </div>
            )}
          </Panel>

          {/* Section 3: Frequency */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                3
              </span>
              Frequency
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFrequency("everyday")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  frequency === "everyday"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Every day
              </button>
              <button
                type="button"
                onClick={() => setFrequency("weekdays")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  frequency === "weekdays"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Weekdays (Mon - Fri)
              </button>
              <button
                type="button"
                onClick={() => setFrequency("custom")}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  frequency === "custom"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                Custom days
              </button>
            </div>

            {frequency === "custom" && (
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Select Days to Track
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_NAMES.map((d) => {
                    const isSelected = customDays.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleCustomDayToggle(d.day)}
                        className={cn(
                          "grid h-10 w-11 place-items-center rounded-xl border text-xs font-bold transition",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "bg-background text-muted-foreground hover:bg-accent",
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Panel>

          {/* Section 4: Start Date */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                4
              </span>
              Start Date
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Track Starting From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Days before this date will not count against your completion statistics.
              </p>
            </div>
          </Panel>

          {/* Section 5: Notes */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                5
              </span>
              Notes (Optional)
            </h3>

            <div className="space-y-1.5">
              <textarea
                value={notes}
                maxLength={200}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any motivation, reminders or routine details..."
                rows={3}
                className="w-full rounded-xl border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <div className="text-right text-[10px] text-muted-foreground">
                {notes.length} / 200
              </div>
            </div>
          </Panel>
        </div>

        {/* Right: Live Preview & Settings Guide (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Live Habit Preview */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <PanelHeader
              title="Habit Preview"
              subtitle="This is how your habit will look in the tracker."
            />

            {/* Habit Card Preview */}
            <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <HabitIcon name={icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {name.trim() || "Habit Name"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {category}
                      </span>
                      <span>{formattedGoalPreview}</span>
                    </div>
                  </div>
                </div>

                <div className="grid h-8 w-8 place-items-center text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </div>
              </div>

              {/* Mini Calendar View Preview */}
              <div className="border-t pt-3">
                <div className="text-[11px] font-medium text-muted-foreground mb-2">
                  Preview in Week View
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {WEEKDAY_NAMES.map((d, i) => (
                    <div key={d.day} className="space-y-1">
                      <div className="text-[10px] text-muted-foreground font-medium">{d.label}</div>
                      <div className="text-[11px] font-bold">{i + 1}</div>
                      <div
                        className={cn(
                          "mx-auto grid h-6 w-6 place-items-center rounded-md border text-[10px]",
                          i % 2 === 0
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-500 font-bold"
                            : "border-border bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {i % 2 === 0 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {/* Habit Settings Guide */}
          <Panel className="space-y-4 p-5 sm:p-6">
            <PanelHeader
              title="Habit Settings Guide"
              subtitle="Tips for setting effective and sustainable habits."
            />

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  1
                </span>
                <div>
                  <div className="font-semibold text-foreground">Choose a specific habit name</div>
                  <p className="text-muted-foreground">
                    e.g., "Wake up at 5:00 AM" or "Drink 3L Water" instead of vague goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  2
                </span>
                <div>
                  <div className="font-semibold text-foreground">Set realistic times or goals</div>
                  <p className="text-muted-foreground">
                    Be specific with your target time or quantity to reduce friction.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  3
                </span>
                <div>
                  <div className="font-semibold text-foreground">Pick the right frequency</div>
                  <p className="text-muted-foreground">
                    Custom frequencies ensure off-days won't count against your streak.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  4
                </span>
                <div>
                  <div className="font-semibold text-foreground">Use meaningful icons</div>
                  <p className="text-muted-foreground">
                    Visual cues help you identify and organize your routines at a glance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  5
                </span>
                <div>
                  <div className="font-semibold text-foreground">Add notes if needed</div>
                  <p className="text-muted-foreground">
                    Include tips, reminders, or trigger cues to stay consistent.
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
