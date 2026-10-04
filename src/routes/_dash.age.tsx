import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Star,
  Hourglass,
  Sparkles,
  Cake,
  Rocket,
  Heart,
  CheckCircle2,
  Timer,
  CalendarRange,
} from "lucide-react";
import hourglass from "@/assets/hourglass.jpg";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader, IconBubble } from "@/components/app/ui";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import {
  ageParts,
  addYears,
  birthDate,
  fmtDate,
  fmtLong,
  fmtPlace,
  fmtTime,
  humanIn,
  leapYearsLived,
  nextBirthday,
  pad,
  totals,
  weekday,
} from "@/lib/birth";

export const Route = createFileRoute("/_dash/age")({
  head: () => ({
    meta: [
      { title: "Age & Time — DOBverse" },
      {
        name: "description",
        content: "Your live age to the second, life totals and upcoming milestones.",
      },
      { property: "og:title", content: "Age & Time — DOBverse" },
      {
        property: "og:description",
        content: "Your live age to the second, life totals and upcoming milestones.",
      },
    ],
  }),
  component: AgePage,
});

const DAY_TRAITS: Record<string, string> = {
  Sunday: "People born on this day are known to be bright, confident and full of warmth.",
  Monday: "People born on this day are known to be caring, intuitive and deeply loyal.",
  Tuesday: "People born on this day are known to be bold, driven and full of courage.",
  Wednesday: "People born on this day are known to be curious, clever and great communicators.",
  Thursday: "People born on this day are known to be optimistic, generous and wise.",
  Friday: "People born on this day are known to be creative, charming and full of energy.",
  Saturday: "People born on this day are known to be disciplined, patient and dependable.",
};

function AgePage() {
  const birth = useCurrentBirth();
  const now = useNow();
  const b = birthDate(birth);
  if (!now)
    return (
      <Topbar
        title="Age & Time"
        subtitle="See your life in numbers and every tiny moment counted."
        back
      />
    );
  const a = ageParts(b, now);
  const t = totals(b, now);
  const day = weekday(b);
  const nb = nextBirthday(b, now);
  const next10k = Math.ceil((t.days + 1) / 10000) * 10000;
  const d10k = new Date(b.getTime() + next10k * 864e5);
  const nextBillion = Math.ceil((t.seconds + 1) / 1e9) * 1e9;
  const dBil = new Date(b.getTime() + nextBillion * 1000);
  const next25 = Math.ceil((a.years + 1) / 25) * 25;
  const next50 = Math.ceil((a.years + 1) / 50) * 50;
  const milestones = [
    { i: Star, tone: "success" as const, l: "Next Birthday", d: nb.date },
    {
      i: CalendarRange,
      tone: "warn" as const,
      l: `Next ${next10k.toLocaleString()} Days`,
      d: d10k,
    },
    {
      i: Hourglass,
      tone: "info" as const,
      l: `Next ${nextBillion / 1e9} Billion Seconds`,
      d: dBil,
    },
    { i: Rocket, tone: "magenta" as const, l: `Next ${next25} Years`, d: addYears(b, next25) },
    { i: Heart, tone: "magenta" as const, l: `Next ${next50} Years`, d: addYears(b, next50) },
  ];
  const facts = [
    `You were born on a ${day}, ${fmtLong(b)}.`,
    `You've lived through ${t.days.toLocaleString()} sunrises.`,
    `Your age in dog years is around ${Math.round(a.years * 7)} 🐶`,
    `You have spent about ${Math.round(t.days / 3).toLocaleString()} days (a third of your life) sleeping.`,
    `You have experienced ${a.years} summers and ${a.years} winters.`,
    `You've lived through ${leapYearsLived(b, now)} leap days (29 February).`,
  ];
  const units = [
    [a.years, "Years"],
    [a.months, "Months"],
    [a.days, "Days"],
    [a.hours, "Hours"],
    [a.minutes, "Minutes"],
    [a.seconds, "Seconds"],
  ] as const;
  const tot = [
    { i: CalendarDays, l: "Total Days", v: t.days, u: "Days", tone: "primary" as const },
    { i: CalendarDays, l: "Total Weeks", v: t.weeks, u: "Weeks", tone: "info" as const },
    { i: CalendarRange, l: "Total Months", v: t.months, u: "Months", tone: "warn" as const },
    { i: Cake, l: "Total Years", v: t.years, u: "Years", tone: "magenta" as const },
    { i: Clock, l: "Total Hours", v: t.hours, u: "Hours", tone: "primary" as const },
    { i: Timer, l: "Total Minutes", v: t.minutes, u: "Minutes", tone: "warn" as const },
    { i: Timer, l: "Total Seconds", v: t.seconds, u: "Seconds", tone: "info" as const },
    {
      i: Sparkles,
      l: "Leap Years Lived",
      v: leapYearsLived(b, now),
      u: "Years",
      tone: "primary" as const,
    },
  ];

  return (
    <>
      <Topbar
        title="Age & Time"
        subtitle="See your life in numbers and every tiny moment counted."
        back
      />
      <div className="space-y-5 px-4 pb-8 sm:px-6">
        <section className="relative min-h-[200px] sm:min-h-[230px] overflow-hidden rounded-2xl bg-cosmic p-6 text-cosmic-foreground shadow-soft sm:p-8">
          <img
            src={hourglass}
            alt="Glowing hourglass with flowing stardust"
            className="absolute -right-6 top-1/2 hidden h-[130%] -translate-y-1/2 rounded-full object-cover opacity-95 md:block"
            style={{ maskImage: "radial-gradient(circle, black 55%, transparent 75%)" }}
          />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cosmic-foreground/20 bg-cosmic-foreground/10 px-3 py-1 text-xs backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-success" />
              Live Age
            </span>
            <p className="mt-3 text-xl">You are</p>
            <div className="mt-3">
              {/* Desktop & Tablet: Single horizontal line with all 6 units */}
              <div className="hidden sm:flex sm:items-center sm:gap-1.5 md:gap-2 sm:flex-nowrap">
                {units.map(([v, l], i) => (
                  <div key={l} className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-[70px] md:w-[78px] lg:w-[84px] shrink-0 rounded-xl border border-cosmic-foreground/15 bg-cosmic-foreground/10 py-2.5 sm:py-3 text-center backdrop-blur">
                      <div className="font-display text-2xl md:text-3xl font-bold">{pad(v)}</div>
                      <div className="text-[11px] md:text-xs text-cosmic-foreground/80">{l}</div>
                    </div>
                    {i < 5 && (
                      <span className="shrink-0 text-base md:text-lg font-bold opacity-60 select-none">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile (<640px): Intentional balanced 3x2 grid */}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {units.map(([v, l]) => (
                  <div
                    key={l}
                    className="rounded-xl border border-cosmic-foreground/15 bg-cosmic-foreground/10 py-2.5 text-center backdrop-blur"
                  >
                    <div className="font-display text-2xl font-bold">{pad(v)}</div>
                    <div className="text-[10px] text-cosmic-foreground/80">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-sm text-cosmic-foreground/90">
              ✨ Counting every second of your amazing journey!
            </p>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Your Birth Details"
              right={
                <Link
                  to="/"
                  className="flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold text-primary"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { i: CalendarDays, l: "Date of Birth", v: fmtLong(b), tone: "primary" as const },
                { i: Clock, l: "Time of Birth", v: fmtTime(birth), tone: "primary" as const },
                { i: MapPin, l: "Place of Birth", v: fmtPlace(birth), tone: "magenta" as const },
              ].map((x) => (
                <div key={x.l}>
                  <IconBubble tone={x.tone}>
                    <x.i className="h-5 w-5" />
                  </IconBubble>
                  <div className="mt-3 text-xs text-muted-foreground">{x.l}</div>
                  <div className="font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="relative overflow-hidden bg-accent">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Day of Birth
            </h3>
            <p className="mt-3 flex items-center gap-2 font-display text-4xl font-bold text-primary">
              {day} <Star className="h-7 w-7 rounded-full bg-primary/15 p-1 fill-primary" />
            </p>
            <p className="mt-2 max-w-xs text-sm">{DAY_TRAITS[day]}</p>
            <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-6 rounded-2xl border-4 border-primary bg-card px-6 py-5 font-display text-5xl font-black text-foreground shadow-glow sm:block">
              {day.slice(0, 3).toUpperCase()}
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title="Your Life in Totals"
            subtitle="All the big numbers that make your journey unique."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tot.map((x) => (
              <div key={x.l} className="flex items-start gap-3 rounded-xl border p-4">
                <IconBubble tone={x.tone}>
                  <x.i className="h-5 w-5" />
                </IconBubble>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{x.l}</div>
                  <div className="truncate font-display text-xl font-bold">
                    {x.v.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">{x.u}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Next Milestones"
            subtitle="Big moments coming up in your life journey."
          />
          <div className="relative grid gap-6 sm:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-6 hidden h-0.5 bg-gradient-brand sm:block" />
            {milestones.map((m) => (
              <div key={m.l} className="relative text-center">
                <IconBubble
                  tone={m.tone}
                  className="mx-auto h-12 w-12 rounded-full bg-card ring-4 ring-background"
                >
                  <m.i className="h-5 w-5" />
                </IconBubble>
                <div className="mt-3 text-xs font-medium">{m.l}</div>
                <div className="font-semibold">{fmtDate(m.d)}</div>
                <div className="text-xs text-muted-foreground">{humanIn(m.d, now)}</div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Amazing Facts About You" />
            <ul className="space-y-3">
              {facts.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 fill-primary text-card" />
                  {f}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="bg-gradient-to-br from-card to-accent">
            <PanelHeader title="Motivational Note" />
            <p className="font-display text-4xl text-primary">“</p>
            <p className="text-xl">
              "Every second is a new beginning.
              <br />
              Keep growing, keep shining!"
            </p>
          </Panel>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          🔒 All calculations are based on your birth details and current time.
        </p>
      </div>
    </>
  );
}
