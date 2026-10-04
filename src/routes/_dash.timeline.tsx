import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  User,
  CalendarClock,
  Infinity as InfinityIcon,
  Sparkles,
  Baby,
  Cake,
  Clock,
} from "lucide-react";
import timelineHero from "@/assets/timeline-hero.jpg";
import hourglass from "@/assets/hourglass.jpg";
import { Topbar } from "@/components/app/AppShell";
import { Panel, IconBubble } from "@/components/app/ui";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import {
  ageParts,
  birthDate,
  fmtDate,
  fmtLong,
  humanIn,
  milestones,
  nextBirthday,
  weekday,
  type Milestone,
} from "@/lib/birth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dash/timeline")({
  head: () => ({
    meta: [
      { title: "Life Timeline — DOBverse" },
      {
        name: "description",
        content: "Every milestone of your life, automatically mapped from your date of birth.",
      },
      { property: "og:title", content: "Life Timeline — DOBverse" },
      { property: "og:description", content: "Every moment of your life, beautifully mapped." },
    ],
  }),
  component: TimelinePage,
});

const tone = (m: Milestone) =>
  m.kind === "birthday"
    ? "magenta"
    : m.kind === "seconds"
      ? "info"
      : m.kind === "born"
        ? "primary"
        : "success";

function Row({ m, now, past }: { m: Milestone; now: Date; past: boolean }) {
  return (
    <li className="grid grid-cols-[4.5rem_auto_minmax(0,1fr)_auto] items-center gap-3 py-2">
      <div className="text-[11px] leading-tight text-muted-foreground">
        <div className="text-foreground/90">{fmtDate(m.date)}</div>
        {weekday(m.date).slice(0, 3)}
      </div>
      <IconBubble
        tone={tone(m)}
        className="h-9 w-9 rounded-full text-xs font-bold ring-1 ring-current"
      >
        {m.kind === "born" ? <Baby className="h-4 w-4" /> : m.badge}
      </IconBubble>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{m.title}</div>
        {m.desc && <div className="truncate text-xs text-muted-foreground">{m.desc}</div>}
      </div>
      <div className={cn("text-right text-xs", past ? "text-foreground/90" : "text-primary")}>
        {past ? (
          m.kind === "birthday" || m.kind === "seconds" ? (
            <>
              Age {m.age.toFixed(2)}
              <br />
              Day {m.dayNumber.toLocaleString()}
            </>
          ) : (
            `Day ${m.dayNumber.toLocaleString()}`
          )
        ) : (
          humanIn(m.date, now)
        )}
      </div>
    </li>
  );
}

function TimelinePage() {
  const birth = useCurrentBirth();
  const now = useNow();
  const b = birthDate(birth);
  if (!now)
    return (
      <Topbar title="Life Timeline" subtitle="Every moment of your life, beautifully mapped." />
    );
  const all = milestones(b);
  const past = all.filter((m) => m.date <= now);
  const upcoming = all.filter((m) => m.date > now);
  const a = ageParts(b, now);
  const nb = nextBirthday(b, now);
  const nextBday = nb.date;
  const nextTurning = nb.turning;
  const upcomingFull: Milestone[] = upcoming.some((m) => m.date.getTime() === nextBday.getTime())
    ? upcoming
    : [
        {
          key: "nb",
          title: `Next Birthday (${nextTurning}${["th", "st", "nd", "rd"][nextTurning % 10 > 3 || Math.floor((nextTurning % 100) / 10) === 1 ? 0 : nextTurning % 10]})`,
          desc: "A new year of opportunities!",
          badge: String(nextTurning),
          date: nextBday,
          kind: "birthday",
          dayNumber: 0,
          age: nextTurning,
        },
        ...upcoming,
      ];
  const ageStr = `${a.years} Years, ${a.months} Months, ${a.days} Days`;
  const summary = [
    { i: Baby, l: "Born", v: fmtLong(b), s: weekday(b), tone: "primary" as const },
    {
      i: CheckCircle2,
      l: "Past Milestones",
      v: String(past.length),
      s: "Completed",
      tone: "success" as const,
    },
    {
      i: User,
      l: "Current Age",
      v: `${a.years} Years`,
      s: `${a.months} Months, ${a.days} Days`,
      tone: "primary" as const,
    },
    {
      i: CalendarClock,
      l: "Upcoming Milestones",
      v: String(upcomingFull.length),
      s: "Ahead",
      tone: "warn" as const,
    },
    {
      i: InfinityIcon,
      l: "Future Journey",
      v: "∞",
      s: "Endless possibilities",
      tone: "primary" as const,
    },
  ];

  return (
    <>
      <Topbar title="Life Timeline" subtitle="Every moment of your life, beautifully mapped." />
      <div className="space-y-5 px-4 pb-8 sm:px-6">
        <section className="relative min-h-[220px] sm:min-h-[250px] md:min-h-[270px] overflow-hidden rounded-2xl bg-cosmic p-6 text-cosmic-foreground shadow-soft sm:p-8">
          <img
            src={timelineHero}
            alt="Child on a glowing path toward a giant planet"
            className="absolute inset-0 h-full w-full object-cover object-[75%_center] sm:object-right opacity-100 saturate-100"
            width={1536}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/45 to-transparent" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold">Your life is a timeline of</h2>
              <p className="font-display text-3xl font-bold">
                <span className="text-primary dark:text-magenta">moments</span> that{" "}
                <span className="text-primary">matter.</span>
              </p>
              <p className="mt-3 text-cosmic-foreground/90">
                From the day you were born
                <br />
                to every milestone ahead.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cosmic-foreground/20 bg-cosmic/70 px-3 py-1.5 text-xs shadow-soft backdrop-blur">
                <Sparkles className="h-4 w-4 text-warn" />
                Calculated using your date of birth
              </span>
            </div>
            <div className="flex gap-3 rounded-xl border border-cosmic-foreground/20 bg-cosmic/80 p-5 shadow-soft backdrop-blur text-cosmic-foreground">
              <CalendarDays className="h-7 w-7 text-primary" />
              <div className="text-sm">
                Your life journey
                <br />
                in numbers
                <p className="mt-3 font-medium text-cosmic-foreground">
                  {ageStr}
                  <br />
                  and counting…
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {summary.map((x) => (
            <Panel key={x.l} className="flex items-center gap-3 p-4">
              <IconBubble tone={x.tone} className="rounded-full">
                <x.i className="h-5 w-5" />
              </IconBubble>
              <div className="min-w-0 text-xs">
                <div className="text-muted-foreground">{x.l}</div>
                <div className="truncate text-base font-semibold">{x.v}</div>
                <div className="truncate text-muted-foreground">{x.s}</div>
              </div>
            </Panel>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Panel>
              <h3 className="flex items-center gap-2 text-lg font-semibold uppercase text-success">
                <CheckCircle2 className="h-5 w-5" />
                Past Milestones
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Milestones you've already achieved
              </p>
              <ul className="divide-y">
                {past.map((m) => (
                  <Row key={m.key} m={m} now={now} past />
                ))}
              </ul>
            </Panel>
            <Panel>
              <h3 className="flex items-center gap-2 text-lg font-semibold uppercase text-primary">
                <Sparkles className="h-5 w-5" />
                Upcoming Milestones
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Milestones you have yet to achieve
              </p>
              <ul className="divide-y">
                {upcomingFull.map((m) => (
                  <Row key={m.key} m={m} now={now} past={false} />
                ))}
                <li className="grid grid-cols-[4.5rem_auto_minmax(0,1fr)_auto] items-center gap-3 py-2">
                  <span className="text-xs text-muted-foreground">Beyond…</span>
                  <IconBubble className="h-9 w-9 rounded-full">
                    <InfinityIcon className="h-4 w-4" />
                  </IconBubble>
                  <div>
                    <div className="text-sm font-medium">Your Future Journey</div>
                    <div className="text-xs text-muted-foreground">
                      Infinite possibilities await you.
                    </div>
                  </div>
                  <span className="text-xs text-primary">And beyond ∞</span>
                </li>
              </ul>
            </Panel>
            <Panel className="flex items-center gap-3 py-4 text-primary">
              <Sparkles className="h-5 w-5" />
              Every day is a new chapter. Keep writing your beautiful story! 💜
            </Panel>
          </div>
          <div className="space-y-5">
            <Panel>
              <h3 className="mb-3 text-lg font-semibold uppercase">Timeline Summary ✨</h3>
              <ul className="divide-y">
                {summary.map((x) => (
                  <li key={x.l} className="flex items-center gap-3 py-3">
                    <IconBubble tone={x.tone} className="rounded-full">
                      <x.i className="h-5 w-5" />
                    </IconBubble>
                    <div className="text-sm">
                      <div>{x.l}</div>
                      <div className="text-lg font-semibold">{x.v}</div>
                      <div className="text-xs text-muted-foreground">{x.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <h3 className="mb-3 text-lg font-semibold uppercase">Upcoming Milestones</h3>
              <ul className="space-y-3">
                {upcomingFull
                  .filter((m) => m.kind === "birthday")
                  .slice(0, 6)
                  .map((m) => (
                    <li key={m.key} className="flex items-center gap-3 text-sm">
                      <IconBubble tone="magenta" className="h-9 w-9 rounded-full">
                        <Cake className="h-4 w-4" />
                      </IconBubble>
                      <span className="flex-1">{m.title}</span>
                      <span className="text-xs text-muted-foreground">{humanIn(m.date, now)}</span>
                    </li>
                  ))}
              </ul>
            </Panel>
            <Panel className="relative overflow-hidden">
              <p className="font-display text-4xl text-primary">“</p>
              <p className="relative z-10 max-w-[70%] text-sm">
                Life is not measured by the number of breaths we take, but by the moments that take
                our breath away.
              </p>
              <img
                src={hourglass}
                alt=""
                className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full object-cover opacity-40 dark:opacity-70"
              />
              <Clock className="sr-only" />
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
