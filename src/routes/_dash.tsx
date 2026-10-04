import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { BirthContext, useBirth } from "@/lib/birth-store";
import { applyPrefs } from "@/lib/astro";

export const Route = createFileRoute("/_dash")({ component: DashLayout });

function DashLayout() {
  const birth = useBirth();
  const navigate = useNavigate();
  useEffect(() => {
    applyPrefs();
  }, []);
  useEffect(() => {
    if (birth === null) navigate({ to: "/" });
  }, [birth, navigate]);
  return (
    <div>
      <div className="text-foreground">
        <AppShell>
          {birth ? (
            <BirthContext.Provider value={birth}>
              <Outlet />
            </BirthContext.Provider>
          ) : (
            <div className="p-10 text-muted-foreground">Loading your story…</div>
          )}
        </AppShell>
      </div>
    </div>
  );
}
