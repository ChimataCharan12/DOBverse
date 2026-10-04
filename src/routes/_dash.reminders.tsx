import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Cake,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Gift,
  MoreVertical,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Star,
  Users,
  X,
  AlarmClock,
  PartyPopper,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel } from "@/components/app/ui";
import {
  AddBirthdayDialog,
  CATS,
  CAT_KEYS,
  CosmicHero,
  PersonAvatar,
  giftIdeas,
  sendWishes,
} from "@/components/app/birthdays";
import {
  REMINDER_OPTIONS,
  enableBrowserNotifications,
  nextOccurrence,
  occursOn,
  parseDob,
  reminderFor,
  reminderLabel,
  removeBirthday,
  runReminderCheck,
  setPersonReminder,
  setReminderSettings,
  summary,
  togglePin,
  useBirthdays,
  useReminderSettings,
  withNext,
  type Person,
} from "@/lib/birthdays-store";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { MONTHS, fmtDate, greeting, weekday } from "@/lib/birth";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import heroImg from "@/assets/reminders-hero.jpg";

export const Route = createFileRoute("/_dash/reminders")({
  head: () => ({
    meta: [
      { title: "Birthday Reminders — DOBverse" },
      {
        name: "description",
        content: "Never miss a special day. Track upcoming birthdays and get reminders.",
      },
      { property: "og:title", content: "Birthday Reminders — DOBverse" },
      { property: "og:description", content: "Track upcoming birthdays and get timely reminders." },
    ],
  }),
  component: Reminders,
});

type Tab = "all" | "month" | "30" | "year" | "pinned";
const TABS: [Tab, string][] = [
  ["all", "All"],
  ["month", "This Month"],
  ["30", "Next 30 Days"],
  ["year", "This Year"],
  ["pinned", "Pinned"],
];

export function EmptyBirthdays({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid place-items-center gap-3 py-12 text-center">
      <Cake className="h-10 w-10 text-primary" />
      <div className="font-semibold">No birthdays saved yet</div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Add the people you love and DOBverse will count down to every birthday.
      </p>
      <button
        onClick={onAdd}
        className="rounded-xl bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        Add Birthday
      </button>
    </div>
  );
}

function Reminders() {
  const birth = useCurrentBirth();
  const now = useNow(60_000) ?? new Date();
  const list = useBirthdays();
  const settings = useReminderSettings();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Person | undefined>();
  const [calMonth, setCalMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const [remOpen, setRemOpen] = useState(false);
  const [remId, setRemId] = useState<string | undefined>();
  useEffect(() => {
    runReminderCheck(list, new Date());
  }, [list, settings]);
  const openReminder = (id?: string) => {
    setRemId(id);
    setRemOpen(true);
  };

  const w = useMemo(() => withNext(list, now), [list, now.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = summary(list, now);
  const next = w[0];
  const filtered = w
    .filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (tab === "month")
        return (
          p.next.date.getMonth() === now.getMonth() &&
          p.next.date.getFullYear() === now.getFullYear()
        );
      if (tab === "30") return p.next.daysLeft <= 30;
      if (tab === "year") return p.next.date.getFullYear() === now.getFullYear();
      if (tab === "pinned") return p.pinned;
      return true;
    })
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || a.next.daysLeft - b.next.daysLeft);
  const shown = showAll ? filtered : filtered.slice(0, 6);
  const week = w.filter((p) => p.next.daysLeft <= 7);
  const tones = ["text-magenta", "text-primary", "text-info", "text-success", "text-warn"];

  const enable = async () => {
    const ok = await enableBrowserNotifications();
    toast[ok ? "success" : "error"](
      ok ? "Browser notifications enabled" : "Notifications were blocked by your browser",
    );
  };
  const openAdd = (p?: Person) => {
    setEdit(p);
    setOpen(true);
  };

  return (
    <>
      <Topbar
        greeting
        title={`${greeting(now).replace("!", "")}, ${birth.name || "Friend"}!`}
        subtitle="Never miss a special day. Celebrate every bond."
      />
      <div className="grid gap-5 px-4 pb-8 sm:px-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-w-0 gap-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <CosmicHero img={heroImg} className="min-h-48">
              {next ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-4 w-4 text-warn" />
                      Next Celebration
                    </div>
                    <div className="mt-3 text-4xl font-bold">
                      {next.name} {next.category === "family" && "❤️"}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span className="flex items-center gap-1.5 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
                        <Cake className="h-4 w-4" />
                        Turns {next.next.turning}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {fmtDate(next.next.date)} ({weekday(next.next.date)})
                      </span>
                    </div>
                  </div>
                  <div className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-4 border-primary-foreground/30 border-t-primary-foreground text-center">
                    <div>
                      <div className="text-5xl font-bold leading-none">{next.next.daysLeft}</div>
                      <div className="text-sm">Days Left</div>
                      <div className="text-[10px] opacity-80">to the big day!</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold">Next Celebration</div>
                  <div className="mt-3 text-3xl font-bold">Add your first birthday</div>
                </div>
              )}
            </CosmicHero>
            <Panel className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
              {[
                {
                  i: Users,
                  v: s.total,
                  l: "Total Birthdays",
                  sub: "All time",
                  c: "bg-primary/10 text-primary",
                },
                {
                  i: Cake,
                  v: s.thisYear,
                  l: "This Year",
                  sub: "Upcoming",
                  c: "bg-magenta/10 text-magenta",
                },
                {
                  i: CalendarDays,
                  v: s.thisMonth,
                  l: "This Month",
                  sub: "Coming up",
                  c: "bg-warn/15 text-warn",
                },
                {
                  i: Gift,
                  v: s.today,
                  l: "Today's",
                  sub: "Celebrations",
                  c: "bg-success/15 text-success",
                },
              ].map((t) => (
                <div
                  key={t.l}
                  className={cn("grid place-items-center rounded-xl p-3 text-center", t.c)}
                >
                  <t.i className="h-7 w-7" />
                  <div className="mt-1 text-3xl font-bold">{t.v}</div>
                  <div className="text-[11px] font-semibold text-foreground">{t.l}</div>
                  <div className="text-[10px] text-muted-foreground">{t.sub}</div>
                </div>
              ))}
            </Panel>
          </div>

          <Panel className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 pt-5">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Cake className="h-5 w-5 text-primary" />
                  Upcoming Birthdays
                </h3>
                <div className="mt-3 flex gap-1 overflow-x-auto">
                  {TABS.map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={cn(
                        "whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-medium",
                        tab === k
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pb-3">
                <label className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search birthdays..."
                    className="w-36 bg-transparent outline-none"
                  />
                </label>
                <Select value={cat} onValueChange={setCat}>
                  <SelectTrigger className="w-32 rounded-xl">
                    <Filter className="h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Filter</SelectItem>
                    {CAT_KEYS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATS[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {list.length === 0 ? (
              <EmptyBirthdays onAdd={() => openAdd()} />
            ) : (
              <div className="divide-y">
                {shown.map((p, i) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[auto_auto_minmax(0,1.2fr)_1fr_0.8fr_0.8fr_auto_auto]"
                  >
                    <button onClick={() => togglePin(p.id)} aria-label="Pin">
                      <Star
                        className={cn(
                          "h-5 w-5",
                          p.pinned ? "fill-warn text-warn" : "text-muted-foreground",
                        )}
                      />
                    </button>
                    <div className="relative">
                      {p.pinned && i === 0 && (
                        <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded bg-magenta px-1.5 text-[9px] font-bold text-primary-foreground">
                          PINNED
                        </span>
                      )}
                      <PersonAvatar p={p} className="h-14 w-14 ring-4 ring-primary/15" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {p.name} {p.category === "family" && "❤️"}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs",
                            CATS[p.category].soft,
                          )}
                        >
                          {p.relation || CATS[p.category].label}
                        </span>
                        {p.repeat === "once" && (
                          <span className="inline-flex rounded-md bg-warn/15 px-2 py-0.5 text-[11px] font-medium text-warn">
                            This year only
                          </span>
                        )}
                      </div>
                      <ReminderLine
                        p={p}
                        now={now}
                        def={settings.daysBefore}
                        onEdit={() => openReminder(p.id)}
                      />
                    </div>
                    <div className="hidden text-sm md:block">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {fmtDate(p.next.date)}
                      </div>
                      <div className="pl-6 text-xs text-muted-foreground">
                        {weekday(p.next.date)}
                      </div>
                    </div>
                    <div className={cn("hidden text-sm md:block", tones[i % 5])}>
                      Turns <b className="text-lg">{p.next.turning}</b>
                      <Cake className="h-4 w-4" />
                    </div>
                    <div className={cn("text-center", tones[i % 5])}>
                      <div className="text-3xl font-bold leading-none">{p.next.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.next.daysLeft === 0 ? "Today!" : "Days Left"}
                      </div>
                    </div>
                    <div className="hidden gap-1.5 md:grid">
                      <button
                        onClick={() => giftIdeas(p)}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium text-primary hover:bg-accent"
                      >
                        <Gift className="h-3.5 w-3.5" />
                        Gift Ideas
                      </button>
                      <button
                        onClick={() => sendWishes(p)}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium text-primary hover:bg-accent"
                      >
                        <Send className="h-3.5 w-3.5 text-magenta" />
                        Send Wishes
                      </button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger aria-label="More">
                        <MoreVertical className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAdd(p)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReminder(p.id)}>
                          Edit reminder
                        </DropdownMenuItem>
                        {p.reminder && (
                          <DropdownMenuItem
                            onClick={() => {
                              setPersonReminder(p.id, undefined);
                              toast.success("Reminder reset to default");
                            }}
                          >
                            Reset reminder
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => togglePin(p.id)}>
                          {p.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="md:hidden" onClick={() => giftIdeas(p)}>
                          Gift ideas
                        </DropdownMenuItem>
                        <DropdownMenuItem className="md:hidden" onClick={() => sendWishes(p)}>
                          Send wishes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            removeBirthday(p.id);
                            toast.success(`${p.name} removed`);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No birthdays match this view.
                  </div>
                )}
                {filtered.length > 6 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex w-full items-center justify-center gap-2 bg-accent/50 py-3 text-sm font-semibold text-primary"
                  >
                    {showAll ? "Show Less" : "View All Birthdays"}{" "}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
            <Panel>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-cta text-primary-foreground">
                  <Plus />
                </div>
                <div>
                  <div className="font-semibold">Quick Add Birthday</div>
                  <div className="text-xs text-muted-foreground">Save a birthday in seconds</div>
                </div>
              </div>
              <button
                onClick={() => openAdd()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-cta py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                <Plus className="h-4 w-4" />
                Add New Birthday
              </button>
              <button
                onClick={() => (list.length ? openReminder() : openAdd())}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold text-primary"
              >
                <Bell className="h-4 w-4" />
                Set a Reminder
              </button>
            </Panel>
            <Panel>
              <div className="mb-3 flex justify-between">
                <h3 className="font-semibold">Categories Overview</h3>
                <button
                  onClick={() => setCat("all")}
                  className="text-xs font-semibold text-primary"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {CAT_KEYS.map((c) => {
                  const C = CATS[c];
                  return (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl p-3 text-left",
                        C.soft,
                        cat === c && "ring-2 ring-current",
                      )}
                    >
                      <C.icon className="h-6 w-6" />
                      <div>
                        <div className="text-[11px]">{C.label}</div>
                        <div className="text-xl font-bold">
                          {list.filter((p) => p.category === c).length}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          {!settings.bannerDismissed && (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-cosmic p-4 text-cosmic-foreground shadow-soft">
              <AlarmClock className="h-10 w-10 text-warn" />
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold">Never Miss a Birthday Again!</div>
                <div className="text-sm opacity-80">
                  Enable notifications and let DOBverse remind you about every special day.
                </div>
              </div>
              <button
                onClick={enable}
                className="rounded-xl bg-gradient-cta px-6 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {settings.browser ? "Notifications On" : "Enable Notifications"}
              </button>
              <button
                onClick={() => setReminderSettings({ bannerDismissed: true })}
                className="grid h-9 w-9 place-items-center rounded-full border border-cosmic-foreground/30"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid content-start gap-5">
          <MiniCalendar month={calMonth} setMonth={setCalMonth} list={list} now={now} />
          <Panel>
            <h3 className="mb-4 font-semibold">Reminder Settings</h3>
            <div className="grid gap-4 text-sm">
              <Row
                icon={<Bell className="h-5 w-5" />}
                t="Browser Notifications"
                d="Get notified about upcoming birthdays"
              >
                <Switch
                  checked={settings.browser}
                  onCheckedChange={(v) => (v ? enable() : setReminderSettings({ browser: false }))}
                />
              </Row>
              <Row
                icon={<Clock className="h-5 w-5" />}
                t="Default Timing"
                d="Used unless a person has their own"
              >
                <Select
                  value={String(settings.daysBefore)}
                  onValueChange={(v) => setReminderSettings({ daysBefore: Number(v) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {reminderLabel(n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browser notifications work while DOBverse is active in your browser. Background
                notifications when the app is completely closed require push notifications.
              </p>
              <a
                href="/settings"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-primary"
              >
                <Settings2 className="h-4 w-4" />
                Manage Notification Preferences
              </a>
            </div>
          </Panel>
          <Panel>
            <div className="mb-3 flex justify-between">
              <h3 className="font-semibold">Upcoming This Week</h3>
              <button onClick={() => setTab("30")} className="text-xs font-semibold text-primary">
                View All
              </button>
            </div>
            {week.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No birthdays in the next 7 days.</p>
            ) : (
              week.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-2 text-sm"
                >
                  <PersonAvatar p={p} className="h-9 w-9 text-xs" />
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.next.date.getDate()} {MONTHS[p.next.date.getMonth()].slice(0, 3)}
                  </span>
                  <span className="w-16 text-right text-muted-foreground">
                    {p.next.daysLeft === 0 ? (
                      <PartyPopper className="ml-auto h-4 w-4 text-magenta" />
                    ) : (
                      `${p.next.daysLeft} Days`
                    )}
                  </span>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
      <AddBirthdayDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        title={edit ? "Edit Birthday" : "Add Birthday"}
      />
      <ReminderDialog
        open={remOpen}
        onOpenChange={setRemOpen}
        list={list}
        personId={remId}
        def={settings.daysBefore}
        onAddPerson={() => {
          setRemOpen(false);
          openAdd();
        }}
      />
    </>
  );
}

function Row({
  icon,
  t,
  d,
  children,
}: {
  icon: React.ReactNode;
  t: string;
  d: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <div className="font-semibold">{t}</div>
        <div className="text-xs text-muted-foreground">{d}</div>
      </div>
      {children}
    </div>
  );
}

export function MiniCalendar({
  month,
  setMonth,
  list,
  now,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  list: Person[];
  now: Date;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => now);
  const start = new Date(month);
  start.setDate(1 - month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const selectedHits = list.filter((p) => occursOn(p, selectedDate));

  return (
    <Panel>
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="grid h-7 w-7 place-items-center rounded-full border hover:bg-accent"
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 font-semibold text-sm">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </div>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="grid h-7 w-7 place-items-center rounded-full border hover:bg-accent"
          aria-label="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1 text-[11px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const hits = list.filter((p) => occursOn(p, d));
          const today = d.toDateString() === now.toDateString();
          const isSel = d.toDateString() === selectedDate.toDateString();
          const out = d.getMonth() !== month.getMonth();
          const ariaLabel =
            hits.length === 0
              ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
              : hits.length === 1
                ? `${MONTHS[d.getMonth()]} ${d.getDate()} — ${hits[0].name}'s birthday`
                : `${MONTHS[d.getMonth()]} ${d.getDate()} — birthdays: ${hits.map((h) => h.name).join(", ")}`;

          return (
            <button
              type="button"
              key={d.toISOString()}
              onClick={() => setSelectedDate(d)}
              aria-label={ariaLabel}
              className={cn(
                "group relative flex min-h-[46px] flex-col items-center justify-start rounded-lg p-1 text-left transition hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                isSel && "bg-accent/80 ring-1 ring-primary/40",
                hits.length > 0 && !isSel && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold leading-none",
                  out && "text-muted-foreground/40",
                  today && !isSel && "text-primary ring-2 ring-primary",
                  isSel && "bg-primary text-primary-foreground",
                  hits.length > 0 && !isSel && !today && "text-foreground font-bold",
                )}
              >
                {d.getDate()}
              </span>

              {hits.length > 0 && (
                <div className="mt-0.5 flex w-full flex-col items-center gap-0.5 overflow-hidden">
                  <span
                    className={cn(
                      "w-full truncate rounded px-1 py-0.5 text-[9px] font-semibold leading-tight text-center",
                      CATS[hits[0].category].soft,
                    )}
                    title={hits.map((h) => h.name).join(", ")}
                  >
                    {hits[0].name.split(" ")[0]}
                  </span>
                  {hits.length > 1 && (
                    <span className="text-[8px] font-bold text-muted-foreground leading-none">
                      +{hits.length - 1}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedHits.length > 0 && (
        <div className="mt-4 rounded-xl border bg-accent/40 p-3 text-xs">
          <div className="mb-2 flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-primary">
              <Cake className="h-3.5 w-3.5" />
              {fmtDate(selectedDate)}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {selectedHits.length} celebration{selectedHits.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {selectedHits.map((p) => {
              const nextOccur = nextOccurrence(p, now);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-card p-2 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">
                      {p.name}
                      <span
                        className={cn(
                          "ml-1.5 rounded px-1 py-0.5 text-[9px]",
                          CATS[p.category].soft,
                        )}
                      >
                        {CATS[p.category].label}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Turns {nextOccur.turning} •{" "}
                      {nextOccur.daysLeft === 0 ? "Today!" : `${nextOccur.daysLeft} days left`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => giftIdeas(p)}
                      className="grid h-7 w-7 place-items-center rounded-md border hover:bg-accent text-primary"
                      title="Gift ideas"
                      aria-label="Gift ideas"
                    >
                      <Gift className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => sendWishes(p)}
                      className="grid h-7 w-7 place-items-center rounded-md border hover:bg-accent text-magenta"
                      title="Send wishes"
                      aria-label="Send wishes"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
        {CAT_KEYS.map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", CATS[c].dot)} />
            {CATS[c].label}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function ReminderLine({
  p,
  now,
  def,
  onEdit,
}: {
  p: Person;
  now: Date;
  def: number;
  onEdit: () => void;
}) {
  const r = reminderFor(p, now, def);
  const tone =
    r.status === "off"
      ? "text-muted-foreground"
      : r.status === "scheduled"
        ? "text-primary"
        : "text-magenta";
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
      <Switch
        checked={r.enabled}
        onCheckedChange={(v) => setPersonReminder(p.id, { enabled: v, daysBefore: r.daysBefore })}
        aria-label={`Reminder for ${p.name}`}
        className="scale-75"
      />
      <button
        onClick={onEdit}
        className={cn("flex items-center gap-1 font-medium hover:underline", tone)}
      >
        <Bell className="h-3 w-3" />
        {r.enabled
          ? `${reminderLabel(r.daysBefore)} · ${r.status === "today" ? "Today!" : r.status === "due" ? "Reminding now" : fmtDate(r.remindOn)}`
          : "Reminder off"}
      </button>
    </div>
  );
}

function ReminderDialog({
  open,
  onOpenChange,
  list,
  personId,
  def,
  onAddPerson,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  list: Person[];
  personId?: string;
  def: number;
  onAddPerson: () => void;
}) {
  const [id, setId] = useState<string>("");
  const [days, setDays] = useState(def);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    if (!open) return;
    const p = list.find((x) => x.id === personId);
    setId(p?.id ?? "");
    setDays(p?.reminder?.daysBefore ?? def);
    setEnabled(p?.reminder?.enabled ?? true);
  }, [open, personId]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = list.find((x) => x.id === id);
  const preview = p
    ? reminderFor({ ...p, reminder: { enabled, daysBefore: days } }, new Date(), def)
    : null;
  const save = () => {
    if (!p) {
      toast.error("Choose a person first");
      return;
    }
    setPersonReminder(p.id, { enabled, daysBefore: days });
    toast.success(`Reminder saved for ${p.name}`);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{personId ? "Edit Reminder" : "Add Reminder"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-sm">
          <div className="grid gap-1.5">
            <Label>Person</Label>
            <Select
              value={id}
              onValueChange={(v) => {
                setId(v);
                const q = list.find((x) => x.id === v);
                setDays(q?.reminder?.daysBefore ?? def);
                setEnabled(q?.reminder?.enabled ?? true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a saved person" />
              </SelectTrigger>
              <SelectContent>
                {list.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name} — {fmtDate(parseDob(x.dob))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={onAddPerson}
              className="justify-self-start text-xs font-semibold text-primary"
            >
              + Add a new person
            </button>
          </div>
          <div className="grid gap-1.5">
            <Label>Remind me</Label>
            <div className="grid grid-cols-2 gap-2">
              {REMINDER_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDays(n)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium",
                    days === n ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  {reminderLabel(n)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3">
            <span className="font-medium">Reminder enabled</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          {preview && (
            <div className="rounded-xl bg-accent/60 p-3 text-xs">
              Next birthday <b>{fmtDate(preview.next.date)}</b> (
              {preview.next.daysLeft === 0 ? "today" : `${preview.next.daysLeft} days left`}, turns{" "}
              {preview.next.turning}).
              <br />
              {enabled ? (
                <>
                  You'll be reminded on <b>{fmtDate(preview.remindOn)}</b>.
                </>
              ) : (
                "Reminder is turned off."
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
