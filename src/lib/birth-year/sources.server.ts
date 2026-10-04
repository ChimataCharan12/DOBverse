// Server-only fetchers for public historical datasets (no API keys required).
const UA = { "User-Agent": "DOBverse/1.0 (birth-year snapshot)", "Api-User-Agent": "DOBverse/1.0" };
const FETCH_TIMEOUT_MS = 6000;

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      ...init,
      signal: init?.signal || controller.signal,
      headers: { ...UA, ...(init?.headers || {}) },
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- World Bank ---------------- */
type WBRow = { date?: string; value?: number | null };
export async function worldBankSeries(
  country: string,
  indicator: string,
  from: number,
  to: number,
) {
  try {
    const j = await getJson<[unknown, WBRow[] | null]>(
      `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${from}:${to}&format=json&per_page=100`,
    );
    const rows = Array.isArray(j?.[1]) ? j![1] : [];
    return rows
      .filter(
        (r): r is { date: string; value: number } =>
          typeof r?.value === "number" && !isNaN(r.value) && typeof r?.date === "string",
      )
      .map((r) => ({ year: Number(r.date), value: r.value }))
      .filter((r) => !isNaN(r.year))
      .sort((a, b) => a.year - b.year);
  } catch {
    return [];
  }
}

/* ---------------- Wikipedia ---------------- */
export async function wikitext(page: string): Promise<string | null> {
  const j = await getJson<{ parse?: { wikitext: string } }>(
    `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2&redirects=1`,
  );
  return j?.parse?.wikitext ?? null;
}

export async function wikiSummary(page: string): Promise<string | null> {
  const j = await getJson<{ extract?: string }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`,
  );
  return j?.extract ?? null;
}

/** Strip wiki markup to readable plain text. */
export function clean(s: string): string {
  let t = s;
  t = t.replace(/<ref[^>]*\/>/g, "").replace(/<ref[\s\S]*?<\/ref>/g, "");
  for (let i = 0; i < 4; i++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  t = t.replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, "");
  t = t.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2").replace(/\[\[([^\]]*)\]\]/g, "$1");
  t = t.replace(/\[https?:[^\s\]]+\s?([^\]]*)\]/g, "$1");
  t = t
    .replace(/<[^>]+>/g, "")
    .replace(/'''?/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&");
  return t
    .replace(/\s+/g, " ")
    .replace(/^[\s*:–-]+/, "")
    .trim();
}

/** Return the text of a section whose heading matches `name`, until the next heading of same or higher level. */
export function section(text: string, name: RegExp): string | null {
  const lines = text.split("\n");
  let start = -1,
    level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(=+)\s*(.*?)\s*\1\s*$/);
    if (!m) continue;
    if (start === -1) {
      if (name.test(m[2])) {
        start = i + 1;
        level = m[1].length;
      }
    } else if (m[1].length <= level) {
      return lines.slice(start, i).join("\n");
    }
  }
  return start === -1 ? null : lines.slice(start).join("\n");
}

const MONTH_RE =
  /^(January|February|March|April|May|June|July|August|September|October|November|December)/;

/** Parse top-level "*" bullet events with an optional month. */
export function bullets(text: string) {
  const out: { month?: string; text: string }[] = [];
  let currentMonth: string | undefined;
  let parentMonth: string | undefined;
  for (const raw of text.split("\n")) {
    const h = raw.match(/^=+\s*(.*?)\s*=+$/);
    if (h) {
      const mm = h[1].match(MONTH_RE);
      currentMonth = mm?.[1];
      continue;
    }
    if (!/^\*/.test(raw)) continue;
    const nested = /^\*\*/.test(raw);
    const body = raw.replace(/^\*+\s*/, "");
    const dateMatch = body.match(
      /^\[\[((?:January|February|March|April|May|June|July|August|September|October|November|December)[^\]|]*)(?:\|[^\]]*)?\]\]\s*(?:[–-]\s*)?(.*)$/,
    );
    let month = currentMonth;
    let rest = body;
    if (dateMatch) {
      month = dateMatch[1].match(MONTH_RE)?.[1];
      rest = dateMatch[2];
      if (!nested) parentMonth = month;
    } else if (nested) month = parentMonth ?? currentMonth;
    const t = clean(rest);
    if (t.length > 12 && !/^(thumb|upright)/i.test(t)) out.push({ month, text: t });
  }
  return out;
}

/* ---------------- Wikidata (world leaders) ---------------- */
export async function leaders(year: number) {
  const offices: Record<string, string> = {
    Q11696: "President of the USA",
    Q14211: "Prime Minister of the UK",
    Q218295: "President of Russia",
  };
  try {
    const q = `SELECT ?pos ?pLabel ?s WHERE {
      VALUES ?pos { wd:Q11696 wd:Q14211 wd:Q218295 }
      ?p wdt:P31 wd:Q5 ; p:P39 ?st . ?st ps:P39 ?pos ; pq:P580 ?s . OPTIONAL { ?st pq:P582 ?e }
      FILTER(YEAR(?s) <= ${year} && (!BOUND(?e) || YEAR(?e) >= ${year}))
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }`;
    const j = await getJson<{
      results?: {
        bindings?: {
          pos?: { value?: string };
          pLabel?: { value?: string };
          s?: { value?: string };
        }[];
      };
    }>(`https://query.wikidata.org/sparql?query=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/sparql-results+json" },
    });
    const bindings = Array.isArray(j?.results?.bindings) ? j!.results!.bindings! : [];
    if (!bindings.length) return [];
    const seen = new Map<string, { name: string; role: string; start: string }[]>();
    for (const b of bindings) {
      const posVal = b?.pos?.value;
      const name = b?.pLabel?.value;
      const start = b?.s?.value ?? "";
      if (!posVal || !name || /^Q\d+$/.test(name)) continue;
      const id = posVal.split("/").pop();
      if (!id || !offices[id]) continue;
      const arr = seen.get(id) ?? [];
      if (!arr.some((x) => x.name === name)) arr.push({ name, role: offices[id], start });
      seen.set(id, arr);
    }
    return Object.keys(offices).flatMap((id) =>
      (seen.get(id) ?? [])
        .sort((a, b) => a.start.localeCompare(b.start))
        .map(({ name, role }) => ({ name, role })),
    );
  } catch {
    return [];
  }
}

/** Lead image of a specific Wikipedia article (Wikimedia Commons thumbnail). Null for disambiguation pages or no image. */
export async function wikiImage(
  page: string | null | undefined,
  mustMatch?: RegExp,
): Promise<string | null> {
  if (!page) return null;
  const j = await getJson<{ type?: string; description?: string; thumbnail?: { source: string } }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.replace(/ /g, "_"))}`,
  );
  if (!j || j.type === "disambiguation") return null;
  if (mustMatch && !mustMatch.test(j.description ?? "")) return null;
  return j.thumbnail?.source ?? null;
}

/** Try several candidate article titles; first one with a matching lead image wins. */
export async function firstWikiImage(pages: string[], mustMatch?: RegExp) {
  for (const p of pages) {
    const img = await wikiImage(p, mustMatch);
    if (img) return img;
  }
  return null;
}
