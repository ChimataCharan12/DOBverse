import type { BirthYearSnapshot, Item } from "./types";
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
  WIKI_TITLE,
  WIMBLEDON,
} from "./curated";
import {
  bullets,
  clean,
  firstWikiImage,
  leaders,
  section,
  wikiImage,
  wikiSummary,
  wikitext,
  worldBankSeries,
} from "./sources.server";

const cache = new Map<number, Promise<BirthYearSnapshot>>();
const MAX_CACHE_SIZE = 100;

export function getBirthYearSnapshot(year: number) {
  const safeYear = Math.max(1900, Math.min(2100, Math.floor(year)));
  let p = cache.get(safeYear);
  if (!p) {
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    p = build(safeYear).catch((e) => {
      cache.delete(safeYear);
      throw e;
    });
    cache.set(safeYear, p);
  }
  return p;
}

const at = (s: { year: number; value: number }[], y: number) =>
  s.find((r) => r.year === y)?.value ?? null;

function sentences(text: string | null, n: number) {
  if (!text) return [];
  return clean(text.replace(/\n+/g, " "))
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((s) => /^[A-Z]/.test(s) && !s.includes("]]") && s.length > 30 && s.length < 260)
    .slice(0, n);
}

async function build(year: number): Promise<BirthYearSnapshot> {
  const [pop, gdp, net, life, wGrowth, inGrowth, yearWiki, indiaWiki, summary, ldrs] =
    await Promise.all([
      worldBankSeries("WLD", "SP.POP.TOTL", year, year).catch(() => []),
      worldBankSeries("WLD", "NY.GDP.MKTP.CD", year, year).catch(() => []),
      worldBankSeries("WLD", "IT.NET.USER.ZS", year, year).catch(() => []),
      worldBankSeries("WLD", "SP.DYN.LE00.IN", year, year).catch(() => []),
      worldBankSeries("WLD", "NY.GDP.MKTP.KD.ZG", year - 9, year).catch(() => []),
      worldBankSeries("IND", "NY.GDP.MKTP.KD.ZG", year, year).catch(() => []),
      wikitext(String(year)).catch(() => null),
      wikitext(`${year} in India`).catch(() => null),
      wikiSummary(String(year)).catch(() => null),
      leaders(year).catch(() => []),
    ]);

  // Lead images from the exact Wikipedia article for each curated item (validated by article description).
  const film = TOP_FILM[year],
    song = TOP_SONG[year],
    phone = PHONE[year],
    tech = TECH[year],
    car = CAR_US[year],
    tv = TV_NIELSEN[year];
  const artist = song?.[1].split(/ feat\.| &|,/)[0].trim();
  const [filmImg, songImg, phoneImg, techImg, carImg, tvImg] = await Promise.all([
    film
      ? firstWikiImage([`${film} (${year} film)`, `${film} (film)`, film], /film/i).catch(
          () => null,
        )
      : null,
    artist
      ? firstWikiImage(
          [artist],
          /singer|rapper|band|musician|duo|group|songwriter|DJ|producer/i,
        ).catch(() => null)
      : null,
    phone ? wikiImage(WIKI_TITLE[phone[0]] ?? phone[0]).catch(() => null) : null,
    tech ? wikiImage(WIKI_TITLE[tech[0]] ?? tech[0]).catch(() => null) : null,
    car ? wikiImage(car, /car|automobile|vehicle/i).catch(() => null) : null,
    tv
      ? wikiImage(tv[1], /television|TV|series|show|broadcast|programme|program/i).catch(() => null)
      : null,
  ]);

  const population = at(pop, year);
  const netPct = at(net, year);

  // Timeline: first notable event of each month from the Wikipedia year article.
  const ev = yearWiki ? bullets(section(yearWiki, /^Events$/i) ?? "") : [];
  const byMonth = new Map<string, string>();
  for (const e of ev) if (e.month && !byMonth.has(e.month)) byMonth.set(e.month, e.text);
  const timeline = [...byMonth.entries()].map(([month, text]) => ({
    month: month.slice(0, 3),
    text,
  }));

  // India: incumbents + events.
  let india: BirthYearSnapshot["india"] = null;
  if (indiaWiki) {
    const inc = bullets(section(indiaWiki, /^Incumbents$/i) ?? "")
      .map((b) => b.text)
      .filter((t) => /^(President|Vice President|Prime Minister|Chief Justice)/i.test(t))
      .slice(0, 2);
    const events = bullets(section(indiaWiki, /^Events$/i) ?? "")
      .map((b) => b.text)
      .filter((t) => t.length < 220 && !/^National income/i.test(t))
      .slice(0, 4);
    if (inc.length || events.length) india = { incumbents: inc, events };
  }
  const inG = at(inGrowth, year);

  // Breakthroughs from the Science/Technology overview on the year article.
  const sci = yearWiki
    ? [
        ...sentences(section(yearWiki, /^Science$/i), 2),
        ...sentences(section(yearWiki, /^Technology$/i), 1),
      ]
    : [];
  const breakthroughs = sci.length
    ? sci.slice(0, 3)
    : ev
        .filter((e) => /launch|discover|scien|space|NASA|genome|first/i.test(e.text))
        .slice(0, 3)
        .map((e) => e.text);

  const sports: Item[] = [];
  if (FIFA_WC[year]) sports.push({ title: "FIFA World Cup", sub: FIFA_WC[year] });
  if (F1[year]) sports.push({ title: "Formula 1", sub: F1[year] });
  if (WIMBLEDON[year]) sports.push({ title: "Wimbledon (Men's)", sub: WIMBLEDON[year] });
  if (NBA[year]) sports.push({ title: "NBA Champions", sub: NBA[year] });

  const growth = wGrowth.map((r) => ({ year: r.year, value: Number(r.value.toFixed(2)) }));

  return {
    year,
    world: {
      population,
      gdp: at(gdp, year),
      internetUsers: population != null && netPct != null ? (population * netPct) / 100 : null,
      lifeExpectancy: at(life, year),
    },
    popularPhone: phone ? { title: phone[0], sub: phone[1], image: phoneImg } : null,
    popularMovie: film
      ? { title: film, sub: "Highest-grossing film of the year worldwide.", image: filmImg }
      : null,
    topSong: song ? { title: song[0], sub: song[1], image: songImg } : null,
    popularTechnology: tech ? { title: tech[0], sub: tech[1], image: techImg } : null,
    bestSellingCar: car
      ? {
          title: car,
          sub: "Best-selling passenger car in the United States that year.",
          image: carImg,
          source: "US annual sales",
        }
      : null,
    topTVShow: tv
      ? {
          title: tv[0],
          sub: `#1 US primetime series of the ${year}–${String(year + 1).slice(2)} TV season.`,
          image: tvImg,
          source: "Nielsen ratings",
        }
      : null,
    worldLeaders: ldrs,
    sportsChampions: sports,
    breakthroughs,
    economy: { growth, current: at(wGrowth, year), indiaGrowth: inG },
    india,
    funFact: pickFact(yearWiki, summary),
    timeline,
  };
}

function pickFact(wiki: string | null, summary: string | null): string | null {
  const intro = wiki ? clean(wiki.split(/\n==/)[0].replace(/\{\{[\s\S]*?\}\}/g, "")) : "";
  const s = intro
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .find((x) => /International Year|designated|declared/i.test(x) && x.length < 300);
  if (s) return s;
  return summary ? summary.split(/(?<=\.)\s/)[0] : null;
}
