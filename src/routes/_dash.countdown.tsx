import { createFileRoute } from "@tanstack/react-router";
import { Cake } from "lucide-react";
import { Topbar } from "@/components/app/AppShell";
import { Panel, PanelHeader } from "@/components/app/ui";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { birthDate, fmtLong, nextBirthday, pad, weekday } from "@/lib/birth";

export const Route = createFileRoute("/_dash/countdown")({
  head: () => ({
    meta: [
      { title: "Birthday Countdown — DOBverse" },
      {
        name: "description",
        content: "A live countdown to your next birthday, down to the second.",
      },
      { property: "og:title", content: "Birthday Countdown — DOBverse" },
      { property: "og:description", content: "A live countdown to your next birthday." },
    ],
  }),
  component: Countdown,
});

function Countdown() {
  const birth = useCurrentBirth();
  const now = useNow();
  const b = birthDate(birth);
  return (
    <>
      <Topbar
        back
        title="Birthday Countdown"
        subtitle="Every second brings your special day closer."
      />
      <div className="px-4 pb-8 sm:px-6">
        {now &&
          (() => {
            const nb = nextBirthday(b, now);
            return (
              <Panel className="p-8">
                <PanelHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Cake className="h-5 w-5 text-magenta" />
                      Turning {nb.turning}
                    </span>
                  }
                  right={`${weekday(nb.date)}, ${fmtLong(nb.date)}`}
                />
                <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                  {(
                    [
                      [nb.days, "Days"],
                      [nb.hours, "Hours"],
                      [nb.minutes, "Minutes"],
                      [nb.seconds, "Seconds"],
                    ] as const
                  ).map(([v, l]) => (
                    <div key={l} className="rounded-2xl bg-secondary p-6">
                      <div className="text-gradient font-display text-5xl font-bold">{pad(v)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-cta"
                    style={{ width: `${nb.progress * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>{(nb.progress * 100).toFixed(1)}% of this year completed</span>
                  <span>Another amazing year is waiting for you! ✨</span>
                </div>
              </Panel>
            );
          })()}
      </div>
    </>
  );
}
