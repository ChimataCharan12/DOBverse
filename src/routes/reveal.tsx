import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import { LogoMark, Stars } from "@/components/brand";
import { Splash } from "@/components/Splash";
import { useBirth } from "@/lib/birth-store";
import { birthDate, weekday } from "@/lib/birth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reveal")({
  head: () => ({
    meta: [
      { title: "Your Birth Reveal — DOBverse" },
      { name: "description", content: "Discover the day of the week you were born." },
      { property: "og:title", content: "Your Birth Reveal — DOBverse" },
      { property: "og:description", content: "Discover the day of the week you were born." },
    ],
  }),
  component: Reveal,
});

const COLORS = ["var(--primary)", "var(--magenta)", "var(--warn)", "var(--info)", "var(--chart-2)"];

function Reveal() {
  const birth = useBirth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "reveal" | "out">("loading");

  useEffect(() => {
    if (birth === null) navigate({ to: "/" });
  }, [birth, navigate]);
  useEffect(() => {
    if (phase === "reveal") {
      const t = setTimeout(() => setPhase("out"), 1600);
      return () => clearTimeout(t);
    }
    if (phase === "out") {
      const t = setTimeout(() => navigate({ to: "/dashboard" }), 500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, navigate]);

  if (!birth) return <div className="fixed inset-0 bg-cosmic" />;
  if (phase === "loading") return <Splash duration={1600} onDone={() => setPhase("reveal")} />;
  const day = weekday(birthDate(birth));

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden bg-cosmic text-cosmic-foreground transition-opacity duration-500",
        phase === "out" ? "opacity-0" : "animate-in fade-in duration-700",
      )}
    >
      <img src={cosmicBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Stars count={40} />
      {Array.from({ length: 70 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{
            left: `${(i * 13.7) % 100}%`,
            width: 6 + (i % 4) * 2,
            height: 10 + (i % 3) * 3,
            background: COLORS[i % 5],
            animation: `confetti ${2.5 + (i % 5) * 0.5}s linear ${(i % 10) * 0.12}s infinite`,
          }}
        />
      ))}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full shadow-glow">
          <LogoMark className="h-24 w-24" />
        </div>
        <div className="mt-8 w-full max-w-2xl rounded-3xl border border-cosmic-foreground/15 bg-cosmic/60 px-6 py-10 backdrop-blur-md animate-in zoom-in-95 duration-700">
          <p className="text-3xl font-medium sm:text-4xl">🎉 You were born on</p>
          <p className="text-gradient mt-2 font-display text-7xl font-bold sm:text-8xl">{day}!</p>
          <div className="mx-auto my-6 flex max-w-md items-center gap-3">
            <span className="h-px flex-1 bg-cosmic-foreground/20" />
            <span className="text-primary">✦</span>
            <span className="h-px flex-1 bg-cosmic-foreground/20" />
          </div>
          <p className="text-2xl sm:text-3xl">
            <span className="text-primary">✦</span> Welcome to your birth story
            {birth.name ? `, ${birth.name}` : ""}. <span className="text-primary">✦</span>
          </p>
        </div>
        <div className="absolute bottom-10 rounded-full border border-primary/60 bg-cosmic/50 px-8 py-3 text-cosmic-foreground/90 backdrop-blur">
          Let's explore the amazing story
          <br />
          written in the stars! ✨
        </div>
      </div>
    </div>
  );
}
