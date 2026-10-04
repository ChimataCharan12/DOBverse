export type Item = { title: string; sub: string; image?: string | null; source?: string };

export type BirthYearSnapshot = {
  year: number;
  world: {
    population: number | null;
    gdp: number | null;
    internetUsers: number | null;
    lifeExpectancy: number | null;
  };
  popularPhone: Item | null;
  popularMovie: Item | null;
  topSong: Item | null;
  popularTechnology: Item | null;
  bestSellingCar: Item | null;
  topTVShow: Item | null;
  worldLeaders: { name: string; role: string }[];
  sportsChampions: Item[];
  breakthroughs: string[];
  economy: {
    growth: { year: number; value: number }[];
    current: number | null;
    indiaGrowth: number | null;
  };
  india: { incumbents: string[]; events: string[] } | null;
  funFact: string | null;
  timeline: { month: string; text: string }[];
};
