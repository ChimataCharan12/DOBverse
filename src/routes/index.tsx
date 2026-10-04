import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Home,
  Sparkles,
  ShieldCheck,
  UserRound,
  Lock,
  Zap,
  User,
  CalendarDays,
  Clock,
  Globe,
  Building2,
  ArrowRight,
  Timer,
  HeartPulse,
  Globe2,
  Users,
  Bell,
  Gift,
  Heart,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import heroClock from "@/assets/hero-clock.jpg";
import { Logo } from "@/components/brand";
import { Splash } from "@/components/Splash";
import { saveBirth, useBirth, useTheme } from "@/lib/birth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOBverse — Every Birthday Tells a Story" },
      {
        name: "description",
        content:
          "Enter your date of birth and discover live age, life statistics, milestones and your personal life timeline.",
      },
      { property: "og:title", content: "DOBverse — Every Birthday Tells a Story" },
      {
        property: "og:description",
        content: "Discover your birth story: live age, life stats, milestones and timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Brazil",
  "Japan",
  "Singapore",
  "United Arab Emirates",
  "South Africa",
  "Nigeria",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Other",
];

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    t: "Accurate",
    d: "Live age to\nthe second",
    c: "bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 dark:border dark:border-purple-500/30",
  },
  {
    icon: UserRound,
    t: "Personalized",
    d: "Insights just\nfor you",
    c: "bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-400 dark:border dark:border-pink-500/30",
  },
  {
    icon: Lock,
    t: "Private",
    d: "100% local.\nNo sign up.",
    c: "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 dark:border dark:border-blue-500/30",
  },
  {
    icon: Zap,
    t: "Fast",
    d: "Instant results\nin a flash",
    c: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 dark:border dark:border-amber-500/30",
  },
];

const FEATURES = [
  {
    icon: Timer,
    t: "Age & Countdown",
    d: "Exact age & next birthday countdown",
    to: "/countdown",
    c: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60",
  },
  {
    icon: HeartPulse,
    t: "Life Statistics",
    d: "Heartbeats, breaths, sleep & more",
    to: "/statistics",
    c: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60",
  },
  {
    icon: Globe2,
    t: "Birth Year Snapshot",
    d: "World population, leaders & timeline",
    to: "/snapshot",
    c: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60",
  },
  {
    icon: Users,
    t: "Compare Birthdays",
    d: "Compare ages, milestones & timelines",
    to: "/compare",
    c: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60",
  },
  {
    icon: Bell,
    t: "Birthday Reminders",
    d: "Smart reminders so you never forget",
    to: "/reminders",
    c: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60",
  },
  {
    icon: Gift,
    t: "And Much More",
    d: "Fun facts, timeline, cards & sharing",
    to: "/card",
    c: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60",
  },
];

function Landing() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("dobverse.splash")) setSplash(false);
  }, []);
  const done = () => {
    sessionStorage.setItem("dobverse.splash", "1");
    setSplash(false);
  };
  if (splash) return <Splash onDone={done} />;
  return <LandingPage />;
}

function LandingPage() {
  const navigate = useNavigate();
  const birth = useBirth();
  const { dark, toggle } = useTheme();
  const [form, setForm] = useState({ name: "", dob: "", time: "", country: "", city: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (birth)
      setForm({
        name: birth.name || "",
        dob: birth.dob,
        time: birth.time || "",
        country: birth.country || "",
        city: birth.city || "",
      });
  }, [birth]);

  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.dob) return setError("Please enter your date of birth.");
    if (form.dob > today) return setError("Date of birth can't be in the future.");
    if (form.dob < "1900-01-01") return setError("Please enter a date after 1900.");
    setError("");
    saveBirth({
      name: form.name.trim() || undefined,
      dob: form.dob,
      time: form.time || undefined,
      country: form.country || undefined,
      city: form.city.trim() || undefined,
    });
    navigate({ to: "/reveal" });
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const field =
    "flex h-11 items-center gap-2.5 rounded-xl border border-input bg-background/80 px-3 text-xs sm:text-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f8f7ff] via-[#ffffff] to-[#f4f2ff] text-foreground dark:from-[#090417] dark:via-[#0e0826] dark:to-[#070314]">
      {/* Integrated Cosmic Hero Artwork (Right Side Panoramic Atmosphere) */}
      <div className="pointer-events-none absolute right-0 top-0 h-[460px] w-full max-w-[720px] overflow-hidden sm:h-[500px] lg:h-[540px] xl:max-w-[820px] hidden md:block">
        <img
          src={heroClock}
          alt="Cosmic clock and glowing pathway"
          width={1280}
          height={768}
          className="h-full w-full object-cover object-center hero-cosmic-bg opacity-95 transition-opacity dark:opacity-100"
        />
      </div>

      {/* Top Navigation Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Logo />

          {/* Center Navigation Bar */}
          <nav className="hidden items-center gap-1 rounded-full text-sm font-medium lg:flex">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 font-semibold text-primary dark:bg-primary/25"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <a
              href="#features"
              onClick={scrollToFeatures}
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              Features
            </a>
            <Link
              to="/compare"
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              Compare
            </Link>
            <Link
              to="/reminders"
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              Reminders
            </Link>
            <Link
              to="/calendar"
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              Calendar
            </Link>
            <Link
              to="/statistics"
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              Analytics
            </Link>
            <Link
              to="/about"
              className="rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-primary"
            >
              About
            </Link>
          </nav>

          {/* Right Theme & Profile Controls */}
          <div className="flex items-center gap-2.5">
            {/* Sun/Moon Toggle Switch */}
            <button
              onClick={toggle}
              className="flex h-7 w-12 items-center rounded-full bg-accent p-0.5 transition shadow-inner"
              aria-label="Toggle theme mode"
              title="Toggle Light/Dark Theme"
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full bg-card shadow-soft transition-transform duration-200",
                  dark ? "translate-x-5 text-primary" : "translate-x-0 text-warn",
                )}
              >
                {dark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              </span>
            </button>

            {/* Pill Dark/Light Mode Button */}
            <button
              onClick={toggle}
              className="hidden rounded-full bg-gradient-cta px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 sm:block"
            >
              {dark ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Profile / Dashboard Avatar Link */}
            <Link
              to="/dashboard"
              aria-label="Go to Dashboard"
              title="Go to Dashboard"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-primary shadow-soft transition hover:border-primary/40 hover:bg-accent"
            >
              <UserRound className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-[68px] sm:px-6">
        {/* Compact Hero Section */}
        <section className="relative pt-3 sm:pt-5 lg:pt-6">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Top Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary dark:bg-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-warn" />
              Your story. Written by time.
            </span>

            {/* Main Headline */}
            <h1 className="mt-2.5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[54px]">
              Every birthday
              <br />
              tells a story.
              <br />
              <span className="text-gradient">Discover yours.</span>
            </h1>

            {/* Clean Description (removed historical events) */}
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/85 sm:text-base">
              Unlock amazing facts, life statistics, cosmic insights and a lot more about your
              special day.
            </p>

            {/* Four Benefit Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5">
              {HIGHLIGHTS.map((h) => (
                <div key={h.t} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg shadow-sm",
                      h.c,
                    )}
                  >
                    <h.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-foreground leading-none">{h.t}</div>
                    <div className="whitespace-pre-line text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                      {h.d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Birth Details Card */}
        <form
          id="form"
          onSubmit={submit}
          className="mt-5 rounded-3xl border border-primary/15 bg-card/95 p-5 shadow-xl backdrop-blur-md transition sm:p-6 dark:bg-card/90"
          noValidate
        >
          <div className="text-center">
            <h2 className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Let's discover your birth story
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Enter your details below and let time reveal its magic.
            </p>
          </div>

          {/* 5 Input Fields in One Compact Row on Desktop */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                What should we call you?{" "}
                <span className="font-normal text-muted-foreground">(Optional)</span>
              </span>
              <div className={field}>
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={40}
                  placeholder="Your name (e.g. Charan)"
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Date of Birth <span className="text-destructive">*</span>
              </span>
              <div className={cn(field, error && "border-destructive")}>
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                <input
                  type="date"
                  required
                  max={today}
                  min="1900-01-01"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Time of Birth <span className="font-normal text-muted-foreground">(Optional)</span>
              </span>
              <div className={field}>
                <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                Country <span className="font-normal text-muted-foreground">(Optional)</span>
              </span>
              <div className={cn(field, "relative")}>
                <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full appearance-none bg-transparent pr-5 outline-none text-xs sm:text-sm"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                City <span className="font-normal text-muted-foreground">(Optional)</span>
              </span>
              <div className={field}>
                <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  maxLength={60}
                  placeholder="Enter City"
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </label>
          </div>

          {error && (
            <p className="mt-2 text-center text-xs font-medium text-destructive">{error}</p>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            className="mx-auto mt-4 flex h-12 w-full max-w-md items-center justify-center gap-2.5 rounded-xl bg-gradient-cta px-6 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4 text-warn" />
            Explore My Birth Story
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>

          {/* Privacy text */}
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary/80" />
            Your data stays on your device. We{" "}
            <strong className="font-semibold text-foreground">never</strong> store it.
          </p>
        </form>

        {/* Feature Cards Section */}
        <section
          id="features"
          className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 scroll-mt-20"
        >
          {FEATURES.map((f) => (
            <Link
              key={f.t}
              to={f.to}
              className="group rounded-2xl border border-border/70 bg-card/90 p-3.5 text-center shadow-soft transition hover:border-primary/40 hover:shadow-glow hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "mx-auto grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105",
                  f.c,
                )}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {f.t}
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{f.d}</div>
            </Link>
          ))}
        </section>

        {/* Social Proof & Metrics Bar */}
        <section className="mt-4 grid grid-cols-2 items-center gap-3 rounded-2xl border border-primary/15 bg-card/60 p-4 backdrop-blur md:grid-cols-5 dark:bg-card/40">
          {/* Avatar Stack */}
          <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="User"
                  className="h-6 w-6 rounded-full border-2 border-background object-cover"
                  loading="lazy"
                />
              ))}
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-background bg-primary text-[9px] font-bold text-primary-foreground">
                +
              </span>
            </div>
            <div className="text-xs font-semibold leading-tight">
              <span className="text-[10px] font-normal text-muted-foreground">Loved by</span>
              <br />
              10K+ <span className="font-normal text-muted-foreground">Users</span>
            </div>
          </div>

          {[
            { icon: Heart, v: "99.9%", l: "Accuracy", c: "text-pink-500" },
            { icon: ShieldCheck, v: "100%", l: "Private", c: "text-primary" },
            { icon: User, v: "0", l: "Sign Ups", c: "text-indigo-500" },
            { icon: Globe, v: "∞", l: "Possibilities", c: "text-blue-500" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-primary/10">
                <s.icon className={cn("h-3.5 w-3.5", s.c)} />
              </div>
              <div className="mt-0.5 text-base font-bold text-foreground">{s.v}</div>
              <div className="text-[10.5px] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto mt-6 flex max-w-7xl flex-col items-center gap-3 border-t border-border/40 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:flex-row lg:justify-between">
        <Logo />

        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <Link to="/about" className="hover:text-primary transition">
            About Us
          </Link>
          <a href="#features" onClick={scrollToFeatures} className="hover:text-primary transition">
            Features
          </a>
          <Link to="/about" className="hover:text-primary transition">
            Privacy Policy
          </Link>
          <Link to="/about" className="hover:text-primary transition">
            Terms of Use
          </Link>
          <Link to="/about" className="hover:text-primary transition">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {[
            { icon: Github, href: "https://github.com" },
            { icon: Twitter, href: "https://twitter.com" },
            { icon: Instagram, href: "https://instagram.com" },
            { icon: Youtube, href: "https://youtube.com" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card shadow-soft transition hover:border-primary hover:text-primary"
            >
              <item.icon className="h-3 w-3" />
            </a>
          ))}
        </div>

        <div className="text-center text-[11px] text-muted-foreground lg:text-right">
          Made with <Heart className="inline h-3 w-3 fill-destructive text-destructive" /> by
          DOBverse Team
          <br />© {new Date().getFullYear()} DOBverse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
