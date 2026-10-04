import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  CalendarDays,
  Cake,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Gift,
  Mail,
  PartyPopper,
  Pencil,
  Trash2,
  Plus,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
  Upload,
  X,
  BellRing,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel } from "@/components/app/ui";
import {
  AddBirthdayDialog,
  CATS,
  CAT_KEYS,
  PersonAvatar,
  giftIdeas,
  sendWishes,
} from "@/components/app/birthdays";
import {
  addBirthdays,
  removeBirthday,
  download,
  enableBrowserNotifications,
  nextOccurrence,
  occursOn,
  parseDob,
  parseImport,
  setReminderSettings,
  summary,
  toICS,
  useBirthdays,
  useReminderSettings,
  withNext,
  type Category,
  type Person,
} from "@/lib/birthdays-store";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { MONTHS, WEEKDAYS, fmtLong, greeting } from "@/lib/birth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import heroImg from "@/assets/calendar-hero.jpg";

export const Route = createFileRoute("/_dash/calendar")({
  head: () => ({
    meta: [
      { title: "Birthday Calendar — DOBverse" },
      {
        name: "description",
        content: "All your important dates at a glance in a beautiful birthday calendar.",
      },
      { property: "og:title", content: "Birthday Calendar — DOBverse" },
      { property: "og:description", content: "All your important dates at a glance." },
    ],
  }),
  component: CalendarPage,
});

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function CalendarPage() {
  const birth = useCurrentBirth();
  const now = useNow(60_000) ?? new Date();
  const list = useBirthdays();
  const rs = useReminderSettings();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState(() => new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [cats, setCats] = useState<Category[]>(CAT_KEYS);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Person | undefined>();
  const [quick, setQuick] = useState("");
  const [quickDob, setQuickDob] = useState("");
  const [showAllSel, setShowAllSel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const vis = list.filter((p) => cats.includes(p.category));
  const s = summary(list, now);
  const on = (d: Date) => vis.filter((p) => occursOn(p, d));
  const selList = on(selected);
  const upcomingAll = withNext(vis, now);
  const week = upcomingAll.filter((p) => p.next.daysLeft <= 7);
  const weekOrNext = week.length ? week : upcomingAll.slice(0, 5);

  const start = new Date(month);
  start.setDate(1 - month.getDay());
  const grid = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const wkStart = new Date(selected);
  wkStart.setDate(selected.getDate() - selected.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wkStart);
    d.setDate(wkStart.getDate() + i);
    return d;
  });
  const monthList = vis
    .filter((p) => {
      const b = parseDob(p.dob);
      if (p.repeat === "once") {
        const ty = p.targetYear ?? b.getFullYear();
        if (month.getFullYear() !== ty) return false;
      }
      return b.getMonth() === month.getMonth();
    })
    .map((p) => {
      const b = parseDob(p.dob);
      let day = b.getDate();
      if (b.getMonth() === 1 && b.getDate() === 29) {
        const isLeap = new Date(month.getFullYear(), 1, 29).getMonth() === 1;
        if (!isLeap) day = 28;
      }
      return { p, day, m: b.getMonth() };
    })
    .sort((a, b) => a.day - b.day);

  const shift = (n: number) => {
    if (view === "week") {
      const d = new Date(selected);
      d.setDate(d.getDate() + 7 * n);
      setSelected(d);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  };
  const pick = (d: Date) => {
    setSelected(d);
    setShowAllSel(false);
    if (d.getMonth() !== month.getMonth()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const onImport = async (f?: File) => {
    if (!f) return;
    const rows = parseImport(await f.text());
    if (!rows.length) {
      toast.error("No birthdays found. Use .ics or CSV (name,YYYY-MM-DD,category).");
      return;
    }
    addBirthdays(rows);
    toast.success(`Imported ${rows.length} birthday${rows.length > 1 ? "s" : ""}`);
  };
  const quickAdd = () => {
    if (!quick.trim()) {
      toast.error("Enter a name first");
      return;
    }
    if (!quickDob) {
      setOpen(true);
      return;
    }
    addBirthdays([{ name: quick.trim(), dob: quickDob, category: "others", repeat: "yearly" }]);
    toast.success(`${quick} saved`);
    setQuick("");
    setQuickDob("");
  };
  const gcal = () => {
    const p = selList[0] ?? withNext(list, now)[0];
    if (!p) {
      toast("Add a birthday first");
      return;
    }
    const d = iso(nextOccurrence(p, now).date).replace(/-/g, "");
    const recurParam = p.repeat === "once" ? "" : "&recur=RRULE:FREQ=YEARLY";
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${p.name}'s Birthday`)}&dates=${d}/${d}${recurParam}`,
      "_blank",
      "noopener",
    );
  };
  const share = () => {
    const text =
      `My birthday calendar for ${MONTHS[month.getMonth()]}:\n` +
      monthList.map((x) => `${x.day} – ${x.p.name}`).join("\n");
    if (navigator.share) navigator.share({ title: "DOBverse Calendar", text }).catch(() => {});
    else {
      navigator.clipboard?.writeText(text);
      toast.success("Calendar copied to clipboard");
    }
  };

  return (
    <>
      <Topbar
        greeting
        title={`${greeting(now).replace("!", "")}, ${birth.name || "Friend"}!`}
        subtitle="Every birthday is a special milestone."
      />
      <div className="grid min-w-0 gap-5 px-4 pb-8 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="grid min-w-0 content-start gap-5 [&>section]:min-w-0">
          <section className="relative min-h-[190px] sm:min-h-[220px] overflow-hidden rounded-2xl bg-cosmic p-5 text-cosmic-foreground shadow-soft sm:p-6">
            <img
              src={heroImg}
              alt="Birthday calendar cosmic landscape"
              width={1536}
              height={512}
              className="absolute inset-0 h-full w-full object-cover object-[80%_center] sm:object-right opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/40 to-transparent" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/40 text-primary-foreground">
                  <CalendarDays />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Birthday Calendar</h2>
                  <p className="text-sm text-cosmic-foreground/90">
                    All your important dates at a glance.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-semibold text-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Import Birthdays
                </button>
                <button
                  onClick={() => {
                    setEdit(undefined);
                    setOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-cta px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  <Plus className="h-4 w-4" />
                  Add Birthday
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".ics,.csv,text/calendar,text/csv"
                  hidden
                  onChange={(e) => {
                    onImport(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div className="relative mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-card p-4 text-card-foreground sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  i: Gift,
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
                  v: s.thisWeek,
                  l: "This Week",
                  sub: "Soon",
                  c: "bg-success/15 text-success",
                },
                {
                  i: PartyPopper,
                  v: s.today,
                  l: "Today",
                  sub: "Celebrations",
                  c: "bg-info/10 text-info",
                },
              ].map((t) => (
                <div key={t.l} className="flex items-center gap-3">
                  <div
                    className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", t.c)}
                  >
                    <t.i className="h-7 w-7" />
                  </div>
                  <div>
                    <div className={cn("text-2xl font-bold", t.c.split(" ")[1])}>{t.v}</div>
                    <div className="text-xs font-semibold">{t.l}</div>
                    <div className="text-[11px] text-muted-foreground">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Panel className="p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const t = new Date();
                  setSelected(t);
                  setMonth(new Date(t.getFullYear(), t.getMonth(), 1));
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => shift(-1)}
                className="grid h-9 w-9 place-items-center rounded-lg border"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => shift(1)}
                className="grid h-9 w-9 place-items-center rounded-lg border"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-center justify-center gap-1 text-xl font-semibold">
                {MONTHS[month.getMonth()]} {month.getFullYear()}
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="flex gap-1">
                {(["month", "week", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium capitalize",
                      view === v && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Popover>
                <PopoverTrigger className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm">
                  <Filter className="h-4 w-4" />
                  Filter
                </PopoverTrigger>
                <PopoverContent className="w-48 space-y-2">
                  {CAT_KEYS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cats.includes(c)}
                        onChange={() =>
                          setCats(cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c])
                        }
                      />
                      <span className={cn("h-2 w-2 rounded-full", CATS[c].dot)} />
                      {CATS[c].label}
                    </label>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {view === "list" ? (
              <div className="divide-y rounded-xl border">
                {monthList.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No birthdays in {MONTHS[month.getMonth()]}.
                  </div>
                )}
                {monthList.map(({ p, day }) => (
                  <button
                    key={p.id}
                    onClick={() => pick(new Date(month.getFullYear(), month.getMonth(), day))}
                    className="flex w-full items-center gap-3 p-3 text-left hover:bg-accent/50"
                  >
                    <div className="w-10 text-center text-xl font-bold text-primary">{day}</div>
                    <PersonAvatar p={p} className="h-9 w-9 text-xs" />
                    <div className="flex-1 font-semibold">{p.name}</div>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", CATS[p.category].soft)}>
                      {CATS[p.category].label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <div className="grid grid-cols-7 bg-muted/40 text-center text-sm font-semibold">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="py-2">
                      {d.slice(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {(view === "week" ? weekDays : grid).map((d) => {
                    const hits = on(d);
                    const isSel = d.toDateString() === selected.toDateString();
                    const isToday = d.toDateString() === now.toDateString();
                    const out = view === "month" && d.getMonth() !== month.getMonth();
                    const ariaLabel =
                      hits.length === 0
                        ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
                        : hits.length === 1
                          ? `${MONTHS[d.getMonth()]} ${d.getDate()} — ${hits[0].name}'s birthday`
                          : `${MONTHS[d.getMonth()]} ${d.getDate()} — birthdays: ${hits
                              .map((p) => p.name)
                              .slice(0, 2)
                              .join(
                                ", ",
                              )}${hits.length > 2 ? `, and ${hits.length - 2} more` : ""}`;
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => pick(d)}
                        aria-label={ariaLabel}
                        className={cn(
                          "flex flex-col border-r border-t p-1 sm:p-1.5 text-left transition hover:bg-accent/50 min-w-0 overflow-hidden",
                          view === "week" ? "min-h-40" : "min-h-20 sm:min-h-24 md:min-h-28",
                          isSel && "bg-accent/60",
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={cn(
                              "grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-xs sm:text-sm font-semibold",
                              out && "text-muted-foreground/50",
                              isToday && !isSel && "text-primary ring-2 ring-primary",
                              isSel && "bg-primary text-primary-foreground",
                            )}
                          >
                            {d.getDate()}
                          </span>
                          {hits.length > 0 && (
                            <span className="flex gap-0.5 shrink-0">
                              {hits.slice(0, 3).map((p) => (
                                <span
                                  key={p.id}
                                  className={cn("h-1.5 w-1.5 rounded-full", CATS[p.category].dot)}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                        {hits.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1 w-full min-w-0 overflow-hidden">
                            {hits.slice(0, view === "week" ? 5 : 2).map((p) => (
                              <div
                                key={p.id}
                                className={cn(
                                  "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium leading-tight truncate w-full min-w-0",
                                  CATS[p.category].soft,
                                )}
                                title={`${p.name} (${CATS[p.category].label})`}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 shrink-0 rounded-full",
                                    CATS[p.category].dot,
                                  )}
                                />
                                <span className="truncate min-w-0">{p.name}</span>
                              </div>
                            ))}
                            {hits.length > (view === "week" ? 5 : 2) && (
                              <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground px-1 leading-none">
                                +{hits.length - (view === "week" ? 5 : 2)} more
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {list.length === 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4 text-sm">
                <span className="text-muted-foreground">
                  No birthdays saved yet — add one and it will appear on its date.
                </span>
                <button
                  onClick={() => {
                    setEdit(undefined);
                    setOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-gradient-cta px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add Birthday
                </button>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              {CAT_KEYS.map((c) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", CATS[c].dot)} />
                  {CATS[c].label}
                </span>
              ))}
              <span className="ml-auto text-muted-foreground">
                Click on a date to view birthdays
              </span>
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="mb-3 flex justify-between">
              <h3 className="font-semibold">
                {week.length || !weekOrNext.length ? "Upcoming This Week" : "Upcoming Birthdays"}
              </h3>
              <button
                onClick={() => setView("list")}
                className="text-xs font-semibold text-primary"
              >
                View All
              </button>
            </div>
            {weekOrNext.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming birthdays yet.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {weekOrNext.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex min-w-44 items-center gap-2 rounded-xl border p-3",
                      i === 0 && "bg-magenta/5",
                    )}
                  >
                    <PersonAvatar p={p} className="h-10 w-10 text-xs" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.next.date.getDate()} {MONTHS[p.next.date.getMonth()].slice(0, 3)} (
                        {WEEKDAYS[p.next.date.getDay()].slice(0, 3)})
                      </div>
                    </div>
                    <div className={cn("text-center", i === 0 ? "text-magenta" : "text-primary")}>
                      <div className="text-xl font-bold leading-none">{p.next.daysLeft}</div>
                      <div className="text-[9px]">
                        {p.next.daysLeft === 0 ? "Today!" : "Days Left"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {!rs.bannerDismissed && (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-cosmic p-4 text-cosmic-foreground">
              <BellRing className="h-10 w-10 text-warn" />
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold">Never Miss a Celebration!</div>
                <div className="text-sm opacity-80">
                  Enable notifications and let DOBverse remind you about every special day.
                </div>
              </div>
              <button
                onClick={async () => {
                  const ok = await enableBrowserNotifications();
                  toast[ok ? "success" : "error"](
                    ok ? "Notifications enabled" : "Notifications were blocked",
                  );
                }}
                className="rounded-xl bg-gradient-cta px-6 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {rs.browser ? "Notifications On" : "Enable Notifications"}
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

        <div className="grid min-w-0 content-start gap-5 [&>section]:min-w-0">
          <Panel>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              Selected Date <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <div className="flex items-center justify-between rounded-xl bg-cosmic px-4 py-3 text-cosmic-foreground">
              <span className="font-semibold">
                {fmtLong(selected)} ({WEEKDAYS[selected.getDay()]})
              </span>
              {selList[0] && (
                <span
                  title="Days until this date's next birthday"
                  className="rounded-md border border-cosmic-foreground/30 px-2 py-0.5 text-[11px]"
                >
                  {nextOccurrence(selList[0].dob, now).daysLeft} Days Left
                </span>
              )}
            </div>
            <div className="mt-2 divide-y">
              {selList.length === 0 && (
                <div className="grid place-items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                  No birthdays on this day.
                  <button
                    onClick={() => {
                      setEdit(undefined);
                      setQuickDob(selected <= now ? iso(selected) : "");
                      setOpen(true);
                    }}
                    className="text-xs font-semibold text-primary"
                  >
                    + Add a birthday on this date
                  </button>
                </div>
              )}
              {(showAllSel ? selList : selList.slice(0, 3)).map((p) => {
                const n = nextOccurrence(p.dob, now);
                return (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    <PersonAvatar p={p} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {p.name}
                        <span className={cn("rounded px-1.5 text-[10px]", CATS[p.category].soft)}>
                          {CATS[p.category].label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Turns {n.turning} •{" "}
                        {n.daysLeft === 0 ? "Today!" : `${n.daysLeft} Days Left`}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => giftIdeas(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg border text-primary hover:bg-accent"
                        aria-label="Gift ideas"
                        title="Gift ideas"
                      >
                        <Gift className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => sendWishes(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg border text-primary hover:bg-accent"
                        aria-label="Send wishes"
                        title="Send wishes"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEdit(p);
                          setOpen(true);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg border text-primary hover:bg-accent"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.name}'s birthday?`)) {
                            removeBirthday(p.id);
                            toast.success(`${p.name} removed`);
                          }
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg border text-destructive hover:bg-destructive/10"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {selList.length > 3 && (
              <button
                onClick={() => setShowAllSel(!showAllSel)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold text-primary"
              >
                {showAllSel ? "Show Less" : `View All (${selList.length})`}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </Panel>
          <Panel>
            <h3 className="mb-3 font-semibold">Calendar Actions</h3>
            <div className="grid gap-2">
              {[
                {
                  i: Download,
                  t: "Export Calendar",
                  d: "Download as ICS file",
                  f: () => {
                    if (!list.length) {
                      toast("No birthdays to export");
                      return;
                    }
                    download("dobverse-birthdays.ics", toICS(list), "text/calendar");
                  },
                },
                {
                  i: CalendarDays,
                  t: "Add to Google Calendar",
                  d: "Add birthdays to your Google Calendar",
                  f: gcal,
                },
                { i: Printer, t: "Print Calendar", d: "Print this month", f: () => window.print() },
                { i: Share2, t: "Share Calendar", d: "Share with family & friends", f: share },
              ].map((a) => (
                <button
                  key={a.t}
                  onClick={a.f}
                  className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-accent/50"
                >
                  <a.i className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              Quick Add Birthday <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <div className="flex min-w-0 items-center gap-2 rounded-xl border px-3">
              <input
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
                placeholder="Enter name"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
              <input
                type="date"
                value={quickDob}
                max={iso(new Date())}
                onChange={(e) => setQuickDob(e.target.value)}
                className="w-32 min-w-0 bg-transparent text-xs outline-none"
                aria-label="Date of birth"
              />
            </div>
            <button
              onClick={quickAdd}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-cta py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" />
              Add Birthday
            </button>
          </Panel>
        </div>
      </div>
      <AddBirthdayDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        title={edit ? "Edit Birthday" : "Add Birthday"}
        defaultDob={quickDob || undefined}
      />
    </>
  );
}
