import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Bell,
  Star,
  ArrowRight,
  Heart,
  Wind,
  Footprints,
  Moon,
  Droplet,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Users,
  Share2,
  QrCode,
  ListOrdered,
  Cake,
} from "lucide-react";
import dashHero from "@/assets/dashboard-hero.jpg";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader, Donut, CHART } from "@/components/app/ui";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { useBirthdays, withNext } from "@/lib/birthdays-store";
import {
  ageParts,
  birthDate,
  decadeBreakdown,
  fmtDate,
  fmtLong,
  fmtPlace,
  fmtTime,
  greeting,
  lifeStats,
  milestones,
  MONTHS,
  nextBirthday,
  pad,
  short,
  weekday,
  addYears,
} from "@/lib/birth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dash/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DOBverse" },
      {
        name: "description",
        content: "Your personal birth story dashboard: live age, countdown, stats and timeline.",
      },
      { property: "og:title", content: "Dashboard — DOBverse" },
      { property: "og:description", content: "Your personal birth story dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const birth = useCurrentBirth();
  const now = useNow();
  const savedBirthdays = useBirthdays();
  const b = birthDate(birth);
  if (!now)
    return <Topbar greeting title="Welcome!" subtitle="Every second of your life has a story." />;
  const age = ageParts(b, now);
  const nb = nextBirthday(b, now);
  const st = lifeStats(b, now);
  const ms = milestones(b);
  const dec = decadeBreakdown(b, now);
  const upcomingBirthdays = withNext(savedBirthdays, now);

  return (
    <>
      <Topbar
        greeting
        title={`${greeting(now).replace("!", "")}${birth.name ? `, ${birth.name}!` : "!"}`}
        subtitle="Every second of your life has a story."
      />
      <div className="grid gap-5 px-4 pb-8 sm:px-6 xl:grid-cols-4">
        {/* Hero */}
        <section className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] overflow-hidden rounded-2xl bg-cosmic p-6 text-cosmic-foreground shadow-soft xl:col-span-3 sm:p-8">
          <img
            src={dashHero}
            alt="Cosmic clock with a traveler on a glowing path"
            className="absolute inset-0 h-full w-full object-cover object-[80%_center] sm:object-right opacity-100"
            width={1536}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/40 to-transparent" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold">Here's your</h2>
            <p className="text-gradient font-display text-5xl font-bold leading-tight sm:text-6xl">
              birth story
              {birth.name ? (
                <>
                  ,<br />
                  {birth.name}! ✨
                </>
              ) : (
                "!"
              )}
            </p>
            <p className="mt-2 text-lg text-cosmic-foreground/90">
              Every second of your life has a story.
            </p>
            <div className="mt-6 grid gap-3 rounded-xl border border-cosmic-foreground/15 bg-card/90 p-4 text-card-foreground shadow-soft backdrop-blur sm:grid-cols-4">
              {[
                { i: CalendarDays, l: "Born on", v: fmtDate(b) },
                { i: CalendarDays, l: "Day of Birth", v: weekday(b) },
                { i: Clock, l: "Time of Birth", v: fmtTime(birth) },
                { i: MapPin, l: "Born in", v: fmtPlace(birth) },
              ].map((x) => (
                <div key={x.l} className="flex min-w-0 items-center gap-2">
                  <x.i className="h-6 w-6 shrink-0 text-primary" />
                  <div className="min-w-0 text-xs">
                    <div className="text-muted-foreground">{x.l}</div>
                    <div className="truncate text-sm font-semibold">{x.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Countdown */}
        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-magenta" />
                Next Birthday Countdown 🎉
              </span>
            }
            right={fmtLong(nb.date)}
          />
          <div className="grid grid-cols-4 divide-x text-center">
            {[
              [nb.days, "Days"],
              [nb.hours, "Hours"],
              [nb.minutes, "Minutes"],
              [nb.seconds, "Seconds"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-gradient font-display text-3xl font-bold">
                  {pad(v as number)}
                </div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-brand"
              style={{ width: `${nb.progress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{(nb.progress * 100).toFixed(1)}% completed</span>
            <span>Turning {nb.turning} ✨</span>
          </div>
        </Panel>

        {/* Age */}
        <Panel>
          <PanelHeader
            title={
              <>
                Your Age <span className="text-xs font-normal text-muted-foreground">(Live)</span>
              </>
            }
            right={
              <span className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Accurate to the second
              </span>
            }
          />
          <div className="grid grid-cols-3 divide-x text-center">
            {[
              [age.years, "Years", "text-primary"],
              [age.months, "Months", "text-primary"],
              [age.days, "Days", "text-magenta"],
            ].map(([v, l, c]) => (
              <div key={l as string}>
                <div className={cn("font-display text-4xl font-bold", c as string)}>{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
            {[
              [age.hours, "Hours"],
              [age.minutes, "Minutes"],
              [age.seconds, "Seconds"],
            ].map(([v, l], i) => (
              <>
                <div key={l} className="rounded-xl bg-muted py-2">
                  <div className="font-display text-2xl font-bold">{pad(v as number)}</div>
                  <div className="text-[10px] text-muted-foreground">{l}</div>
                </div>
                {i < 2 && <span className="font-bold">:</span>}
              </>
            ))}
          </div>
          <p className="mt-4 border-t pt-3 text-center text-sm">
            You were born on <b className="text-primary">{weekday(b)}</b>{" "}
            <Star className="inline h-4 w-4 fill-primary text-primary" />
          </p>
        </Panel>

        {/* Life stats */}
        <Panel className="xl:col-span-2">
          <PanelHeader title="Life Statistics" right={`Since ${fmtDate(b)}`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { i: Heart, l: "Heartbeats", v: st.heartbeats, c: "text-destructive" },
              { i: Wind, l: "Breaths", v: st.breaths, c: "text-magenta" },
              { i: Footprints, l: "Steps Walked", v: st.steps, c: "text-success" },
              { i: Moon, l: "Hours Slept", v: st.hoursSlept, c: "text-primary" },
              { i: Droplet, l: "Litres of Water", v: st.water, c: "text-info" },
              { i: Eye, l: "Times You Blinked", v: st.blinks, c: "text-success" },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-3 rounded-xl border p-3">
                <x.i className={cn("h-7 w-7 shrink-0", x.c)} />
                <div>
                  <div className="text-[11px] text-muted-foreground">{x.l}</div>
                  <div className="font-display text-lg font-bold">{short(x.v)}</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/statistics"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-semibold text-primary"
          >
            View More Details <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>

        {/* On this day */}
        <Panel>
          <PanelHeader title={`On This Day – ${now.getDate()} ${MONTHS[now.getMonth()]}`} />
          <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
            {[0, 1, 5, 10, 18]
              .filter((y) => b.getFullYear() + y <= now.getFullYear())
              .slice(0, 4)
              .map((y) => {
                const d = new Date(now);
                d.setFullYear(now.getFullYear() - (age.years - y));
                return (
                  <li key={y} className="relative text-sm">
                    <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    <div className="font-semibold">{d.getFullYear()}</div>
                    <div className="text-xs text-muted-foreground">
                      {y === 0
                        ? "Your first year of life"
                        : `You were ${y} year${y > 1 ? "s" : ""} old`}
                    </div>
                  </li>
                );
              })}
            <li className="relative text-sm">
              <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-magenta ring-4 ring-magenta/20" />
              <div className="font-semibold">Today</div>
              <div className="text-xs text-muted-foreground">
                Day {Math.floor(st.days) + 1} of your life
              </div>
            </li>
          </ol>
        </Panel>

        {/* Timeline */}
        <Panel className="xl:col-span-3">
          <PanelHeader title="Life Timeline" subtitle="Milestones of your life" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { label: "Born", y: b.getFullYear() },
              ...[1, 5, 10, 18, 21, 25, 30].map((n) => ({
                label: `${n} Year${n > 1 ? "s" : ""}`,
                y: b.getFullYear() + n,
              })),
            ]
              .filter((x) => x.y <= now.getFullYear() + 1)
              .map((x, i) => (
                <div key={x.label} className="min-w-20 flex-1 text-center">
                  <div
                    className={cn(
                      "mx-auto grid h-12 w-12 place-items-center rounded-full",
                      i % 2 ? "bg-magenta/10 text-magenta" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Cake className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">{x.label}</div>
                  <div className="text-sm font-semibold">{x.y}</div>
                </div>
              ))}
            <div className="min-w-20 flex-1 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                <Star className="h-5 w-5" />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Next Birthday</div>
              <div className="text-sm font-semibold">{nb.date.getFullYear()}</div>
            </div>
          </div>
          <Link
            to="/timeline"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-semibold text-primary"
          >
            View Full Timeline ({ms.filter((m) => m.date <= now).length} milestones reached){" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>

        {/* Analytics */}
        <Panel>
          <PanelHeader title="Life Analytics" />
          <div className="flex items-center gap-4">
            <Donut
              size={120}
              stroke={18}
              segments={dec.map((d, i) => ({ value: d.pct, color: CHART[i] }))}
            />
            <ul className="space-y-1.5 text-xs">
              {dec.map((d, i) => (
                <li key={d.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART[i] }} />
                  {d.label}: {d.pct.toFixed(0)}%
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/statistics"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-semibold text-primary"
          >
            View All Analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>

        <MiniCalendar birth={b} now={now} />

        <Panel>
          <PanelHeader
            title="Upcoming Birthdays"
            right={
              <Link to="/reminders" className="text-primary">
                View All
              </Link>
            }
          />
          {upcomingBirthdays.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No upcoming birthdays saved yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingBirthdays.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-primary shrink-0">
                    {p.name.trim()[0]?.toUpperCase() || "?"}
                  </span>
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{fmtLong(p.next.date)}</div>
                  </div>
                  <div className="text-lg font-bold text-primary shrink-0 text-right">
                    {p.next.daysLeft === 0 ? (
                      <span className="text-sm font-bold text-magenta">Today!</span>
                    ) : (
                      <>
                        {p.next.daysLeft}{" "}
                        <span className="text-xs font-normal">
                          Day{p.next.daysLeft !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/reminders"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-semibold text-primary"
          >
            Add Birthday <Plus className="h-4 w-4" />
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Birthday Card" />
          <div className="relative overflow-hidden rounded-xl bg-gradient-cta p-5 text-primary-foreground">
            <p className="font-display text-3xl font-bold italic leading-tight">
              Happy
              <br />
              Birthday!
            </p>
            <p className="mt-6 text-sm">{fmtLong(nb.date)}</p>
            <Cake className="absolute bottom-3 right-3 h-16 w-16 opacity-80" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/card"
              className="rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Create Card
            </Link>
            <Link
              to="/card"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary"
            >
              <Download className="h-4 w-4" />
              Download
            </Link>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { i: Users, t: "Compare Birthdays", d: "See how you match", to: "/compare" as const },
              {
                i: ListOrdered,
                t: "Life Timeline",
                d: "Your milestones",
                to: "/timeline" as const,
              },
              {
                i: Share2,
                t: "Share Your Story",
                d: "Share with loved ones",
                to: "/card" as const,
              },
              { i: QrCode, t: "QR Code", d: "Share instantly", to: "/card" as const },
            ].map((q) => (
              <Link
                key={q.t}
                to={q.to}
                className="flex items-start gap-2 rounded-xl border p-3 hover:bg-accent"
              >
                <q.i className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <div className="text-xs font-semibold">{q.t}</div>
                  <div className="text-[10px] text-muted-foreground">{q.d}</div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function MiniCalendar({ birth, now }: { birth: Date; now: Date }) {
  const [m, setM] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const start = new Date(m);
  start.setDate(1 - m.getDay());
  const days = Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  const isBday = (d: Date) => {
    if (birth.getMonth() === 1 && birth.getDate() === 29) {
      const leap = new Date(d.getFullYear(), 1, 29).getMonth() === 1;
      return leap
        ? d.getMonth() === 1 && d.getDate() === 29
        : d.getMonth() === 1 && d.getDate() === 28;
    }
    return d.getDate() === birth.getDate() && d.getMonth() === birth.getMonth();
  };
  const isToday = (d: Date) => d.toDateString() === now.toDateString();
  return (
    <Panel>
      <PanelHeader title="Calendar" />
      <div className="mb-3 flex items-center gap-3 text-sm font-semibold">
        <button
          onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="rounded-md border p-1"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {MONTHS[m.getMonth()]} {m.getFullYear()}
        <button
          onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="rounded-md border p-1"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cn(
              "mx-auto grid h-7 w-7 place-items-center rounded-full",
              d.getMonth() !== m.getMonth() && "text-muted-foreground/50",
              isToday(d) && "ring-2 ring-primary",
              isBday(d) && "bg-primary font-bold text-primary-foreground",
            )}
          >
            {d.getDate()}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Your birthday: {fmtDate(birth).split(" ").slice(0, 2).join(" ")}
      </p>
    </Panel>
  );
}
