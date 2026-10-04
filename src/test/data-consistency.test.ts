import { describe, expect, it } from "vitest";
import { addYears, ageParts, birthDate, nextBirthday, totals } from "@/lib/birth";
import {
  nextOccurrence,
  occursOn,
  parseDob,
  reminderFor,
  type Person,
} from "@/lib/birthdays-store";

describe("Data consistency & Date calculation audit", () => {
  describe("February 29 Leap Year Handling", () => {
    const leapDob = "2000-02-29";
    const bDate = birthDate({ dob: leapDob });

    it("clamps Feb 29 to Feb 28 in non-leap years (addYears)", () => {
      const year2025 = addYears(bDate, 25);
      expect(year2025.getFullYear()).toBe(2025);
      expect(year2025.getMonth()).toBe(1); // February
      expect(year2025.getDate()).toBe(28);
    });

    it("preserves Feb 29 in leap years (addYears)", () => {
      const year2024 = addYears(bDate, 24);
      expect(year2024.getFullYear()).toBe(2024);
      expect(year2024.getMonth()).toBe(1); // February
      expect(year2024.getDate()).toBe(29);
    });

    it("correctly identifies occurrences with occursOn in leap and non-leap years", () => {
      expect(occursOn(leapDob, new Date(2024, 1, 29))).toBe(true);
      expect(occursOn(leapDob, new Date(2025, 1, 28))).toBe(true);
      expect(occursOn(leapDob, new Date(2025, 1, 29))).toBe(false); // March 1st in JS Date
    });

    it("calculates nextOccurrence consistently for Feb 29", () => {
      // In 2025 (non-leap year, before Feb 28)
      const now2025Early = new Date(2025, 0, 15);
      const next2025 = nextOccurrence(leapDob, now2025Early);
      expect(next2025.date.getFullYear()).toBe(2025);
      expect(next2025.date.getMonth()).toBe(1);
      expect(next2025.date.getDate()).toBe(28);
      expect(next2025.turning).toBe(25);

      // In 2028 (leap year, before Feb 29)
      const now2028Early = new Date(2028, 0, 15);
      const next2028 = nextOccurrence(leapDob, now2028Early);
      expect(next2028.date.getFullYear()).toBe(2028);
      expect(next2028.date.getMonth()).toBe(1);
      expect(next2028.date.getDate()).toBe(29);
      expect(next2028.turning).toBe(28);
    });
  });

  describe("Today / Tomorrow / Upcoming Countdown Logic", () => {
    const dob = "1995-10-04";
    const b = birthDate({ dob });

    it("correctly calculates daysLeft = 0 on the birthday (Today)", () => {
      const today = new Date(2026, 9, 4, 12, 0, 0); // Oct 4, 2026
      const nb = nextBirthday(b, today);
      expect(nb.daysLeft).toBe(0);
      expect(nb.turning).toBe(31);
      expect(nb.progress).toBe(1);

      const no = nextOccurrence(dob, today);
      expect(no.daysLeft).toBe(0);
      expect(no.turning).toBe(31);
    });

    it("correctly calculates daysLeft = 1 on the day before birthday (Tomorrow)", () => {
      const dayBefore = new Date(2026, 9, 3, 12, 0, 0); // Oct 3, 2026
      const nb = nextBirthday(b, dayBefore);
      expect(nb.daysLeft).toBe(1);
      expect(nb.turning).toBe(31);

      const no = nextOccurrence(dob, dayBefore);
      expect(no.daysLeft).toBe(1);
      expect(no.turning).toBe(31);
    });

    it("correctly rolls over to the next year on the day after birthday", () => {
      const dayAfter = new Date(2026, 9, 5, 12, 0, 0); // Oct 5, 2026
      const nb = nextBirthday(b, dayAfter);
      expect(nb.date.getFullYear()).toBe(2027);
      expect(nb.turning).toBe(32);
      expect(nb.daysLeft).toBeGreaterThan(300);

      const no = nextOccurrence(dob, dayAfter);
      expect(no.date.getFullYear()).toBe(2027);
      expect(no.turning).toBe(32);
      expect(no.daysLeft).toBeGreaterThan(300);
    });

    it("handles year boundaries correctly (December to January)", () => {
      const janDob = "1990-01-02";
      const bJan = birthDate({ dob: janDob });
      const dec31 = new Date(2025, 11, 31, 23, 0, 0); // Dec 31, 2025

      const nb = nextBirthday(bJan, dec31);
      expect(nb.date.getFullYear()).toBe(2026);
      expect(nb.date.getMonth()).toBe(0); // January
      expect(nb.date.getDate()).toBe(2);
      expect(nb.daysLeft).toBe(2);
    });
  });

  describe("Age & Totals Calculations", () => {
    it("computes accurate years, months, and totals", () => {
      const b = new Date(2000, 0, 1); // Jan 1, 2000
      const now = new Date(2025, 0, 1); // Jan 1, 2025
      const a = ageParts(b, now);
      expect(a.years).toBe(25);
      expect(a.months).toBe(0);
      expect(a.days).toBe(0);

      const t = totals(b, now);
      expect(t.years).toBe(25);
      expect(t.months).toBe(300);
      expect(t.days).toBe(9132); // including leap days
    });
  });

  describe("Astronomical & Compare Calculations", () => {
    it("calculates accurate zodiac signs across all dates including boundary dates", async () => {
      const { zodiac } = await import("@/lib/astro");
      expect(zodiac(new Date(2000, 11, 22)).name).toBe("Capricorn"); // Dec 22
      expect(zodiac(new Date(2000, 11, 21)).name).toBe("Sagittarius"); // Dec 21
      expect(zodiac(new Date(2000, 0, 15)).name).toBe("Capricorn"); // Jan 15
      expect(zodiac(new Date(2000, 0, 20)).name).toBe("Aquarius"); // Jan 20
      expect(zodiac(new Date(2000, 1, 29)).name).toBe("Pisces"); // Feb 29 Leap Day
      expect(zodiac(new Date(2000, 2, 21)).name).toBe("Aries"); // Mar 21
      expect(zodiac(new Date(2000, 6, 23)).name).toBe("Leo"); // Jul 23
      expect(zodiac(new Date(2000, 10, 22)).name).toBe("Sagittarius"); // Nov 22
    });

    it("calculates deterministic moon phases and illumination ranges (0-100%)", async () => {
      const { moonPhase } = await import("@/lib/astro");
      const mp1 = moonPhase(new Date(2000, 0, 6, 18, 14)); // Exact reference epoch (New Moon)
      expect(mp1.name).toBe("New Moon");
      expect(mp1.illum).toBeLessThanOrEqual(5);

      const mp2 = moonPhase(new Date(2000, 0, 21)); // ~Full Moon (~15 days later)
      expect(mp2.name).toBe("Full Moon");
      expect(mp2.illum).toBeGreaterThanOrEqual(95);

      // Verify illumination is bounded between 0 and 100
      for (let m = 0; m < 12; m++) {
        const mp = moonPhase(new Date(2024, m, 15));
        expect(mp.illum).toBeGreaterThanOrEqual(0);
        expect(mp.illum).toBeLessThanOrEqual(100);
        expect(mp.icon).toBeTruthy();
        expect(mp.name).toBeTruthy();
      }
    });
  });

  describe("Reminders Consistency & Recurrence", () => {
    it("determines active reminder status matching topbar logic", () => {
      const person: Person = {
        id: "test-1",
        name: "Alice",
        dob: "1998-10-06",
        category: "friends",
        reminder: { enabled: true, daysBefore: 3 },
      };

      const nowOct4 = new Date(2026, 9, 4, 10, 0, 0); // 2 days before
      const r = reminderFor(person, nowOct4, 3);
      expect(r.next.daysLeft).toBe(2);
      expect(r.status).toBe("due");
      expect(r.enabled).toBe(true);

      // Active reminder predicate
      const isActive = r.enabled && r.next.daysLeft <= r.daysBefore;
      expect(isActive).toBe(true);
    });

    it("respects per-person reminder timing override vs global default", () => {
      const mom: Person = {
        id: "mom",
        name: "Mom",
        dob: "1975-10-12",
        category: "family",
        reminder: { enabled: true, daysBefore: 7 }, // Custom 7 days before
      };
      const dad: Person = {
        id: "dad",
        name: "Dad",
        dob: "1973-10-12",
        category: "family",
        // No custom reminder -> uses default (3 days before)
      };

      const nowOct5 = new Date(2026, 9, 5); // 7 days before Oct 12
      const rMom = reminderFor(mom, nowOct5, 3);
      const rDad = reminderFor(dad, nowOct5, 3);

      expect(rMom.daysBefore).toBe(7);
      expect(rMom.custom).toBe(true);
      expect(rMom.status).toBe("due"); // 7 days left <= 7 days before

      expect(rDad.daysBefore).toBe(3);
      expect(rDad.custom).toBe(false);
      expect(rDad.status).toBe("scheduled"); // 7 days left > 3 days before
    });

    it("calculates accurate reminder dates across all timing offsets (0, 1, 3, 7 days)", () => {
      const p: Person = {
        id: "p1",
        name: "Test Person",
        dob: "1990-10-12",
        category: "friends",
      };
      const now = new Date(2026, 9, 1); // Oct 1, 2026

      const r0 = reminderFor({ ...p, reminder: { enabled: true, daysBefore: 0 } }, now, 3);
      expect(r0.remindOn.getMonth()).toBe(9);
      expect(r0.remindOn.getDate()).toBe(12);

      const r1 = reminderFor({ ...p, reminder: { enabled: true, daysBefore: 1 } }, now, 3);
      expect(r1.remindOn.getDate()).toBe(11);

      const r3 = reminderFor({ ...p, reminder: { enabled: true, daysBefore: 3 } }, now, 3);
      expect(r3.remindOn.getDate()).toBe(9);

      const r7 = reminderFor({ ...p, reminder: { enabled: true, daysBefore: 7 } }, now, 3);
      expect(r7.remindOn.getDate()).toBe(5);
    });

    it("handles Birthday Recurrence: yearly vs once", () => {
      const now2026 = new Date(2026, 9, 4); // Oct 4, 2026

      const yearlyPerson: Person = {
        id: "y1",
        name: "Yearly Friend",
        dob: "1990-10-12",
        category: "friends",
        repeat: "yearly",
      };

      const oncePersonCurrent: Person = {
        id: "o1",
        name: "Once 2026",
        dob: "1990-10-12",
        category: "colleagues",
        repeat: "once",
        targetYear: 2026,
      };

      const oncePersonPast: Person = {
        id: "o2",
        name: "Once Past 2025",
        dob: "1990-10-12",
        category: "others",
        repeat: "once",
        targetYear: 2025,
      };

      // nextOccurrence for yearly
      const noY = nextOccurrence(yearlyPerson, now2026);
      expect(noY.date.getFullYear()).toBe(2026);
      expect(noY.date.getMonth()).toBe(9);
      expect(noY.date.getDate()).toBe(12);
      expect(noY.isPast).toBe(false);

      // nextOccurrence for once (current year)
      const noO1 = nextOccurrence(oncePersonCurrent, now2026);
      expect(noO1.date.getFullYear()).toBe(2026);
      expect(noO1.isPast).toBe(false);

      // nextOccurrence for once (past year)
      const noO2 = nextOccurrence(oncePersonPast, now2026);
      expect(noO2.date.getFullYear()).toBe(2025);
      expect(noO2.isPast).toBe(true);

      // occursOn checks
      expect(occursOn(yearlyPerson, new Date(2026, 9, 12))).toBe(true);
      expect(occursOn(yearlyPerson, new Date(2027, 9, 12))).toBe(true);

      expect(occursOn(oncePersonCurrent, new Date(2026, 9, 12))).toBe(true);
      expect(occursOn(oncePersonCurrent, new Date(2027, 9, 12))).toBe(false);

      expect(occursOn(oncePersonPast, new Date(2025, 9, 12))).toBe(true);
      expect(occursOn(oncePersonPast, new Date(2026, 9, 12))).toBe(false);
    });

    it("preserves Feb 29 leap clamping in yearly and once recurrence", () => {
      const feb29Yearly: Person = {
        id: "f1",
        name: "Leap Baby Yearly",
        dob: "2000-02-29",
        category: "family",
        repeat: "yearly",
      };

      const feb29Once2028: Person = {
        id: "f2",
        name: "Leap Baby 2028",
        dob: "2000-02-29",
        category: "family",
        repeat: "once",
        targetYear: 2028,
      };

      const now2025 = new Date(2025, 0, 1); // Non-leap year
      const next2025 = nextOccurrence(feb29Yearly, now2025);
      expect(next2025.date.getFullYear()).toBe(2025);
      expect(next2025.date.getMonth()).toBe(1);
      expect(next2025.date.getDate()).toBe(28); // Clamped to Feb 28

      const next2028 = nextOccurrence(feb29Once2028, now2025);
      expect(next2028.date.getFullYear()).toBe(2028);
      expect(next2028.date.getMonth()).toBe(1);
      expect(next2028.date.getDate()).toBe(29); // Real leap day Feb 29
    });

    it("toICS generates RRULE:FREQ=YEARLY only for yearly recurring birthdays", async () => {
      const { toICS } = await import("@/lib/birthdays-store");
      const list: Person[] = [
        { id: "1", name: "Alice", dob: "1995-05-15", category: "friends", repeat: "yearly" },
        {
          id: "2",
          name: "Bob",
          dob: "1990-08-20",
          category: "colleagues",
          repeat: "once",
          targetYear: 2026,
        },
      ];
      const ics = toICS(list);
      expect(ics).toContain("SUMMARY:Alice's Birthday");
      expect(ics).toContain("RRULE:FREQ=YEARLY");
      expect(ics).toContain("SUMMARY:Bob's Birthday");
      // Bob is once -> should not have RRULE in his block
      const bobBlock = ics.split("BEGIN:VEVENT").find((b) => b.includes("Bob's Birthday"));
      expect(bobBlock).toBeTruthy();
      expect(bobBlock).not.toContain("RRULE:FREQ=YEARLY");
    });

    it("deduplicates daily browser notifications per person", async () => {
      const { runReminderCheck } = await import("@/lib/birthdays-store");
      const list: Person[] = [
        {
          id: "notif-test-1",
          name: "Charlie",
          dob: "1990-10-04",
          category: "friends",
          reminder: { enabled: true, daysBefore: 1 },
        },
      ];

      // Setup localStorage and Notification mock
      localStorage.setItem(
        "dobverse.reminderSettings",
        JSON.stringify({ browser: true, daysBefore: 3 }),
      );
      const notificationsCreated: { title: string; options?: unknown }[] = [];
      globalThis.Notification = class MockNotification {
        static permission: NotificationPermission = "granted";
        static requestPermission = async () => "granted" as NotificationPermission;
        constructor(title: string, options?: unknown) {
          notificationsCreated.push({ title, options });
        }
      } as unknown as typeof Notification;

      const now = new Date(2026, 9, 4, 9, 0, 0); // Birthday today
      // First check -> triggers notification
      runReminderCheck(list, now);
      expect(notificationsCreated.length).toBe(1);
      expect(notificationsCreated[0].title).toContain("Charlie");
      expect(localStorage.getItem("dobverse.notified.notif-test-1.2026-10-04")).toBe("1");

      // Second check on the same day (e.g. route change / page refresh / multi-tab) -> NO duplicate notification
      runReminderCheck(list, now);
      expect(notificationsCreated.length).toBe(1);
    });
  });
});
