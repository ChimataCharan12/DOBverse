import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CalendarPlus,
  Cake,
  Check,
  ChevronRight,
  CircleHelp,
  Clock,
  Download,
  Droplets,
  Footprints,
  GitCompare,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  MinusCircle,
  Moon,
  Pencil,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
  UserRound,
  Wind,
  X,
  Zap,
  CheckCircle2,
  BedDouble,
  Milestone,
  Star,
} from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel } from "@/components/app/ui";
import { AddBirthdayDialog } from "@/components/app/birthdays";
import {
  download,
  selfAsPerson,
  toICS,
  upsertBirthday,
  useBirthdays,
  type Person,
} from "@/lib/birthdays-store";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import {
  ageParts,
  birthDate,
  fmtDate,
  fmtTime,
  greeting,
  lifeStats,
  nextBirthday,
  short,
  weekday,
} from "@/lib/birth";
import { moonPhase, zodiac } from "@/lib/astro";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import heroImg from "@/assets/compare-hero.jpg";

export const Route = createFileRoute("/_dash/compare")({
  head: () => ({
    meta: [
      { title: "Compare Birthdays — DOBverse" },
      {
        name: "description",
        content:
          "Compare two life timelines: ages, zodiac, moon phases, milestones and life statistics.",
      },
      { property: "og:title", content: "Compare Birthdays — DOBverse" },
      {
        property: "og:description",
        content: "See how two birthdays, milestones and life stats differ over time.",
      },
    ],
  }),
  component: Compare,
});

const P2KEY = "dobverse.compare.p2";
const SAVEKEY = "dobverse.compare.saved";
const DAY = 86_400_000;
const TABS = [
  "Overview",
  "Life Stats",
  "Zodiac & Moon",
  "Timeline",
  "Milestones",
  "Fun Facts",
  "Analytics",
] as const;
type TabT = (typeof TABS)[number];

function diffYMD(a: Date, b: Date) {
  const [o, y] = a < b ? [a, b] : [b, a];
  return { ...ageParts(o, y), totalDays: Math.round(Math.abs(b.getTime() - a.getTime()) / DAY) };
}

function Compare() {
  const birth = useCurrentBirth();
  const now = useNow(1000) ?? new Date();
  const saved = useBirthdays();
  const me = selfAsPerson(birth);
  const people: Person[] = [...(birth.dob ? [me] : []), ...saved];
  const [ids, setIds] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });
  const [editing, setEditing] = useState<"a" | "b" | "new" | null>(null);
  const [tab, setTab] = useState<TabT>("Overview");
  const [help, setHelp] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(P2KEY);
      if (r) {
        const v = JSON.parse(r);
        if (v && typeof v === "object" && "a" in v) setIds(v);
      }
    } catch {
      /* ignore */
    }
  }, []);
  const saveIds = (next: { a: string | null; b: string | null }) => {
    setIds(next);
    localStorage.setItem(P2KEY, JSON.stringify(next));
  };
  const find = (id: string | null) => (id ? (people.find((p) => p.id === id) ?? null) : null);
  const A = find(ids.a ?? (birth.dob ? "self" : null));
  const B = find(ids.b);
  const saveP2 = (p: Person | null) => saveIds({ ...ids, b: p?.id ?? null });
  const show = (t: TabT) => tab === "Overview" || tab === t;
  const pick = (slot: "a" | "b", label: string, current: Person | null) => (
    <Panel className="grid gap-3">
      <div className="font-semibold">{label}</div>
      {people.length > 0 ? (
        <Select value={current?.id ?? ""} onValueChange={(id) => saveIds({ ...ids, [slot]: id })}>
          <SelectTrigger>
            <SelectValue placeholder="Pick from your saved birthdays" />
          </SelectTrigger>
          <SelectContent>
            {people.map((s) => (
              <SelectItem key={s.id} value={s.id} disabled={(slot === "a" ? B : A)?.id === s.id}>
                {s.id === "self" ? `${s.name} (You)` : s.name} — {s.dob}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm text-muted-foreground">
          No saved people yet. Add someone to start comparing.
        </p>
      )}
      <button
        onClick={() => {
          setNewSlot(slot);
          setEditing("new");
        }}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-cta py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="h-4 w-4" />
        Add a person
      </button>
    </Panel>
  );
  const [newSlot, setNewSlot] = useState<"a" | "b">("b");
  const editTarget = editing === "a" ? A : editing === "b" ? B : null;

  return (
    <>
      <Topbar
        greeting
        title={`${greeting(now).replace("!", "")}, ${birth.name || "Friend"}!`}
        subtitle="Every second of your life has a story."
      />
      <div className="grid gap-5 px-4 pb-8 sm:px-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-w-0 content-start gap-5">
          <section className="relative min-h-[200px] sm:min-h-[230px] md:min-h-[250px] overflow-hidden rounded-2xl bg-cosmic text-cosmic-foreground shadow-soft">
            <img
              src={heroImg}
              alt="Cosmic comparison of life timelines and planetary alignments"
              width={1536}
              height={512}
              className="absolute inset-0 h-full w-full object-cover object-[80%_center] sm:object-right opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/40 to-transparent" />
            <div className="relative p-6 sm:p-8">
              <h2 className="text-3xl font-bold">Compare Two Life Timelines</h2>
              <p className="mt-2 max-w-sm text-cosmic-foreground/90">
                See how birthdays, milestones and life statistics differ over time.
              </p>
            </div>
          </section>

          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            {A ? (
              <PersonCard
                p={A}
                tone="primary"
                label="Person A"
                onEdit={() => (A.id === "self" ? saveIds({ ...ids, a: "" }) : setEditing("a"))}
              />
            ) : (
              pick("a", "Choose Person A", A)
            )}
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-cta text-2xl font-bold text-primary-foreground shadow-glow ring-8 ring-primary/15">
              VS
            </div>
            {B ? (
              <PersonCard
                p={B}
                tone="magenta"
                label="Person B"
                onEdit={() => (B.id === "self" ? saveP2(null) : setEditing("b"))}
              />
            ) : (
              pick("b", "Choose Person B", B)
            )}
          </div>
          {(A || B) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {A && (
                <button
                  onClick={() => saveIds({ ...ids, a: "" })}
                  className="rounded-lg border px-3 py-1.5 font-medium text-primary"
                >
                  Change Person A
                </button>
              )}
              {B && (
                <button
                  onClick={() => saveP2(null)}
                  className="rounded-lg border px-3 py-1.5 font-medium text-magenta"
                >
                  Change Person B
                </button>
              )}
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto border-b">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {A && B ? (
            <Sections A={A} B={B} now={now} show={show} />
          ) : (
            <Panel className="py-12 text-center text-muted-foreground">
              {people.length < 2
                ? "Save at least two people (or your own birth details plus one person) to compare."
                : "Select two people to see the full comparison."}
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHelp(true)}
              className="flex items-center justify-center gap-2 rounded-xl border bg-card py-2.5 text-sm font-semibold"
            >
              <CircleHelp className="h-4 w-4" />
              How it works
            </button>
            <button
              onClick={() => {
                saveIds({ a: null, b: null });
                setTab("Overview");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-card py-2.5 text-sm font-semibold text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
          {A && B && <Summary A={A} B={B} />}
          <Panel>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
            <div className="grid gap-2">
              {[
                { i: Download, t: "Download Report", d: "Save as PDF", f: () => window.print() },
                {
                  i: Share2,
                  t: "Share Comparison",
                  d: "Share with loved ones",
                  f: () => {
                    if (!A || !B) return;
                    const d = diffYMD(birthDate(A), birthDate(B));
                    const text = `${A.name} vs ${B.name}: ${d.years}y ${d.months}m ${d.days}d apart (${d.totalDays} days) — via DOBverse`;
                    if (navigator.share) navigator.share({ text }).catch(() => {});
                    else {
                      navigator.clipboard?.writeText(text);
                      toast.success("Copied to clipboard");
                    }
                  },
                },
                {
                  i: Save,
                  t: "Save Comparison",
                  d: "Save for later",
                  f: () => {
                    if (!A || !B) return;
                    let all: unknown[] = [];
                    try {
                      const raw = localStorage.getItem(SAVEKEY);
                      const parsed = raw ? JSON.parse(raw) : [];
                      if (Array.isArray(parsed)) all = parsed;
                    } catch {
                      all = [];
                    }
                    localStorage.setItem(
                      SAVEKEY,
                      JSON.stringify([...all, { a: A.id, b: B.id, at: Date.now() }]),
                    );
                    toast.success("Comparison saved");
                  },
                },
                {
                  i: CalendarPlus,
                  t: "Add to Calendar",
                  d: "Add both birthdays",
                  f: () => {
                    if (!A || !B) return;
                    download("dobverse-compare.ics", toICS([A, B]), "text/calendar");
                  },
                },
              ].map((a) => (
                <button
                  key={a.t}
                  onClick={a.f}
                  disabled={!A || !B}
                  className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-accent/50 disabled:opacity-50"
                >
                  <a.i className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              <button
                onClick={() => {
                  setNewSlot("b");
                  setEditing("new");
                }}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-cta py-3 font-semibold text-primary-foreground shadow-glow"
              >
                <Plus className="h-4 w-4" />
                Add a Person
              </button>
            </div>
          </Panel>
        </div>
      </div>
      <AddBirthdayDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        showDetails
        title={editing === "new" ? "Add a person" : `Edit ${editTarget?.name ?? "person"}`}
        initial={editTarget ?? undefined}
        onSaved={(p) => {
          upsertBirthday(p);
          if (editing === "new") saveIds({ ...ids, [newSlot]: p.id });
        }}
      />
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How it works</DialogTitle>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Your details come from your DOBverse profile.</li>
            <li>Pick Person 2 from saved birthdays or enter their details.</li>
            <li>Browse tabs to compare ages, stats, zodiac, moon phases and timelines.</li>
            <li>Share, save, print or add both birthdays to your calendar.</li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PersonCard({
  p,
  tone,
  label,
  onEdit,
}: {
  p: Person;
  tone: "primary" | "magenta";
  label?: string;
  onEdit: () => void;
}) {
  const t = tone === "primary" ? "bg-primary/10 text-primary" : "bg-magenta/10 text-magenta";
  const tb =
    tone === "primary" ? "border-primary/40 text-primary" : "border-magenta/40 text-magenta";
  return (
    <Panel className="flex items-center gap-4">
      <div className={cn("grid h-20 w-20 shrink-0 place-items-center rounded-full", t)}>
        <UserRound className="h-10 w-10 fill-current" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xl font-bold">{p.id === "self" ? "You" : p.name}</span>
          {label && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {label}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {fmtDate(birthDate(p))}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {fmtTime(p)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {[p.city, p.country].filter(Boolean).join(", ") || "Place not set"}
          </span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className={cn(
          "flex items-center gap-1.5 self-end rounded-lg border px-3 py-1.5 text-sm",
          tb,
        )}
      >
        <Pencil className="h-3.5 w-3.5" />
        {p.id === "self" ? "Change" : "Edit"}
      </button>
    </Panel>
  );
}

function facts(A: Person, B: Person) {
  const a = birthDate(A),
    b = birthDate(B);
  const za = zodiac(a),
    zb = zodiac(b),
    ma = moonPhase(a),
    mb = moonPhase(b);
  const same = (x: unknown, y: unknown) => !!x && !!y && x === y;
  return [
    {
      k: "Same Birth Month?",
      ok: a.getMonth() === b.getMonth(),
      yes: `Same Birth Month (${a.toLocaleString("en", { month: "long" })})`,
      no: "Different Birth Month",
    },
    {
      k: "Same Birth Day?",
      ok: a.getDate() === b.getDate(),
      yes: `Same Birth Day (${a.getDate()})`,
      no: `Different Birth Day (${a.getDate()} vs ${b.getDate()})`,
    },
    {
      k: "Same Birth Year?",
      ok: a.getFullYear() === b.getFullYear(),
      yes: "Same Birth Year",
      no: `Different Birth Year (${a.getFullYear()} vs ${b.getFullYear()})`,
    },
    {
      k: "Same Weekday?",
      ok: a.getDay() === b.getDay(),
      yes: `Born on ${weekday(a)}`,
      no: "Different Weekday",
    },
    {
      k: "Same Zodiac Sign?",
      ok: za.name === zb.name,
      yes: `Same Zodiac Sign (${za.name})`,
      no: "Different Zodiac Sign",
    },
    {
      k: "Same Moon Phase?",
      ok: ma.name === mb.name,
      yes: `Same Moon Phase (${ma.name})`,
      no: "Different Moon Phase",
    },
    {
      k: "Same Country?",
      ok: same(A.country?.toLowerCase(), B.country?.toLowerCase()),
      yes: `Both born in ${A.country}`,
      no: "Different Country of Birth",
    },
    {
      k: "Same City?",
      ok: same(A.city?.toLowerCase(), B.city?.toLowerCase()),
      yes: `Both born in ${A.city}`,
      no: "Different Place of Birth (City)",
    },
  ];
}

function Summary({ A, B }: { A: Person; B: Person }) {
  const a = birthDate(A),
    b = birthDate(B),
    d = diffYMD(a, b);
  const f = facts(A, B);
  const older =
    a.getTime() === b.getTime() ? "Same age" : a < b ? (A.id === "self" ? "You" : A.name) : B.name;
  return (
    <Panel>
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <GitCompare className="h-5 w-5 text-primary" />
        Comparison Summary
      </h3>
      <div className="text-xs text-muted-foreground">Age Difference</div>
      <div className="text-primary">
        <b className="text-2xl">{d.years}</b> Year{d.years !== 1 ? "s" : ""}{" "}
        <b className="text-2xl">{d.months}</b> Month{d.months !== 1 ? "s" : ""}{" "}
        <b className="text-2xl">{d.days}</b> Day{d.days !== 1 ? "s" : ""}
      </div>
      <div className="text-xs text-muted-foreground">({d.totalDays.toLocaleString()} Days)</div>
      <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">Older Person</div>
      <div className="flex items-center gap-2 font-semibold text-primary">
        <UserRound className="h-4 w-4" />
        {older}
      </div>
      <div className="mt-3 border-t pt-3 text-sm font-semibold text-success">Shared Facts</div>
      {f
        .filter((x) => x.ok)
        .map((x) => (
          <div key={x.k} className="flex items-center gap-2 py-0.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {x.yes}
          </div>
        ))}
      {!f.some((x) => x.ok) && <p className="text-xs text-muted-foreground">No shared facts.</p>}
      <div className="mt-3 text-sm font-semibold text-destructive">Different Facts</div>
      {f
        .filter((x) => !x.ok)
        .map((x) => (
          <div key={x.k} className="flex items-center gap-2 py-0.5 text-sm">
            <MinusCircle className="h-4 w-4 text-destructive" />
            {x.no}
          </div>
        ))}
    </Panel>
  );
}

function Sections({
  A,
  B,
  now,
  show,
}: {
  A: Person;
  B: Person;
  now: Date;
  show: (t: TabT) => boolean;
}) {
  const a = birthDate(A),
    b = birthDate(B);
  const aa = ageParts(a, now),
    ab = ageParts(b, now),
    d = diffYMD(a, b);
  const na = nextBirthday(a, now),
    nb = nextBirthday(b, now);
  const sa = lifeStats(a, now),
    sb = lifeStats(b, now);
  const za = zodiac(a),
    zb = zodiac(b),
    ma = moonPhase(a),
    mb = moonPhase(b);
  const f = facts(A, B);
  const aName = A.id === "self" ? "You" : A.name;
  const olderTxt =
    a < b
      ? `${aName === "You" ? "You are" : aName + " is"} older`
      : a > b
        ? `${B.name} is older`
        : "Same age";
  const gap = Math.abs(na.daysLeft - nb.daysLeft);
  const stats: [string, typeof Heart, number, number][] = [
    ["Heartbeats", Heart, sa.heartbeats, sb.heartbeats],
    ["Breaths", Wind, sa.breaths, sb.breaths],
    ["Hours Slept", BedDouble, sa.hoursSlept, sb.hoursSlept],
    ["Cups of Water", Droplets, sa.water * 4, sb.water * 4],
    ["Steps Walked", Footprints, sa.steps, sb.steps],
    ["Words Spoken", MessageCircle, sa.days * 16000, sb.days * 16000],
  ];
  const steps = [0, 1, 5, 10, 15, 20];
  const Timeline = ({ p, d0, tone, next }: { p: string; d0: Date; tone: string; next: Date }) => (
    <div>
      <div className={cn("mb-2 text-sm font-semibold", tone)}>{p}</div>
      <div className="relative grid grid-cols-7 text-center text-[11px]">
        <div
          className={cn(
            "absolute left-[7%] right-[7%] top-1.5 h-0.5 opacity-40",
            tone === "text-primary" ? "bg-primary" : "bg-magenta",
          )}
        />
        {[
          ...steps.map((y) => ({
            l: y === 0 ? "Born" : `${y} Year${y > 1 ? "s" : ""}`,
            d: new Date(d0.getFullYear() + y, d0.getMonth(), d0.getDate()),
          })),
          { l: "Next Birthday", d: next },
        ].map((x) => (
          <div key={x.l} className="relative grid justify-items-center gap-1">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                tone === "text-primary" ? "bg-primary" : "bg-magenta",
                x.d > now && x.l !== "Next Birthday" && "opacity-30",
              )}
            />
            <span className="text-muted-foreground">{x.l}</span>
            <span className="font-medium">
              {x.l === "Born" || x.l === "Next Birthday" ? fmtDate(x.d) : x.d.getFullYear()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {(show("Life Stats") || show("Analytics") || show("Milestones")) && (
        <div className="grid gap-5 lg:grid-cols-3">
          {show("Milestones") && (
            <Panel>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Age Comparison <span className="text-xs font-normal">(Live)</span>
              </h3>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-center">
                <div className="text-primary">
                  <Age v={aa.years} l="Years" />
                  <Age v={aa.months} l="Months" />
                  <Age v={aa.days} l="Days" />
                </div>
                <div className="border-x px-2">
                  <div className="text-xs">Age Difference</div>
                  <div className="my-2 text-primary">
                    <b className="text-xl">{d.years}</b> Year{d.years !== 1 ? "s" : ""}{" "}
                    <b className="text-xl">{d.months}</b> Month{d.months !== 1 ? "s" : ""}{" "}
                    <b className="text-xl">{d.days}</b> Day{d.days !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    {d.totalDays.toLocaleString()} Days Difference
                  </div>
                </div>
                <div className="text-magenta">
                  <Age v={ab.years} l="Years" />
                  <Age v={ab.months} l="Months" />
                  <Age v={ab.days} l="Days" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 border-t pt-3 text-sm font-semibold">
                <UserRound className="h-4 w-4 text-primary" />
                {olderTxt}
              </div>
            </Panel>
          )}
          {show("Milestones") && (
            <Panel>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <CalendarDays className="h-4 w-4 text-primary" />
                Next Birthday Countdown
              </h3>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center">
                <div>
                  <div className="text-4xl font-bold text-primary">{na.daysLeft}</div>
                  <div className="text-xs text-muted-foreground">Days Left</div>
                  <div className="mt-3 text-xs">
                    {fmtDate(na.date)}
                    <br />
                    {weekday(na.date)}
                  </div>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10">
                  <Cake className="h-9 w-9 text-primary" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-magenta">{nb.daysLeft}</div>
                  <div className="text-xs text-muted-foreground">Days Left</div>
                  <div className="mt-3 text-xs">
                    {fmtDate(nb.date)}
                    <br />
                    {weekday(nb.date)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-accent/60 py-1.5 text-xs text-primary">
                <Info className="h-3.5 w-3.5" />
                {gap === 0
                  ? "Your birthdays are on the same day!"
                  : `${na.daysLeft < nb.daysLeft ? aName + "'s" : B.name + "'s"} birthday comes ${gap} days earlier`}
              </div>
            </Panel>
          )}
          {show("Analytics") && (
            <Panel>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <BarChart3 className="h-4 w-4 text-primary" />
                Comparison Analytics
              </h3>
              <div className="grid gap-1.5 text-xs">
                <Line k="Days Difference" v={<b>{d.totalDays.toLocaleString()} Days</b>} />
                <Line
                  k="Who is Older?"
                  v={<span className="text-primary">{a <= b ? aName : B.name}</span>}
                />
                {f.slice(0, 6).map((x) => (
                  <Line
                    key={x.k}
                    k={x.k}
                    v={
                      x.ok ? (
                        <span className="flex items-center gap-1 text-success">
                          <Check className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive">
                          <X className="h-3.5 w-3.5" />
                          No
                        </span>
                      )
                    }
                  />
                ))}
              </div>
            </Panel>
          )}
          {show("Life Stats") && (
            <Panel className={cn(show("Milestones") && "lg:col-span-1")}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <UserRound className="h-4 w-4 text-primary" />
                Life Statistics Comparison
              </h3>
              <div className="grid gap-2.5">
                {stats.map(([l, I, x, y]) => {
                  const m = Math.max(x, y) || 1;
                  return (
                    <div
                      key={l}
                      className="grid grid-cols-[3rem_1fr_auto_1fr_3rem] items-center gap-2 text-xs"
                    >
                      <b>{short(x)}</b>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="ml-auto h-full rounded-full bg-primary"
                          style={{ width: `${(x / m) * 100}%` }}
                        />
                      </div>
                      <span className="flex w-24 items-center gap-1 text-[11px]">
                        <I className="h-3.5 w-3.5 text-magenta" />
                        {l}
                      </span>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-magenta"
                          style={{ width: `${(y / m) * 100}%` }}
                        />
                      </div>
                      <b className="text-right">{short(y)}</b>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>
      )}
      {show("Zodiac & Moon") && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Moon className="h-4 w-4 text-primary" />
              Zodiac & Moon Comparison
            </h3>
            <div className="grid grid-cols-3 items-center gap-2 text-center">
              <Sign z={za} tone="bg-primary" />
              <div className="rounded-xl border p-3 text-xs">
                <div>Element</div>
                <b>{za.el === zb.el ? za.el : `${za.el} / ${zb.el}`}</b>
                <div className="mt-2">Ruling Planet</div>
                <b>{za.ruler === zb.ruler ? za.ruler : `${za.ruler} / ${zb.ruler}`}</b>
              </div>
              <Sign z={zb} tone="bg-magenta" />
            </div>
            <div className="mt-3 rounded-lg bg-accent/60 py-1.5 text-center text-xs text-primary">
              {za.name === zb.name
                ? `Both of you are ${za.name}! You share the same zodiac sign.`
                : `${za.name} meets ${zb.name} — a ${za.el === zb.el ? "harmonious" : "complementary"} pairing.`}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Moon className="h-4 w-4 text-primary" />
              Moon Phase Comparison
            </h3>
            <div className="grid grid-cols-3 items-center gap-2 text-center">
              <div>
                <div className="text-5xl">{ma.icon}</div>
                <div className="mt-1 text-sm font-semibold">{ma.name}</div>
              </div>
              <div className="rounded-xl border p-3 text-xs">
                Illumination
                <div className="text-xl font-bold text-primary">
                  {ma.illum}% / {mb.illum}%
                </div>
              </div>
              <div>
                <div className="text-5xl">{mb.icon}</div>
                <div className="mt-1 text-sm font-semibold">{mb.name}</div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-accent/60 py-1.5 text-center text-xs text-primary">
              {ma.name === mb.name
                ? "Born under the same moon phase."
                : "Different moon phases shape different energies."}
            </div>
          </Panel>
        </div>
      )}
      {(show("Timeline") || show("Fun Facts")) && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1.3fr)]">
          {show("Timeline") && (
            <Panel className={cn("grid gap-6", !show("Fun Facts") && "lg:col-span-3")}>
              <h3 className="flex items-center gap-2 font-semibold">
                <Milestone className="h-4 w-4 text-primary" />
                Timeline Comparison
              </h3>
              <Timeline p={aName} d0={a} tone="text-primary" next={na.date} />
              <Timeline p={B.name} d0={b} tone="text-magenta" next={nb.date} />
            </Panel>
          )}
          {show("Fun Facts") && (
            <>
              <Panel className={cn(!show("Timeline") && "lg:col-span-1")}>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-success">
                  <Sparkles className="h-4 w-4" />
                  Similarities
                </h3>
                {f
                  .filter((x) => x.ok)
                  .map((x) => (
                    <div key={x.k} className="flex items-center gap-2 py-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {x.yes}
                    </div>
                  ))}
                {!f.some((x) => x.ok) && (
                  <p className="text-sm text-muted-foreground">Totally unique pair!</p>
                )}
              </Panel>
              <Panel>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-destructive">
                  <Star className="h-4 w-4" />
                  Differences
                </h3>
                {a.getTime() !== b.getTime() && (
                  <div className="flex items-center gap-2 py-1.5 text-sm">
                    <MinusCircle className="h-4 w-4 text-destructive" />
                    {olderTxt} by {d.years}y {d.months}m {d.days}d
                  </div>
                )}
                {f
                  .filter((x) => !x.ok)
                  .map((x) => (
                    <div key={x.k} className="flex items-center gap-2 py-1.5 text-sm">
                      <MinusCircle className="h-4 w-4 text-destructive" />
                      {x.no}
                    </div>
                  ))}
              </Panel>
            </>
          )}
        </div>
      )}
    </>
  );
}

const Age = ({ v, l }: { v: number; l: string }) => (
  <div className="mb-1">
    <div className="text-2xl font-bold leading-none">{v}</div>
    <div className="text-[10px] text-muted-foreground">{l}</div>
  </div>
);
const Line = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
    <span>{k}</span>
    <span className="border-b border-dashed" />
    <span>{v}</span>
  </div>
);
const Sign = ({ z, tone }: { z: ReturnType<typeof zodiac>; tone: string }) => (
  <div className="grid justify-items-center gap-1">
    <div
      className={cn(
        "grid h-16 w-16 place-items-center rounded-full text-3xl text-primary-foreground",
        tone,
      )}
    >
      {z.sym}
    </div>
    <div className="text-sm font-semibold">{z.name}</div>
    <div className="text-[11px] text-muted-foreground">Sun Sign</div>
  </div>
);
