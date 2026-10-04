import { Link } from "@tanstack/react-router";
import markUrl from "@/assets/dobverse-mark.png";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img src={markUrl} alt="DOBverse logo" className={cn("h-12 w-12 object-contain", className)} />
  );
}

export function Logo({
  className,
  compact,
  light,
}: {
  className?: string;
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <Link to="/" className={cn("flex min-w-0 items-center gap-3", className)}>
      <LogoMark className="h-12 w-12 shrink-0" />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div
            className={cn(
              "font-display text-2xl font-bold tracking-tight",
              light ? "text-cosmic-foreground" : "text-foreground",
            )}
          >
            DOB<span className="text-primary">verse</span>
          </div>
          <div
            className={cn(
              "truncate text-xs",
              light ? "text-cosmic-foreground/70" : "text-muted-foreground",
            )}
          >
            Discover Your Birth Story
          </div>
        </div>
      )}
    </Link>
  );
}

export function Stars({ count = 40 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const x = (i * 37.7) % 100,
          y = (i * 61.3) % 100,
          s = (i % 3) + 1;
        return (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full bg-cosmic-foreground"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        );
      })}
    </div>
  );
}
