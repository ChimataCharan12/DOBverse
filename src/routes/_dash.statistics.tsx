import { createFileRoute } from "@tanstack/react-router";
import {
  Heart,
  Wind,
  Footprints,
  Eye,
  Moon,
  Droplet,
  Flame,
  Brain,
  Leaf,
  CalendarDays,
  Sun,
  Info,
  Hourglass,
} from "lucide-react";
import statsHuman from "@/assets/stats-human.jpg";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader, IconBubble, Donut, CHART } from "@/components/app/ui";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { birthDate, decadeBreakdown, lifeStats, nextBirthday, words, ageParts } from "@/lib/birth";

export const Route = createFileRoute("/_dash/statistics")({
  head: () => ({
    meta: [
      { title: "Life Statistics — DOBverse" },
      {
        name: "description",
        content:
          "Estimated heartbeats, breaths, steps, sleep and more since the day you were born.",
      },
      { property: "og:title", content: "Life Statistics — DOBverse" },
      { property: "og:description", content: "The amazing numbers behind your life journey." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const birth = useCurrentBirth();
  const now = useNow();
  const b = birthDate(birth);
  if (!now)
    return (
      <Topbar
        title="Life Statistics"
        subtitle="Discover the amazing numbers behind your life journey."
        back
      />
    );
  const s = lifeStats(b, now);
  const dec = decadeBreakdown(b, now);
  const nb = nextBirthday(b, now);
  const age = ageParts(b, now).years;

  const body = [
    {
      i: Heart,
      l: "Heartbeats",
      v: words(s.heartbeats),
      n: "Approximate",
      tone: "magenta" as const,
      bar: "var(--destructive)",
    },
    {
      i: Wind,
      l: "Breaths Taken",
      v: words(s.breaths),
      n: "Approximate",
      tone: "magenta" as const,
      bar: "var(--magenta)",
    },
    {
      i: Footprints,
      l: "Steps Walked",
      v: words(s.steps),
      n: "Approximate",
      tone: "success" as const,
      bar: "var(--success)",
    },
    {
      i: Eye,
      l: "Blinks",
      v: words(s.blinks),
      n: "Approximate",
      tone: "info" as const,
      bar: "var(--info)",
    },
    {
      i: Moon,
      l: "Hours Slept",
      v: Math.round(s.hoursSlept).toLocaleString(),
      n: `That's ${(s.hoursSlept / 24).toFixed(1)} days`,
      tone: "primary" as const,
      bar: "var(--primary)",
    },
    {
      i: Droplet,
      l: "Water Consumed",
      v: `${words(s.water)} Liters`,
      n: "Approximate",
      tone: "info" as const,
      bar: "var(--info)",
    },
    {
      i: Flame,
      l: "Calories Burned",
      v: `${words(s.calories)} kcal`,
      n: "Approximate",
      tone: "warn" as const,
      bar: "var(--warn)",
    },
    {
      i: Brain,
      l: "Thoughts Estimated",
      v: words(s.thoughts),
      n: "Stay curious!",
      tone: "primary" as const,
      bar: "var(--primary)",
    },
  ];
  const comparisons = [
    {
      i: Heart,
      l: "Heartbeats",
      c: `Enough to beat for ${Math.round(s.heartbeats / 7e9).toLocaleString() || "<1"}× every person on Earth once`,
    },
    {
      i: Footprints,
      l: "Steps Walked",
      c: `About ${Math.round((s.steps * 0.75) / 1000).toLocaleString()} km — ${((s.steps * 0.75) / 40_075_000).toFixed(2)}× around the Earth 🌍`,
    },
    {
      i: Wind,
      l: "Breaths Taken",
      c: `Enough air to fill ~${Math.round((s.breaths * 0.5) / 4000).toLocaleString()} hot air balloons 🎈`,
    },
    { i: Moon, l: "Hours Slept", c: "You've slept about one-third of your life 😴" },
    {
      i: Droplet,
      l: "Water Consumed",
      c: `Enough to fill ~${Math.max(1, Math.round(s.water / 2500)).toLocaleString()} home swimming pools 🏊`,
    },
  ];
  const most = [
    { l: "Sleeping", p: 33, c: "var(--primary)" },
    { l: "Learning", p: age < 25 ? 26 : 12, c: "var(--info)" },
    { l: "Working / Studying", p: age < 25 ? 17 : 30, c: "var(--success)" },
    { l: "Screen Time", p: 12, c: "var(--warn)" },
    { l: "Others", p: age < 25 ? 12 : 13, c: "var(--magenta)" },
  ];

  return (
    <>
      <Topbar
        title="Life Statistics"
        subtitle="Discover the amazing numbers behind your life journey."
        back
      />
      <div className="space-y-5 px-4 pb-8 sm:px-6">
        <section className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] overflow-hidden rounded-2xl bg-cosmic p-6 text-cosmic-foreground shadow-soft sm:p-10">
          <img
            src={statsHuman}
            alt="Glowing human figure surrounded by orbiting body icons"
            className="absolute inset-0 h-full w-full object-cover object-[85%_center] sm:object-right opacity-100"
            width={1280}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/40 to-transparent" />
          <div className="relative max-w-sm">
            <p className="text-xl">Your life in numbers is</p>
            <p className="text-gradient font-display text-4xl font-bold">truly amazing! ✨</p>
            <p className="mt-3 text-cosmic-foreground/90">
              Every heartbeat, breath and step is a part of your incredible story.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-cosmic-foreground/20 bg-cosmic/70 px-4 py-1.5 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-success" />
              Live Statistics
            </span>
          </div>
        </section>

        <Panel>
          <PanelHeader
            title="Your Body in Action"
            subtitle="Real-time estimates of what your body has done so far."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {body.map((x, i) => (
              <div key={x.l} className="rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <IconBubble tone={x.tone} className="h-14 w-14 rounded-full">
                    <x.i className="h-6 w-6" />
                  </IconBubble>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{x.l}</div>
                    <div className="truncate font-display text-xl font-bold">{x.v}</div>
                    <div className="text-xs text-muted-foreground">{x.n}</div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${55 + ((i * 17) % 40)}%`, background: x.bar }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Life Time Breakdown"
              subtitle="A breakdown of your life in different time units."
            />
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Donut segments={dec.map((d, i) => ({ value: d.pct, color: CHART[i] }))}>
                <div>
                  <div className="font-display text-3xl font-bold">{age}</div>
                  <div className="text-xs text-muted-foreground">Years</div>
                </div>
              </Donut>
              <ul className="w-full space-y-3 text-sm">
                {dec.map((d, i) => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART[i] }} />
                    <span className="flex-1">{d.label}</span>
                    <b>{d.pct.toFixed(1)}%</b>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 rounded-xl bg-muted py-3 text-center text-sm">
              You've completed <b className="text-primary">{(nb.progress * 100).toFixed(1)}%</b> of
              your {ordinal(nb.turning)} year! 🎉
            </p>
          </Panel>
          <Panel>
            <PanelHeader
              title="Fun Life Comparisons"
              subtitle="Putting your numbers into perspective."
            />
            <ul className="divide-y">
              {comparisons.map((c) => (
                <li
                  key={c.l}
                  className="grid grid-cols-[auto_8rem_1fr] items-center gap-3 py-3 text-sm"
                >
                  <IconBubble className="h-8 w-8 rounded-lg">
                    <c.i className="h-4 w-4" />
                  </IconBubble>
                  <span>{c.l}</span>
                  <span className="text-muted-foreground">{c.c}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Life on Earth" subtitle="Since the day you were born." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  i: Leaf,
                  l: "Seasons Experienced",
                  v: s.seasons,
                  n: "And counting",
                  tone: "success" as const,
                },
                {
                  i: CalendarDays,
                  l: "Sundays Lived",
                  v: s.sundays,
                  n: "So far",
                  tone: "magenta" as const,
                },
                {
                  i: Moon,
                  l: "Full Moons Seen",
                  v: s.fullMoons,
                  n: "So far",
                  tone: "primary" as const,
                },
                {
                  i: Sun,
                  l: "Sunrises Seen",
                  v: s.sunrises,
                  n: "And counting",
                  tone: "warn" as const,
                },
              ].map((x) => (
                <div key={x.l} className="rounded-xl bg-muted p-4 text-center">
                  <IconBubble tone={x.tone} className="mx-auto rounded-full">
                    <x.i className="h-5 w-5" />
                  </IconBubble>
                  <div className="mt-2 text-[11px] text-muted-foreground">{x.l}</div>
                  <div className="font-display text-2xl font-bold">{x.v.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{x.n}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <span>Most of Your Life</span>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    Estimated
                  </span>
                </span>
              }
              subtitle="Estimated distribution based on general lifestyle averages."
            />
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ul className="w-full space-y-3">
                {most.map((m) => (
                  <li key={m.l}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{m.l}</span>
                      <span>{m.p}.0%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.p * 2.5}%`, background: m.c }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <Donut
                size={130}
                stroke={10}
                segments={most.map((m) => ({ value: m.p, color: m.c }))}
              >
                <Hourglass className="h-10 w-10 text-primary" />
              </Donut>
            </div>
          </Panel>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          All numbers are estimates based on averages and your provided birth details — not medical
          measurements.
        </p>
      </div>
    </>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
