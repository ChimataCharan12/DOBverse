import { describe, expect, it, vi } from "vitest";
import {
  CAR_US,
  F1,
  FIFA_WC,
  NBA,
  PHONE,
  TECH,
  TOP_FILM,
  TOP_SONG,
  TV_NIELSEN,
  WIMBLEDON,
} from "@/lib/birth-year/curated";
import { bullets, clean, section } from "@/lib/birth-year/sources.server";
import { getBirthYearSnapshot } from "@/lib/birth-year/snapshot.server";

describe("Historical Data & Birth Year Snapshot Reliability", () => {
  describe("Curated Data Range and Integrity", () => {
    it("returns correct curated data for supported historical years", () => {
      // 1995
      expect(TOP_FILM[1995]).toBe("Die Hard with a Vengeance");
      expect(TOP_SONG[1995]?.[0]).toBe("Gangsta's Paradise");
      expect(TECH[1995]?.[0]).toBe("Windows 95");
      expect(CAR_US[1995]).toBe("Ford Taurus");
      expect(TV_NIELSEN[1995]?.[0]).toBe("ER");

      // 2000
      expect(TOP_FILM[2000]).toBe("Mission: Impossible 2");
      expect(TOP_SONG[2000]?.[0]).toBe("Breathe");
      expect(CAR_US[2000]).toBe("Toyota Camry");
      expect(TV_NIELSEN[2000]?.[0]).toBe("Survivor");

      // 2010
      expect(TOP_FILM[2010]).toBe("Toy Story 3");
      expect(TOP_SONG[2010]?.[0]).toBe("Tik Tok");
      expect(TECH[2010]?.[0]).toBe("iPad & Instagram");
    });

    it("returns undefined for unsupported/unlisted years without fabricating", () => {
      expect(TOP_FILM[1850]).toBeUndefined();
      expect(TOP_SONG[1850]).toBeUndefined();
      expect(TECH[1850]).toBeUndefined();
      expect(CAR_US[1850]).toBeUndefined();
      expect(TV_NIELSEN[1850]).toBeUndefined();
      expect(FIFA_WC[1900]).toBeUndefined();
      expect(F1[1900]).toBeUndefined();
      expect(WIMBLEDON[1800]).toBeUndefined();
      expect(NBA[1900]).toBeUndefined();
    });
  });

  describe("Wikitext Parsing & Cleaning", () => {
    it("cleans wiki markup thoroughly into plain readable text", () => {
      const raw =
        "'''Titanic''' is a 1997 American [[epic film|epic]] [[romance film|romance]]<ref>Some citation</ref>&ndash;directed by [[James Cameron]].";
      const cleaned = clean(raw);
      expect(cleaned).toBe("Titanic is a 1997 American epic romance–directed by James Cameron.");
      expect(cleaned).not.toContain("<ref>");
      expect(cleaned).not.toContain("[[");
      expect(cleaned).not.toContain("]]");
    });

    it("extracts sections correctly by heading", () => {
      const page = `== Overview ==
Some overview text here.
== Events ==
* January 1 – New Year celebration.
* February 14 – Valentine's Day.
== Deaths ==
* John Doe
`;
      const eventsSection = section(page, /^Events$/i);
      expect(eventsSection).toContain("* January 1 – New Year celebration.");
      expect(eventsSection).toContain("* February 14 – Valentine's Day.");
      expect(eventsSection).not.toContain("== Deaths ==");
      expect(eventsSection).not.toContain("== Overview ==");
    });

    it("parses event bullets with months cleanly", () => {
      const eventText = `
* [[January 15]] – Wikipedia goes online.
* [[July 20]] – A historic milestone achieved.
`;
      const parsed = bullets(eventText);
      expect(parsed.length).toBe(2);
      expect(parsed[0].month).toBe("January");
      expect(parsed[0].text).toContain("Wikipedia goes online");
      expect(parsed[1].month).toBe("July");
      expect(parsed[1].text).toContain("A historic milestone achieved");
    });
  });

  describe("Snapshot Pipeline & Error Isolation", () => {
    it("builds a complete snapshot object with all expected fields for a valid year", async () => {
      // Mock global fetch to return deterministic responses for test
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("api.worldbank.org")) {
          return {
            ok: true,
            json: async () => [
              { page: 1 },
              [
                { date: "2000", value: 6143493800 },
                { date: "1999", value: 6064239000 },
              ],
            ],
          };
        }
        if (url.includes("query.wikidata.org")) {
          return {
            ok: true,
            json: async () => ({
              results: {
                bindings: [
                  {
                    pos: { value: "http://www.wikidata.org/entity/Q11696" },
                    pLabel: { value: "Bill Clinton" },
                    s: { value: "1993-01-20" },
                  },
                ],
              },
            }),
          };
        }
        if (url.includes("en.wikipedia.org/w/api.php")) {
          return {
            ok: true,
            json: async () => ({
              parse: {
                wikitext: "== Events ==\n* [[January 1]] – Millennium celebrations worldwide.",
              },
            }),
          };
        }
        if (url.includes("en.wikipedia.org/api/rest_v1/page/summary")) {
          return {
            ok: true,
            json: async () => ({
              extract: "2000 was a leap year starting on Saturday.",
              thumbnail: { source: "https://example.com/thumb.jpg" },
            }),
          };
        }
        return { ok: false };
      });

      try {
        const snap = await getBirthYearSnapshot(2000);
        expect(snap.year).toBe(2000);
        expect(snap.world.population).toBe(6143493800);
        expect(snap.worldLeaders.length).toBeGreaterThanOrEqual(1);
        expect(snap.worldLeaders[0].name).toBe("Bill Clinton");
        expect(snap.popularMovie?.title).toBe("Mission: Impossible 2");
        expect(snap.topSong?.title).toBe("Breathe");
        expect(snap.timeline.length).toBeGreaterThanOrEqual(1);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("survives partial API failures gracefully without crashing", async () => {
      const originalFetch = globalThis.fetch;
      // Simulate World Bank failure and Wikidata failure
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("api.worldbank.org") || url.includes("query.wikidata.org")) {
          return { ok: false, status: 500 };
        }
        return {
          ok: true,
          json: async () => ({
            parse: { wikitext: "== Events ==\n* [[March 1]] – Sample event" },
            extract: "1994 was a regular year.",
          }),
        };
      });

      try {
        const snap = await getBirthYearSnapshot(1994);
        expect(snap.year).toBe(1994);
        // World bank unavailable
        expect(snap.world.population).toBeNull();
        expect(snap.world.gdp).toBeNull();
        // Wikidata unavailable
        expect(snap.worldLeaders).toEqual([]);
        // Curated data still available
        expect(snap.popularMovie?.title).toBe("The Lion King");
        expect(snap.topSong?.title).toBe("The Sign");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
