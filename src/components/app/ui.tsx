import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn("rounded-2xl border bg-card p-5 text-card-foreground shadow-soft", className)}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 text-xs text-muted-foreground">{right}</div>}
    </div>
  );
}

export function IconBubble({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "magenta" | "success" | "warn" | "info";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    magenta: "bg-magenta/10 text-magenta",
    success: "bg-success/15 text-success",
    warn: "bg-warn/15 text-warn",
    info: "bg-info/10 text-info",
  };
  return (
    <div
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  stroke = 22,
  children,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let off = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-off}
            />
          );
          off += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export const CHART = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
