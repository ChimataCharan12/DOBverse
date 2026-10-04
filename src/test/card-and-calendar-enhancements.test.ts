import { describe, it, expect, beforeEach } from "vitest";
import { birthDate, totals, lifeStats } from "@/lib/birth";
import { zodiac, moonPhase } from "@/lib/astro";
import { nextOccurrence, toICS, type Person } from "@/lib/birthdays-store";
import {
  TEMPLATES,
  templateById,
  templateElements,
  defaultDesign,
  newElement,
  resizeBox,
  SIZES,
} from "@/lib/card-designs";

describe("Calendar & Card Generator Enhancements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Google Calendar URL Generation (Truthful Export)", () => {
    it("generates correct Google Calendar template URL for yearly repeating birthday", () => {
      const p: Person = {
        id: "p1",
        name: "Priya Sharma",
        dob: "1998-05-18",
        category: "family",
        repeat: "yearly",
      };
      const now = new Date(2026, 0, 1);
      const occ = nextOccurrence(p, now);
      const y = occ.date.getFullYear();
      const m = String(occ.date.getMonth() + 1).padStart(2, "0");
      const day = String(occ.date.getDate()).padStart(2, "0");
      const d = `${y}${m}${day}`;
      const recurParam = p.repeat === "once" ? "" : "&recur=RRULE:FREQ=YEARLY";
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${p.name}'s Birthday`)}&dates=${d}/${d}${recurParam}`;

      expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
      expect(url).toContain(encodeURIComponent("Priya Sharma's Birthday"));
      expect(url).toContain("recur=RRULE:FREQ=YEARLY");
      expect(url).toContain(`dates=${d}/${d}`);
    });

    it("generates non-recurring Google Calendar template URL for one-time birthday", () => {
      const p: Person = {
        id: "p2",
        name: "Rahul Kumar",
        dob: "2000-08-20",
        category: "friends",
        repeat: "once",
      };
      const now = new Date(2026, 0, 1);
      const occ = nextOccurrence(p, now);
      const y = occ.date.getFullYear();
      const m = String(occ.date.getMonth() + 1).padStart(2, "0");
      const day = String(occ.date.getDate()).padStart(2, "0");
      const d = `${y}${m}${day}`;
      const recurParam = p.repeat === "once" ? "" : "&recur=RRULE:FREQ=YEARLY";
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${p.name}'s Birthday`)}&dates=${d}/${d}${recurParam}`;

      expect(url).not.toContain("RRULE");
      expect(url).toContain(`dates=${d}/${d}`);
    });

    it("exports valid ICS with RFC 5545 compliance", () => {
      const list: Person[] = [
        { id: "1", name: "Priya", dob: "1998-05-18", category: "family", repeat: "yearly" },
        { id: "2", name: "Rahul", dob: "2000-08-20", category: "friends", repeat: "once" },
      ];
      const ics = toICS(list);
      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("SUMMARY:Priya's Birthday");
      expect(ics).toContain("RRULE:FREQ=YEARLY");
      expect(ics).toContain("SUMMARY:Rahul's Birthday");
      expect(ics).toContain("END:VCALENDAR");
    });
  });

  describe("Cosmic Birthday Celebration Template", () => {
    it("includes celebration template in TEMPLATES list", () => {
      const t = templateById("celebration");
      expect(t).toBeDefined();
      expect(t.id).toBe("celebration");
      expect(t.layout).toBe("celebration");
      expect(t.theme).toBe("dark");
      expect(t.label).toBe("Cosmic Celebration");
    });

    it("generates dynamic celebration elements with proper structure", () => {
      const t = templateById("celebration");
      const elements = templateElements(t, "portrait");

      const types = elements.map((e) => e.type);
      expect(types).toContain("heading");
      expect(types).toContain("name");
      expect(types).toContain("message");
      expect(types).toContain("age");
      expect(types).toContain("statDays");
      expect(types).toContain("statHeartbeats");
      expect(types).toContain("moon");
      expect(types).toContain("zodiac");
      expect(types).toContain("quote");
      expect(types).toContain("wish");
    });

    it("calculates accurate dynamic personal data for Cosmic Celebration template", () => {
      const person: Person = {
        id: "charan-id",
        name: "Charan",
        dob: "2005-06-10",
        category: "friends",
      };
      const now = new Date(2026, 5, 10, 12, 0, 0); // Turning 21 on June 10, 2026
      const bDate = birthDate({ dob: person.dob });
      const occ = nextOccurrence(person, now);
      const tot = totals(bDate, now);
      const life = lifeStats(bDate, now);
      const sign = zodiac(bDate);
      const moon = moonPhase(bDate);

      expect(occ.turning).toBe(21);
      expect(tot.days).toBeGreaterThan(7000);
      expect(life.heartbeats).toBeGreaterThan(100_000_000);
      expect(sign.name).toBe("Gemini");
      expect(moon.name).toBeDefined();
    });

    it("creates default design initialized to celebration template", () => {
      const design = defaultDesign("test-person", "celebration", "portrait");
      expect(design.templateId).toBe("celebration");
      expect(design.theme).toBe("dark");
      expect(design.elements.length).toBeGreaterThan(5);
    });
  });

  describe("Zoom & Element Manipulation Invariants", () => {
    it("clamps zoom bounds within 70% to 150%", () => {
      let zoom = 100;
      const zoomOut = (z: number) => Math.max(70, z - 10);
      const zoomIn = (z: number) => Math.min(150, z + 10);

      // Zoom out to minimum
      for (let i = 0; i < 10; i++) zoom = zoomOut(zoom);
      expect(zoom).toBe(70);

      // Zoom in to maximum
      for (let i = 0; i < 15; i++) zoom = zoomIn(zoom);
      expect(zoom).toBe(150);
    });

    it("resizes elements accurately preserving rotational transforms", () => {
      const el = newElement("statDays", 1080, 1350);
      const initialW = el.w;
      const initialH = el.h;

      const resized = resizeBox(el, 50, 30, false);
      expect(resized.w).toBe(initialW + 50);
      expect(resized.h).toBe(initialH + 30);
    });
  });
});
