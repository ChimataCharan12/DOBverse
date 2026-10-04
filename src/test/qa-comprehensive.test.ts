import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ageParts,
  birthDate,
  nextBirthday,
  lifeStats,
  milestones,
  decadeBreakdown,
  addYears,
  fmtDate,
  fmtLong,
  weekday,
  MONTHS,
} from "@/lib/birth";
import {
  nextOccurrence,
  occursOn,
  parseDob,
  reminderFor,
  withNext,
  type Person,
} from "@/lib/birthdays-store";
import {
  defaultDesign,
  historyInit,
  historySet,
  historyUndo,
  historyRedo,
  newElement,
  resizeBox,
  templateById,
  TEMPLATES,
} from "@/lib/card-designs";

describe("Phase 5: Final Production QA & Comprehensive Edge Case Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("1. Date Calculation Edge Cases & Consistency", () => {
    it("handles birthday occurring today correctly across all calculation utilities", () => {
      const now = new Date(2026, 5, 15, 12, 0, 0); // June 15, 2026
      const bDate = new Date(2000, 5, 15); // June 15, 2000 (Turning 26)

      const age = ageParts(bDate, now);
      expect(age.years).toBe(26);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);

      const nb = nextBirthday(bDate, now);
      expect(nb.turning).toBe(26);
      expect(nb.days).toBe(0);
      expect(nb.hours).toBe(0);
      expect(nb.minutes).toBe(0);
      expect(nb.seconds).toBe(0);
      expect(nb.daysLeft).toBe(0);

      const nextOcc = nextOccurrence("2000-06-15", now);
      expect(nextOcc.daysLeft).toBe(0);
      expect(nextOcc.turning).toBe(26);
    });

    it("handles birthday occurring tomorrow correctly", () => {
      const now = new Date(2026, 5, 14, 12, 0, 0); // June 14, 2026
      const bDate = new Date(2000, 5, 15); // June 15, 2000

      const nb = nextBirthday(bDate, now);
      expect(nb.turning).toBe(26);
      expect(nb.days).toBe(0); // Under 24h away -> 0 full days remaining
      expect(nb.hours).toBe(12);

      const nextOcc = nextOccurrence("2000-06-15", now);
      expect(nextOcc.daysLeft).toBe(1);
      expect(nextOcc.turning).toBe(26);
    });

    it("handles year boundary crossing (Dec 31 -> Jan 1) seamlessly", () => {
      const now = new Date(2026, 11, 31, 23, 30, 0); // Dec 31, 2026, 11:30 PM
      const janFirstBirth = new Date(1990, 0, 1); // Jan 1, 1990

      const nb = nextBirthday(janFirstBirth, now);
      expect(nb.turning).toBe(37); // Turning 37 on Jan 1, 2027
      expect(nb.date.getFullYear()).toBe(2027);
      expect(nb.days).toBe(0);
      expect(nb.hours).toBe(0);
      expect(nb.minutes).toBe(30);

      const nextOcc = nextOccurrence("1990-01-01", now);
      expect(nextOcc.daysLeft).toBe(1);
      expect(nextOcc.turning).toBe(37);
      expect(nextOcc.date.getFullYear()).toBe(2027);
    });

    it("handles Feb 29 leap year DOB accurately in leap vs non-leap years", () => {
      const feb29DOB = new Date(2000, 1, 29); // Feb 29, 2000

      // In non-leap year 2025 (Feb has 28 days) -> Clamps to Feb 28
      const now2025 = new Date(2025, 0, 1);
      const nb2025 = nextBirthday(feb29DOB, now2025);
      expect(nb2025.date.getFullYear()).toBe(2025);
      expect(nb2025.date.getMonth()).toBe(1); // February
      expect(nb2025.date.getDate()).toBe(28);

      const nextOcc2025 = nextOccurrence("2000-02-29", now2025);
      expect(nextOcc2025.date.getDate()).toBe(28);

      // In leap year 2028 (Feb has 29 days) -> Preserves Feb 29
      const now2028 = new Date(2028, 0, 1);
      const nb2028 = nextBirthday(feb29DOB, now2028);
      expect(nb2028.date.getFullYear()).toBe(2028);
      expect(nb2028.date.getMonth()).toBe(1); // February
      expect(nb2028.date.getDate()).toBe(29);

      const nextOcc2028 = nextOccurrence("2000-02-29", now2028);
      expect(nextOcc2028.date.getDate()).toBe(29);
    });
  });

  describe("2. Age Comparison Engine QA", () => {
    it("calculates exact difference between two birth dates using ageParts", () => {
      const d1 = new Date(1990, 2, 15); // March 15, 1990
      const d2 = new Date(1995, 6, 20); // July 20, 1995

      const diff = ageParts(d1, d2);
      expect(diff.years).toBe(5);
      expect(diff.months).toBe(4);
      expect(diff.days).toBe(5);
    });

    it("handles same-day birth comparison gracefully with zero difference", () => {
      const d1 = new Date(2000, 0, 1);
      const d2 = new Date(2000, 0, 1);

      const diff = ageParts(d1, d2);
      expect(diff.years).toBe(0);
      expect(diff.months).toBe(0);
      expect(diff.days).toBe(0);
    });
  });

  describe("3. Reminder Calculation QA", () => {
    it("calculates correct reminder triggers and status for 0, 1, 3, and 7 days before", () => {
      const now = new Date(2026, 4, 10); // May 10, 2026

      const pOnDay: Person = {
        id: "p0",
        name: "Today Person",
        dob: "1990-05-10",
        category: "friends",
      };
      const r0 = reminderFor(pOnDay, now, 0);
      expect(r0.next.daysLeft).toBe(0);
      expect(r0.status).toBe("today");

      const p1Day: Person = {
        id: "p1",
        name: "Tomorrow Person",
        dob: "1990-05-11",
        category: "friends",
      };
      const r1 = reminderFor(p1Day, now, 1);
      expect(r1.next.daysLeft).toBe(1);
      expect(r1.status).toBe("due");

      const p3Day: Person = {
        id: "p3",
        name: "3-Day Person",
        dob: "1990-05-13",
        category: "friends",
      };
      const r3 = reminderFor(p3Day, now, 3);
      expect(r3.next.daysLeft).toBe(3);
      expect(r3.status).toBe("due");

      const p7Day: Person = {
        id: "p7",
        name: "7-Day Person",
        dob: "1990-05-17",
        category: "friends",
      };
      const r7 = reminderFor(p7Day, now, 7);
      expect(r7.next.daysLeft).toBe(7);
      expect(r7.status).toBe("due");
    });
  });

  describe("4. Card Editor State & History QA", () => {
    it("initializes default design for person", () => {
      const design = defaultDesign("person-123");
      expect(design.personId).toBe("person-123");
      expect(design.templateId).toBe("floral");
      expect(design.elements.length).toBeGreaterThan(0);
      expect(design.sizeKey).toBe("portrait");
    });

    it("supports multi-step undo and redo transitions", () => {
      const initial = defaultDesign("p1");
      let history = historyInit(initial);

      // Mutation 1: add photo
      const d1 = { ...initial, photo: "data:image/png;base64,abc" };
      history = historySet(history, d1);
      expect(history.present.photo).toBe("data:image/png;base64,abc");
      expect(history.past.length).toBe(1);

      // Mutation 2: change theme to dark
      const d2 = { ...d1, theme: "dark" as const };
      history = historySet(history, d2);
      expect(history.present.theme).toBe("dark");
      expect(history.past.length).toBe(2);

      // Undo step 1
      history = historyUndo(history);
      expect(history.present.theme).toBe("light");
      expect(history.future.length).toBe(1);

      // Undo step 2
      history = historyUndo(history);
      expect(history.present.photo).toBeNull();
      expect(history.past.length).toBe(0);

      // Redo step 1
      history = historyRedo(history);
      expect(history.present.photo).toBe("data:image/png;base64,abc");

      // Redo step 2
      history = historyRedo(history);
      expect(history.present.theme).toBe("dark");
    });

    it("creates properly bounded new elements and allows box resizing", () => {
      const el = newElement("heading", 800, 1000);
      expect(el.type).toBe("heading");
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);

      const resized = resizeBox(el, 50, 50, false);
      expect(resized.w).toBe(el.w + 50);
      expect(resized.h).toBe(el.h + 50);
    });

    it("resolves all templates correctly by ID with valid fallback", () => {
      TEMPLATES.forEach((t) => {
        const found = templateById(t.id);
        expect(found.id).toBe(t.id);
        expect(found.theme).toBeDefined();
      });

      // Unknown ID falls back to default first template (floral)
      const fallback = templateById("non-existent-template-id");
      expect(fallback.id).toBe("floral");
    });
  });

  describe("5. Sorting and Empty List Resilience", () => {
    it("sorts upcoming birthdays chronologically by next occurrence date", () => {
      const now = new Date(2026, 0, 1); // Jan 1, 2026
      const people: Person[] = [
        { id: "1", name: "December", dob: "1995-12-25", category: "friends" },
        { id: "2", name: "February", dob: "1992-02-14", category: "family" },
        { id: "3", name: "January", dob: "1990-01-15", category: "colleagues" },
      ];

      const sorted = withNext(people, now);
      expect(sorted[0].name).toBe("January");
      expect(sorted[1].name).toBe("February");
      expect(sorted[2].name).toBe("December");
    });

    it("handles empty lists safely without throwing errors", () => {
      const now = new Date(2026, 0, 1);
      const empty: Person[] = [];
      const result = withNext(empty, now);
      expect(result).toEqual([]);
    });
  });

  describe("6. Calendar Birthday Name Visibility & Filtering", () => {
    const list: Person[] = [
      { id: "1", name: "Yamini Sharma", dob: "1995-10-18", category: "family", repeat: "yearly" },
      { id: "2", name: "Charan Tej", dob: "1993-10-18", category: "friends", repeat: "yearly" },
      { id: "3", name: "Priya Patel", dob: "1998-10-18", category: "colleagues", repeat: "yearly" },
      { id: "4", name: "Solo Date", dob: "1990-10-21", category: "others", repeat: "yearly" },
      {
        id: "5",
        name: "Once 2026",
        dob: "1992-10-25",
        category: "friends",
        repeat: "once",
        targetYear: 2026,
      },
    ];

    it("identifies single birthday on a date with full name and category", () => {
      const oct21 = new Date(2026, 9, 21);
      const hits = list.filter((p) => occursOn(p, oct21));
      expect(hits.length).toBe(1);
      expect(hits[0].name).toBe("Solo Date");
      expect(hits[0].category).toBe("others");
    });

    it("identifies multiple birthdays on the same date for +N badge rendering", () => {
      const oct18 = new Date(2026, 9, 18);
      const hits = list.filter((p) => occursOn(p, oct18));
      expect(hits.length).toBe(3);
      expect(hits.map((h) => h.name)).toEqual(["Yamini Sharma", "Charan Tej", "Priya Patel"]);
    });

    it("respects recurrence when evaluating calendar dates", () => {
      const oct25_2026 = new Date(2026, 9, 25);
      const oct25_2027 = new Date(2027, 9, 25);

      const hits2026 = list.filter((p) => occursOn(p, oct25_2026));
      expect(hits2026.length).toBe(1);
      expect(hits2026[0].name).toBe("Once 2026");

      const hits2027 = list.filter((p) => occursOn(p, oct25_2027));
      expect(hits2027.length).toBe(0); // "once" in 2026 does not occur in 2027
    });
  });

  describe("7. PWA Manifest & Installation Module", () => {
    it("validates Web App Manifest fields and standalone configuration", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifestContent.name).toBe("DOBverse — Discover Your Birth Story");
      expect(manifestContent.short_name).toBe("DOBverse");
      expect(manifestContent.display).toBe("standalone");
      expect(manifestContent.start_url).toBe("/");
      expect(manifestContent.theme_color).toBe("#7c3aed");
      expect(manifestContent.icons.length).toBeGreaterThanOrEqual(2);
    });

    it("validates Service Worker script existence and safe cache setup", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const swPath = path.resolve(process.cwd(), "public/sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");
      expect(swContent).toContain("dobverse-v1");
      expect(swContent).toContain("install");
      expect(swContent).toContain("fetch");
    });

    it("evaluates isStandalone helper safely without window crashes", async () => {
      const { isStandalone } = await import("@/lib/pwa");
      expect(typeof isStandalone()).toBe("boolean");
    });
  });
});
