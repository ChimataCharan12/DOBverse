import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dash/habit-tracker")({
  component: HabitTrackerLayout,
});

function HabitTrackerLayout() {
  return <Outlet />;
}
