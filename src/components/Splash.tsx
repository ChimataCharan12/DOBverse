import { useEffect, useState } from "react";
import { Clock, CalendarDays, Orbit, Star, ShieldCheck } from "lucide-react";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import hourglass from "@/assets/hourglass.jpg";
import { LogoMark, Stars } from "./brand";
import { cn } from "@/lib/utils";

const STAGES = [
  { icon: Clock, label: "Calculating\nYour Age" },
  { icon: CalendarDays, label: "Analyzing\nMilestones" },
  { icon: Orbit, label: "Exploring\nThe Universe" },
  { icon: Star, label: "Preparing\nInsights" },
];

export function Splash({
  duration = 2200,
  title = "Traveling Through Time...",
  subtitle = "Finding Your Birth Story...",
  onDone,
}: {
  duration?: number;
  title?: string;
  subtitle?: string;
  onDone?: () => void;
}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const v = Math.min(100, ((Date.now() - start) / duration) * 100);
      setP(v);
      if (v >= 100) {
        clearInterval(id);
        onDone?.();
      }
    }, 40);
    return () => clearInterval(id);
  }, [duration, onDone]);
  const stage = Math.min(3, Math.floor(p / 25));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cosmic text-cosmic-foreground animate-in fade-in">
      <img
        src={cosmicBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1536}
        height={1024}
      />
      <Stars count={50} />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="rounded-full p-1 shadow-glow">
          <LogoMark className="h-28 w-28" />
        </div>
        <h1 className="mt-5 font-display text-6xl font-bold tracking-tight sm:text-7xl">
          DOB<span className="text-gradient">verse</span>
        </h1>
        <p className="mt-1 text-xl text-cosmic-foreground/85">Discover Your Birth Story</p>
        <div className="relative my-6 h-40 w-40 animate-floaty overflow-hidden rounded-full shadow-glow">
          <img src={hourglass} alt="Glowing hourglass" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-lg text-primary">· {subtitle}</p>
        <div className="mt-6 flex w-full items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-cosmic-foreground/10">
            <div
              className="h-full rounded-full bg-gradient-cta transition-[width]"
              style={{ width: `${p}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold">{Math.round(p)}%</span>
        </div>
        <div className="mt-6 grid w-full grid-cols-4 gap-2">
          {STAGES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full transition",
                  i <= stage ? "bg-primary shadow-glow" : "bg-cosmic-foreground/10",
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className="whitespace-pre-line text-xs text-cosmic-foreground/85">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-cosmic-foreground/15 bg-cosmic-foreground/5 px-5 py-4 text-left backdrop-blur">
          <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <div className="text-sm font-medium">
              100% Private • No Login • No Tracking • No Ads
            </div>
            <div className="text-xs text-cosmic-foreground/65">
              All your data stays on your device.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
