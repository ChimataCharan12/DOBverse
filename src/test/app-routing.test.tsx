import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches Habit Tracker routes correctly", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const habitIndexMatches = router.matchRoutes("/habit-tracker");
    expect(habitIndexMatches.at(-1)?.routeId).toBe("/_dash/habit-tracker/");

    const habitAddMatches = router.matchRoutes("/habit-tracker/add");
    expect(habitAddMatches.at(-1)?.routeId).toBe("/_dash/habit-tracker/add");
  });

  it("matches Daily Planner routes correctly", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const plannerIndexMatches = router.matchRoutes("/daily-planner");
    expect(plannerIndexMatches.at(-1)?.routeId).toBe("/_dash/daily-planner/");

    const plannerAddMatches = router.matchRoutes("/daily-planner/add");
    expect(plannerAddMatches.at(-1)?.routeId).toBe("/_dash/daily-planner/add");
  });
});
