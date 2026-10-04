import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { BirthYearSnapshot } from "./types";

export const fetchBirthYearSnapshot = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ year: z.number().int().min(1900).max(2100) }).parse(d))
  .handler(async ({ data }): Promise<BirthYearSnapshot> => {
    const { getBirthYearSnapshot } = await import("./snapshot.server");
    return getBirthYearSnapshot(data.year);
  });

export const birthYearQuery = (year: number) =>
  queryOptions({
    queryKey: ["birth-year-snapshot", year],
    queryFn: () => fetchBirthYearSnapshot({ data: { year } }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
