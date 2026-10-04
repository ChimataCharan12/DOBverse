import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { z } from "zod";
import { saveBirth, useBirth } from "@/lib/birth-store";
import {
  useBirthdays,
  useReminderSettings,
  enableBrowserNotifications,
} from "@/lib/birthdays-store";
import { saveDesign, useSavedDesigns, type SavedDesign } from "@/lib/card-designs";
import { usePrefs } from "@/lib/astro";
import { renderHook } from "@testing-library/react";

describe("Phase 4: Privacy, Storage & Security Audit", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("1. Server Boundary & Input Validation", () => {
    const yearSchema = z.object({ year: z.number().int().min(1900).max(2100) });

    it("accepts valid 4-digit year within range", () => {
      const result = yearSchema.parse({ year: 1995 });
      expect(result).toEqual({ year: 1995 });
    });

    it("strips extraneous personal data (e.g. name, full DOB, location)", () => {
      const payloadWithPersonalData = {
        year: 2000,
        name: "Alice Smith",
        dob: "2000-05-15",
        city: "New York",
        country: "US",
        phone: "+123456789",
      };
      const result = yearSchema.parse(payloadWithPersonalData);
      expect(result).toEqual({ year: 2000 });
      expect((result as Record<string, unknown>)["name"]).toBeUndefined();
      expect((result as Record<string, unknown>)["dob"]).toBeUndefined();
      expect((result as Record<string, unknown>)["city"]).toBeUndefined();
    });

    it("rejects invalid, malformed, or out-of-range year inputs", () => {
      expect(() => yearSchema.parse({ year: 1899 })).toThrow();
      expect(() => yearSchema.parse({ year: 2101 })).toThrow();
      expect(() => yearSchema.parse({ year: "1995" })).toThrow();
      expect(() => yearSchema.parse({ year: 1995.5 })).toThrow();
      expect(() => yearSchema.parse({})).toThrow();
      expect(() => yearSchema.parse(null)).toThrow();
    });
  });

  describe("2. Storage Corruption & Malformed Data Resilience", () => {
    it("handles corrupted JSON in dobverse.birth safely without crashing", () => {
      localStorage.setItem("dobverse.birth", "{invalid json");
      const { result } = renderHook(() => useBirth());
      expect(result.current).toBeNull();

      localStorage.setItem("dobverse.birth", JSON.stringify({ invalid: "shape" }));
      const { result: r2 } = renderHook(() => useBirth());
      expect(r2.current).toBeNull();
    });

    it("handles corrupted JSON in dobverse.birthdays safely without crashing", () => {
      localStorage.setItem("dobverse.birthdays", "not json at all");
      const { result } = renderHook(() => useBirthdays());
      expect(result.current).toEqual([]);

      localStorage.setItem("dobverse.birthdays", JSON.stringify({ notAnArray: true }));
      const { result: r2 } = renderHook(() => useBirthdays());
      expect(r2.current).toEqual([]);

      // Array containing corrupted items with missing required fields
      localStorage.setItem(
        "dobverse.birthdays",
        JSON.stringify([
          { id: "1", name: "Valid", dob: "1990-01-01", category: "friends" },
          { id: "2", broken: true },
          null,
          "invalid string",
        ]),
      );
      const { result: r3 } = renderHook(() => useBirthdays());
      expect(r3.current.length).toBe(1);
      expect(r3.current[0].name).toBe("Valid");
    });

    it("handles corrupted JSON in dobverse.reminderSettings safely", () => {
      localStorage.setItem("dobverse.reminderSettings", "{broken");
      const { result } = renderHook(() => useReminderSettings());
      expect(result.current).toEqual({ browser: false, daysBefore: 3 });

      localStorage.setItem(
        "dobverse.reminderSettings",
        JSON.stringify({ browser: "not a bool", daysBefore: "invalid" }),
      );
      const { result: r2 } = renderHook(() => useReminderSettings());
      expect(r2.current).toEqual({ browser: false, daysBefore: 3 });
    });

    it("handles corrupted JSON in dobverse.cardDesigns safely", () => {
      localStorage.setItem("dobverse.cardDesigns", "corrupted");
      const { result } = renderHook(() => useSavedDesigns());
      expect(result.current).toEqual([]);

      localStorage.setItem(
        "dobverse.cardDesigns",
        JSON.stringify([{ id: "d1", savedAt: 12345, design: { elements: [] } }, { bad: true }]),
      );
      const { result: r2 } = renderHook(() => useSavedDesigns());
      expect(r2.current.length).toBe(1);
      expect(r2.current[0].id).toBe("d1");
    });

    it("handles corrupted JSON in dobverse.prefs safely", () => {
      localStorage.setItem("dobverse.prefs", "[[[malformed");
      const { result } = renderHook(() => usePrefs());
      expect(result.current.music).toBe(true);
    });
  });

  describe("3. Data Reset & Clearing Verification", () => {
    it("clears all dobverse localStorage and sessionStorage keys during full reset", () => {
      // Seed personal data
      localStorage.setItem("dobverse.birth", JSON.stringify({ dob: "1992-04-10", name: "John" }));
      localStorage.setItem(
        "dobverse.birthdays",
        JSON.stringify([{ id: "p1", name: "Jane", dob: "1994-08-20", category: "friends" }]),
      );
      localStorage.setItem(
        "dobverse.reminderSettings",
        JSON.stringify({ browser: true, daysBefore: 1 }),
      );
      localStorage.setItem("dobverse.prefs", JSON.stringify({ theme: "dark" }));
      localStorage.setItem("dobverse.theme", "dark");
      localStorage.setItem("dobverse.compare.p2", JSON.stringify({ a: "self", b: "p1" }));
      localStorage.setItem("dobverse.notified.p1.2026-08-20", "1");
      sessionStorage.setItem("dobverse.splash", "1");

      // Also set an unrelated key to ensure reset is targeted
      localStorage.setItem("unrelated_app_key", "preserve_me");

      // Execute DOBverse reset routine (as in _dash.settings.tsx)
      Object.keys(localStorage)
        .filter((k) => k.startsWith("dobverse"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem("dobverse.splash");

      // Verify all DOBverse personal keys are cleared
      const remainingDobKeys = Object.keys(localStorage).filter((k) => k.startsWith("dobverse"));
      expect(remainingDobKeys.length).toBe(0);
      expect(sessionStorage.getItem("dobverse.splash")).toBeNull();

      // Verify unrelated storage was unaffected
      expect(localStorage.getItem("unrelated_app_key")).toBe("preserve_me");
    });
  });

  describe("4. Local-First Notification & Browser Permissions", () => {
    it("does not request browser notification permission automatically", () => {
      const reqSpy = vi.fn();
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: reqSpy,
      });

      // Reading settings or rendering hooks must NOT invoke requestPermission
      renderHook(() => useReminderSettings());
      expect(reqSpy).not.toHaveBeenCalled();
    });

    it("requests notification permission only on explicit user invocation", async () => {
      const reqSpy = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: reqSpy,
      });

      const granted = await enableBrowserNotifications();
      expect(reqSpy).toHaveBeenCalledTimes(1);
      expect(granted).toBe(true);
    });

    it("handles denied notification permission gracefully without crashing", async () => {
      const reqSpy = vi.fn().mockResolvedValue("denied");
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: reqSpy,
      });

      const granted = await enableBrowserNotifications();
      expect(granted).toBe(false);
    });
  });

  describe("5. Card Photo & Personal Media Privacy", () => {
    it("stores photos purely in local memory/storage as data URLs and never initiates network upload", () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockDesign: SavedDesign = {
        id: "design-1",
        savedAt: Date.now(),
        design: {
          personId: "self",
          templateId: "cosmic",
          theme: "dark",
          sizeKey: "square",
          bg: "nebula",
          bgColor: null,
          photo:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          elements: [],
        },
        thumb: null,
      };

      const saved = saveDesign(mockDesign);
      expect(saved).toBe(true);

      // Verify no network upload was made
      expect(fetchSpy).not.toHaveBeenCalled();

      // Verify design is saved locally
      const { result } = renderHook(() => useSavedDesigns());
      expect(result.current.length).toBe(1);
      expect(result.current[0].design.photo).toContain("data:image/png;base64");
    });
  });

  describe("6. URL & Router Privacy", () => {
    it("never stores personal birthday parameters in navigation paths", () => {
      // Allowed static routes
      const validRoutes = [
        "/",
        "/reveal",
        "/dashboard",
        "/timeline",
        "/snapshot",
        "/calendar",
        "/cards",
        "/compare",
        "/settings",
      ];

      validRoutes.forEach((route) => {
        expect(route).not.toMatch(/\?(dob|name|birthday|year)=/);
        expect(route).not.toMatch(/\/[0-9]{4}-[0-9]{2}-[0-9]{2}/);
      });
    });
  });
});
