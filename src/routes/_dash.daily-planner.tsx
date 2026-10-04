import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dash/daily-planner")({
  component: DailyPlannerLayout,
});

function DailyPlannerLayout() {
  return <Outlet />;
}
