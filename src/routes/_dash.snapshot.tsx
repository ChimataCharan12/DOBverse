import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Smartphone,
  Clapperboard,
  Music,
  Lightbulb,
  Car,
  Users,
  Trophy,
  Tv,
  Rocket,
  LineChart,
  Star,
  Quote,
  HeartPulse,
  Landmark,
  Wifi,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import earth from "@/assets/snapshot-earth.jpg";
import indiaGate from "@/assets/india-gate.jpg";
import { useRef, useState } from "react";
import { ChevronLeft as Prev, ChevronRight as Next } from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { useCurrentBirth } from "@/lib/birth-store";
import { birthDate } from "@/lib/birth";
import { birthYearQuery } from "@/lib/birth-year/birth-year.functions";
import type { BirthYearSnapshot, Item } from "@/lib/birth-year/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dash/snapshot")({
  head: () => ({
    meta: [
      { title: "Birth Year Snapshot — DOBverse" },
      {
        name: "description",
        content:
          "A glimpse of the world in the year you were born — population, culture, leaders and events.",
      },
      { property: "og:title", content: "Birth Year Snapshot — DOBverse" },
      {
        property: "og:description",
        content: "See what the world looked like the year you were born.",
      },
    ],
  }),
  component: SnapshotPage,
});

const fmtBig = (n: number | null, unit = "") => {
  if (n == null) return null;
  const [v, s] =
    n >= 1e12 ? [n / 1e12, " Trillion"] : n >= 1e9 ? [n / 1e9, " Billion"] : [n / 1e6, " Million"];
  return `${unit}${v.toFixed(v >= 100 ? 0 : 2).replace(/\.?0+$/, "")}${s}`;
};

function Card({
  icon: I,
  title,
  children,
  className,
}: {
  icon: typeof Star;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("snap-card flex flex-col rounded-2xl p-4", className)}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <I className="h-5 w-5 text-primary" />
        {title}
      </h3>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

const Unavailable = () => (
  <p className="my-auto py-6 text-center text-xs text-muted-foreground">
    Data unavailable for this year
  </p>
);
const Chip = ({ children }: { children: ReactNode }) => (
  <span className="mt-auto self-center rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
    {children}
  </span>
);

function Thumb({ src, alt, icon: I }: { src?: string | null; alt: string; icon: typeof Star }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div className="grid h-28 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-magenta/15">
        <I className="h-8 w-8 text-primary/70" />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-soft"
    />
  );
}

function Feature({
  icon,
  title,
  item,
  chip,
}: {
  icon: typeof Star;
  title: string;
  item: Item | null;
  chip?: string;
}) {
  return (
    <Card icon={icon} title={title}>
      {item ? (
        <>
          <div className="flex gap-3">
            <Thumb src={item.image} alt={item.title} icon={icon} />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{item.title}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{item.sub}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-1 items-end justify-center">
            {chip && <Chip>{chip}</Chip>}
          </div>
        </>
      ) : (
        <Unavailable />
      )}
    </Card>
  );
}

function Spark({ data }: { data: { year: number; value: number }[] }) {
  if (data.length < 2) return null;
  const vals = data.map((d) => d.value),
    min = Math.min(...vals),
    max = Math.max(...vals),
    w = 160,
    h = 50;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / (max - min || 1)) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} className="h-14 w-full">
      <polyline points={pts} fill="none" stroke="var(--magenta)" strokeWidth="2" />
    </svg>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-xs leading-relaxed">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {t}
        </li>
      ))}
    </ul>
  );
}

function SnapshotPage() {
  const birth = useCurrentBirth();
  const year = birthDate(birth).getFullYear();
  const q = useQuery(birthYearQuery(year));

  return (
    <>
      <Topbar
        back
        title="Birth Year Snapshot"
        subtitle="A glimpse of the world in your birth year."
      />
      <div className="space-y-6 px-4 pb-10 sm:px-6">
        <Hero year={year} data={q.data} loading={q.isLoading} />
        {q.isError ? (
          <section className="snap-card flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
            <AlertTriangle className="h-8 w-8 text-warn" />
            <p className="font-semibold">We couldn't load the history for {year}.</p>
            <p className="text-sm text-muted-foreground">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => q.refetch()}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-cta px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </section>
        ) : !q.data ? (
          <Skeleton />
        ) : (
          <Body d={q.data} />
        )}
      </div>
    </>
  );
}

function Hero({
  year,
  data,
  loading,
}: {
  year: number;
  data?: BirthYearSnapshot;
  loading: boolean;
}) {
  const w = data?.world;
  const rows = [
    { i: Users, l: "World Population", v: fmtBig(w?.population ?? null) },
    { i: Landmark, l: "Global GDP", v: fmtBig(w?.gdp ?? null, "$") },
    { i: Wifi, l: "Internet Users", v: fmtBig(w?.internetUsers ?? null) },
    {
      i: HeartPulse,
      l: "Life Expectancy",
      v: w?.lifeExpectancy != null ? `${w.lifeExpectancy.toFixed(1)} Years` : null,
    },
  ];
  return (
    <section className="snap-hero relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <img
        src={earth}
        alt="Glowing Earth at night"
        width={1024}
        height={1024}
        className="pointer-events-none absolute left-[38%] top-1/2 hidden h-[130%] -translate-y-1/2 rounded-full object-cover opacity-90 mix-blend-screen md:block dark:opacity-100"
      />
      <div className="relative grid items-center gap-6 md:grid-cols-[1fr_minmax(0,300px)]">
        <div className="max-w-sm">
          <p className="text-lg font-medium">Your Birth Year</p>
          <p className="bg-gradient-brand bg-clip-text font-display text-7xl font-extrabold leading-tight text-transparent sm:text-8xl">
            {year}
          </p>
          <p className="mt-2 text-base">Here's what the world looked like when you were born.</p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-lg border bg-card/70 px-3 py-1.5 text-xs backdrop-blur">
            <Star className="h-4 w-4 fill-warn text-warn" />
            Sourced from World Bank & Wikipedia
          </span>
        </div>
        <div className="rounded-2xl border border-primary/40 bg-card/80 p-5 shadow-glow backdrop-blur">
          <h3 className="mb-4 font-semibold">In Numbers</h3>
          <ul className="space-y-4">
            {rows.map((r) => (
              <li key={r.l} className="flex items-center gap-3 text-sm">
                <r.i className="h-5 w-5 text-magenta" />
                <span className="flex-1 text-xs">{r.l}</span>
                <span className="font-semibold">
                  {loading ? (
                    <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
                  ) : (
                    (r.v ?? (
                      <span className="text-xs font-normal text-muted-foreground">Unavailable</span>
                    ))
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="snap-card h-56 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

function Body({ d }: { d: BirthYearSnapshot }) {
  const y = d.year;
  return (
    <>
      <h2 className="text-xl font-semibold">The World in {y}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Feature
          icon={Smartphone}
          title="Popular Phone"
          item={d.popularPhone}
          chip="Iconic release"
        />
        <Feature
          icon={Clapperboard}
          title="Popular Movie"
          item={d.popularMovie}
          chip="#1 Worldwide"
        />
        <Feature icon={Music} title="Top Song" item={d.topSong} chip="#1 on Billboard Year-End" />
        <Feature
          icon={Lightbulb}
          title="Popular Technology"
          item={d.popularTechnology}
          chip={`Launched in ${y}`}
        />
        <Feature
          icon={Car}
          title="Best Selling Car"
          item={d.bestSellingCar}
          chip="#1 in US sales"
        />

        <Card icon={Users} title="World Leaders">
          {d.worldLeaders.length ? (
            <Bullets items={d.worldLeaders.map((l) => `${l.name} (${l.role})`)} />
          ) : (
            <Unavailable />
          )}
        </Card>
        <Card icon={Trophy} title="Sports Champions">
          {d.sportsChampions.length ? (
            <ul className="space-y-3 text-xs">
              {d.sportsChampions.map((s) => (
                <li key={s.title} className="flex gap-2">
                  <Trophy className="h-4 w-4 shrink-0 text-warn" />
                  <div>
                    <div className="text-muted-foreground">{s.title}</div>
                    <div className="font-medium">{s.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Unavailable />
          )}
        </Card>
        <Card icon={Tv} title="Top TV Show">
          {d.topTVShow ? (
            <>
              {d.topTVShow.image && (
                <img
                  src={d.topTVShow.image}
                  alt={d.topTVShow.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="mb-3 h-28 w-full rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <Bullets items={[d.topTVShow.title]} />
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {d.topTVShow.sub}
              </p>
              <div className="mt-3 flex flex-1 items-end justify-center">
                <Chip>Nielsen #1</Chip>
              </div>
            </>
          ) : (
            <Unavailable />
          )}
        </Card>
        <Card icon={Rocket} title="Breakthroughs">
          {d.breakthroughs.length ? <Bullets items={d.breakthroughs} /> : <Unavailable />}
        </Card>
        <Card icon={LineChart} title="Economy Snapshot">
          {d.economy.current != null ? (
            <div className="rounded-xl border bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Global GDP Growth</p>
              <p className="text-2xl font-bold">{d.economy.current.toFixed(1)}%</p>
              <Spark data={d.economy.growth} />
              <p className="text-[10px] text-muted-foreground">
                {d.economy.growth[0]?.year}–{y}
              </p>
            </div>
          ) : (
            <Unavailable />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="snap-card relative overflow-hidden rounded-2xl p-5">
          <img
            src={indiaGate}
            alt="India Gate, New Delhi"
            loading="lazy"
            width={816}
            height={816}
            className="india-fade pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[45%] object-cover sm:block"
          />
          <h3 className="relative mb-4 flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden>🇮🇳</span>India in {y}
          </h3>
          {d.india || d.economy.indiaGrowth != null ? (
            <div className="relative sm:max-w-[58%]">
              <Bullets
                items={[
                  ...(d.india?.incumbents ?? []),
                  ...(d.economy.indiaGrowth != null
                    ? [`India's economy grew by ${d.economy.indiaGrowth.toFixed(1)}%`]
                    : []),
                  ...(d.india?.events ?? []),
                ].slice(0, 5)}
              />
            </div>
          ) : (
            <Unavailable />
          )}
        </section>
        <section className="snap-card relative overflow-hidden rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Star className="h-5 w-5 fill-warn text-warn" />
            Fun Fact
          </h3>
          <Quote className="h-8 w-8 fill-primary text-primary" />
          {d.funFact ? (
            <p className="relative z-10 mt-3 max-w-[75%] leading-relaxed">{d.funFact}</p>
          ) : (
            <Unavailable />
          )}
          <img
            src={earth}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-10 top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full object-cover opacity-80 mix-blend-multiply sm:block dark:mix-blend-screen"
          />
          <Sparkles className="absolute right-8 top-6 h-5 w-5 text-magenta" />
        </section>
      </div>

      <section className="snap-card rounded-2xl p-5">
        <h3 className="mb-6 text-lg font-semibold">
          {y} Timeline – <span className="text-primary">A Year to Remember</span>
        </h3>
        {d.timeline.length ? <Timeline items={d.timeline} /> : <Unavailable />}
      </section>
    </>
  );
}

function Timeline({ items }: { items: { month: string; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        aria-label="Earlier"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-card"
      >
        <Prev className="h-4 w-4" />
      </button>
      <div ref={ref} className="flex-1 overflow-x-auto pb-2 [scrollbar-width:none]">
        <ol className="relative flex min-w-max">
          <div className="absolute left-0 right-0 top-[7px] h-0.5 bg-gradient-brand opacity-60" />
          {items.map((t) => (
            <li key={t.month} className="relative w-40 px-2 text-center">
              <span className="mx-auto block h-4 w-4 rounded-full border-2 border-primary bg-primary/40 shadow-glow" />
              <p className="mt-3 font-semibold">{t.month}</p>
              <p className="mt-1 line-clamp-3 text-xs text-muted-foreground" title={t.text}>
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <button
        onClick={() => go(1)}
        aria-label="Later"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-card"
      >
        <Next className="h-4 w-4" />
      </button>
    </div>
  );
}
