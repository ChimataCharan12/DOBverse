import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Gift,
  Heart,
  Hourglass,
  Image as ImageIcon,
  Lock,
  Moon,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Globe2,
  Wand2,
  Download,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { usePWAInstall } from "@/lib/pwa";
import { toast } from "sonner";
import heroImg from "@/assets/about-hero.jpg";
import mascot from "@/assets/about-mascot.png";
import cake from "@/assets/about-cake.png";

export const Route = createFileRoute("/_dash/about")({
  head: () => ({
    meta: [
      { title: "About DOBverse — Discover Your Birth Story" },
      {
        name: "description",
        content:
          "DOBverse turns your date of birth into meaningful insights, beautiful moments and lasting memories.",
      },
      { property: "og:title", content: "About DOBverse — Discover Your Birth Story" },
      {
        property: "og:description",
        content: "Every birth has a story. DOBverse helps you discover yours.",
      },
    ],
  }),
  component: About,
});

const HELPS = [
  [Gift, "Discover amazing facts about your birth"],
  [ImageIcon, "Create beautiful birthday cards"],
  [CalendarDays, "Track and remember special days"],
  [Bell, "Get reminders so you never forget"],
  [Users, "Compare birthdays with friends & family"],
  [Moon, "Explore milestones, moon phases & more"],
] as const;
const SPECIAL = [
  [
    Globe2,
    "Personalized Insights",
    "Get detailed, accurate insights based on your birth details.",
    "bg-primary/10 text-primary",
  ],
  [
    Gift,
    "Beautiful Experiences",
    "Enjoy stunning visuals, celebrations and meaningful moments.",
    "bg-magenta/10 text-magenta",
  ],
  [Bell, "Smart Reminders", "Never miss an important birthday again.", "bg-warn/15 text-warn"],
  [
    ShieldCheck,
    "Privacy First",
    "Your data is safe, secure and never shared.",
    "bg-info/10 text-info",
  ],
  [
    Heart,
    "Made for Everyone",
    "For you, your family, your friends and your beautiful connections.",
    "bg-destructive/10 text-destructive",
  ],
  [
    Rocket,
    "Always Improving",
    "We keep adding new features to make your experience better.",
    "bg-success/15 text-success",
  ],
] as const;
const ORBIT = [
  [Hourglass, "Time", "left-[48%] top-[2%]"],
  [Heart, "Memories", "left-[12%] top-[28%]"],
  [Star, "Destiny", "right-[6%] top-[34%]"],
  [Users, "Connections", "left-[22%] top-[58%]"],
  [Search, "Discoveries", "right-[16%] top-[62%]"],
] as const;

function About() {
  const router = useRouter();
  const { canInstall, promptInstall } = usePWAInstall();
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          onClick={() => router.history.back()}
          className="grid h-11 w-11 place-items-center rounded-full border bg-card"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-center text-xl font-semibold">About DOBverse</h1>
        <span className="hidden items-center gap-1.5 rounded-xl border bg-card px-4 py-2 text-sm text-primary sm:flex">
          <Heart className="h-4 w-4 fill-primary" />
          Made with <Heart className="h-4 w-4 fill-primary" /> for you
        </span>
      </header>

      <section className="grid items-center gap-6 lg:grid-cols-2">
        <div>
          <div className="origin-left scale-125">
            <Logo />
          </div>
          <p className="mt-8 text-lg leading-relaxed">
            DOBverse is more than a date calculator. It's your personal universe of time, discovery,
            and meaningful connections.
          </p>
          <p className="mt-4 text-lg font-medium text-primary">
            Every birth has a story. We help you discover yours. ✨
          </p>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="A person stepping through a glowing door into a cosmic universe"
            width={1280}
            height={832}
            className="hero-fade w-full"
          />
          {ORBIT.map(([I, l, pos]) => (
            <div key={l} className={`absolute grid justify-items-center gap-1 ${pos}`}>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-card/90 text-primary shadow-glow animate-floaty">
                <I className="h-6 w-6" />
              </div>
              <span className="rounded bg-card/70 px-1.5 text-xs font-medium">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border bg-card p-6 shadow-soft lg:grid-cols-[1fr_2fr] lg:divide-x">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="h-5 w-5 text-primary" />
            Our Mission
          </h2>
          <p className="mt-4 text-muted-foreground">
            To turn your date of birth into meaningful insights, beautiful moments and lasting
            memories.
          </p>
          <p className="mt-6 text-muted-foreground">
            We believe every life is unique and every date holds a{" "}
            <span className="text-primary">universe of possibilities.</span>
          </p>
        </div>
        <div className="lg:pl-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary">
            <Star className="h-5 w-5 fill-primary" />
            What DOBverse Helps You Do
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {HELPS.map(([I, t]) => (
              <div key={t} className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border text-primary">
                  <I className="h-5 w-5" />
                </div>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-center text-2xl font-semibold text-primary">
          ✦ What Makes DOBverse Special? ✦
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SPECIAL.map(([I, t, d, c]) => (
            <div key={t} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
              <div className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl ${c}`}>
                <I className="h-10 w-10" />
              </div>
              <div className="mt-4 font-semibold">{t}</div>
              <p className="mt-2 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-soft">
          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Built With Trust & Care
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We care about your trust. That's why we follow the highest standards to keep your data
            safe and your experience smooth.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x">
            {[
              [Lock, "100%", "Private & Secure"],
              [ShieldCheck, "0", "Data Shared With Anyone"],
              [Sparkles, "1.0", "Current Version"],
              [Star, "Free", "For Everyone"],
            ].map(([I, v, l]) => {
              const Ic = I as typeof Lock;
              return (
                <div key={l as string}>
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
                    <Ic className="h-6 w-6" />
                    {v as string}
                  </div>
                  <div className="mt-1 text-sm">{l as string}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Lock />
            </div>
            <h3 className="text-lg font-semibold">Your Data, Your Control</h3>
          </div>
          <ul className="mt-4 grid gap-2 text-sm">
            {[
              "Stored locally on your device",
              "Never uploaded to any server",
              "You can delete anytime",
              "You are always in control",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative grid items-center gap-4 overflow-hidden rounded-2xl bg-accent/60 p-6 sm:grid-cols-[160px_1fr_160px]">
        <img
          src={mascot}
          alt="DOBverse wizard mascot"
          width={816}
          height={816}
          loading="lazy"
          className="mx-auto w-32 sm:w-40"
        />
        <div className="text-center">
          <p className="text-2xl">“Every birth is a beginning of a beautiful story.</p>
          <p className="mt-2 text-2xl">
            Let <span className="font-semibold text-primary">DOBverse</span> help you celebrate it.
            💜
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-cta px-8 py-3 font-semibold text-primary-foreground shadow-glow"
            >
              <Wand2 className="h-4 w-4" />
              Start Exploring
              <ChevronRight className="h-4 w-4" />
            </Link>
            {canInstall && (
              <button
                onClick={async () => {
                  const ok = await promptInstall();
                  if (ok) toast.success("DOBverse installed successfully!");
                }}
                className="inline-flex items-center gap-2 rounded-xl border bg-card px-6 py-3 font-semibold text-primary hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            )}
          </div>
        </div>
        <img
          src={cake}
          alt="Birthday cake"
          width={816}
          height={816}
          loading="lazy"
          className="mx-auto w-32 sm:w-40"
        />
      </section>

      <footer className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <Heart className="h-4 w-4 fill-primary text-primary" />
        Thank you for choosing DOBverse. We're happy to be part of your journey.
        <span className="hidden sm:inline">|</span>
        <span className="text-primary">Team DOBverse 💜</span>
      </footer>
    </div>
  );
}
