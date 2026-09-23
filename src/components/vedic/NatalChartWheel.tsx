"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface Planet {
  name: string;
  longitude: number;
  zodiac_name: string;
  house: number;
}

interface Ascendant {
  zodiac_name: string;
}

interface ChartResponse {
  planets: Planet[];
  ascendant: Ascendant;
}

const ZODIAC_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa",
  northtruenode: "Ra", northmeannode: "Ra",
  southtruenode: "Ke", southmeannode: "Ke",
  uranus: "Ur", neptune: "Ne", pluto: "Pl",
};

/**
 * The classic North Indian ("diamond") chart layout: a fixed grid of 12
 * houses - kendras (1/4/7/10) as the four inner kites, the rest as the
 * eight corner triangles - with the ascendant's sign always in house 1 and
 * every other sign following in order. This exact polygon set
 * (HOUSE_POLYGONS below) is the one already live in panchang-web's
 * NorthIndianChart component; it is ported here rather than re-derived,
 * because a subtly-wrong chart geometry is a worse defect than no chart at
 * all, and this shape is already proven correct in production.
 */
const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 25,75 50,100",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 75,75 100,100",
  9: "100,100 75,75 100,50",
  10: "100,50 75,75 50,50 75,25",
  11: "100,50 75,25 100,0",
  12: "100,0 75,25 50,0",
};

/**
 * Percentage positions for the house-number and planet-list labels. Ported
 * verbatim from panchang-web's NorthIndianChart (`numberPositions` and
 * `planetPositions`), not re-tuned by eye here - a first attempt at
 * inventing these from scratch produced visibly overlapping labels, which
 * is exactly the outcome porting the already-validated tables avoids.
 */
const NUMBER_POS: Record<number, { top: string; left: string }> = {
  1: { top: "46%", left: "50%" },
  2: { top: "20%", left: "25%" },
  3: { top: "25%", left: "20%" },
  4: { top: "50%", left: "43%" },
  5: { top: "75%", left: "20%" },
  6: { top: "80%", left: "25%" },
  7: { top: "55%", left: "50%" },
  8: { top: "80%", left: "75%" },
  9: { top: "75%", left: "80%" },
  10: { top: "50%", left: "56%" },
  11: { top: "25%", left: "80%" },
  12: { top: "20%", left: "75%" },
};

/** Percentage position of the planet-list cluster within each house. */
const PLANET_POS: Record<number, { top: string; left: string }> = {
  1: { top: "15%", left: "50%" },
  2: { top: "10%", left: "21%" },
  3: { top: "25%", left: "12%" },
  4: { top: "60%", left: "23%" },
  5: { top: "75%", left: "12%" },
  6: { top: "90%", left: "25%" },
  7: { top: "65%", left: "50%" },
  8: { top: "90%", left: "75%" },
  9: { top: "78%", left: "88%" },
  10: { top: "50%", left: "76%" },
  11: { top: "25%", left: "88%" },
  12: { top: "10%", left: "74%" },
};

/**
 * `chart_name` -> display label, for every divisional chart the API's own
 * `chart_name` enum documents (seen on /api/astro/ashtakvarga/'s field
 * list, which is the one endpoint that publishes it - /api/astro/
 * planet-positions/ accepts the same values but doesn't enumerate them).
 * This is what lets one component be "the chart wheel" rather than one
 * component per division.
 */
const CHART_LABELS: Record<string, string> = {
  RashiChart: "Rashi (D-1)",
  BhavaChart: "Bhava",
  HoraChart: "Hora (D-2)",
  DrekkanaChart: "Drekkana (D-3)",
  ChaturthamsaChart: "Chaturthamsa (D-4)",
  PanchamsaChart: "Panchamsa (D-5)",
  ShashthamsaChart: "Shashthamsa (D-6)",
  SaptamsaChart: "Saptamsa (D-7)",
  AshtamsaChart: "Ashtamsa (D-8)",
  NavamsaChart: "Navamsa (D-9)",
  DasamsaChart: "Dasamsa (D-10)",
  RudramsaChart: "Rudramsa (D-11)",
  DwadasamsaChart: "Dwadasamsa (D-12)",
  ShodasamsaChart: "Shodasamsa (D-16)",
  VimsamsaChart: "Vimsamsa (D-20)",
  ChaturvimsamsaChart: "Chaturvimsamsa (D-24)",
  NakshatramsaChart: "Nakshatramsa (D-27)",
  TrimsamsaChart: "Trimsamsa (D-30)",
  KhavedamsaChart: "Khavedamsa (D-40)",
  AkshavedamsaChart: "Akshavedamsa (D-45)",
  ShashtyamsaChart: "Shashtyamsa (D-60)",
  NavnavamsaChart: "Navnavamsa (D-81)",
  NavnavamsaChartNew: "Navnavamsa (D-81)",
  AstottaramsaChart: "Astottaramsa (D-108)",
  AstottaramsaChartNew: "Astottaramsa (D-108)",
  DwadasdwadasamsaChart: "Dwadasdwadasamsa (D-144)",
  DwadasdwadasamsaChartNew: "Dwadasdwadasamsa (D-144)",
};

export interface NatalChartWheelProps extends BirthDetails, CommonProps {
  /**
   * Any value the API's `chart_name` accepts - "RashiChart" (D-1, the
   * default/natal chart) through "DwadasdwadasamsaChart" (D-144). Same
   * component, same geometry, different division - see CHART_LABELS for
   * the full list.
   */
  chartName?: string;
  ayanamsa?: string;
  /** Pixel size of the (square) chart. */
  size?: number;
  /** Overrides the auto-derived title (e.g. "Navamsa (D-9)" for chartName="NavamsaChart"). */
  title?: string;
}

function signNumber(name: string): number {
  return ZODIAC_ORDER.indexOf(name) + 1;
}

function normalizeSign(n: number): number {
  let v = n;
  while (v > 12) v -= 12;
  while (v < 1) v += 12;
  return v;
}

/**
 * The North Indian natal chart wheel - the diagram every Vedic astrology
 * site opens with. Positions come from /api/astro/planet-positions/
 * (verified live); the API does not render a diagram itself despite
 * documenting `render: "svg"` on that endpoint (tested - the field is
 * accepted but no svg ever comes back), so this draws it client-side
 * from the same plain numbers every other component in this library uses.
 */
export function NatalChartWheel({
  date,
  time,
  latitude,
  longitude,
  place,
  chartName = "RashiChart",
  ayanamsa = "LAHIRI",
  size = 360,
  title,
  className,
}: NatalChartWheelProps) {
  const state = useOccultQuery<ChartResponse>("astro/planet-positions", {
    chart_name: chartName,
    datetime: `${date}T${time}`,
    latitude,
    longitude,
    ayanamsa,
  });

  return (
    <Card title={title ?? CHART_LABELS[chartName] ?? chartName} subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const ascSign = signNumber(data.ascendant.zodiac_name);
          const signForHouse: Record<number, number> = {};
          for (let h = 1; h <= 12; h++) {
            signForHouse[h] = normalizeSign(ascSign + h - 1);
          }

          const planetsByHouse: Record<number, Planet[]> = {};
          for (const planet of data.planets) {
            const h = planet.house;
            if (!h || h < 1 || h > 12) continue;
            (planetsByHouse[h] ??= []).push(planet);
          }

          return (
            <div
              className="occult-wheel"
              style={{ position: "relative", width: size, height: size, margin: "0 auto" }}
            >
              <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <polygon
                  points="50,0 100,50 50,100 0,50"
                  fill="none"
                  stroke="var(--occult-border)"
                  strokeWidth="0.6"
                />
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--occult-border)" strokeWidth="0.6" />
                <line x1="0" y1="0" x2="100" y2="100" stroke="var(--occult-border)" strokeWidth="0.4" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="var(--occult-border)" strokeWidth="0.4" />
              </svg>

              {Object.entries(HOUSE_POLYGONS).map(([house]) => {
                const h = Number(house);
                const pos = NUMBER_POS[h] ?? { top: "50%", left: "50%" };
                return (
                  <div
                    key={`sign-${h}`}
                    style={{
                      position: "absolute",
                      top: pos.top,
                      left: pos.left,
                      transform: "translate(-50%, -50%)",
                      fontSize: "0.65rem",
                      color: "var(--occult-fg-muted)",
                    }}
                  >
                    {signForHouse[h]}
                  </div>
                );
              })}

              {Object.entries(HOUSE_POLYGONS).map(([house]) => {
                const h = Number(house);
                const pos = PLANET_POS[h] ?? { top: "50%", left: "50%" };
                const planets = planetsByHouse[h] ?? [];
                return (
                  <div
                    key={`planets-${h}`}
                    style={{
                      position: "absolute",
                      top: pos.top,
                      left: pos.left,
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "0 0.25rem",
                      width: "2.6rem",
                    }}
                  >
                    {planets.map((p) => (
                      <span
                        key={p.name}
                        style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--occult-accent)", whiteSpace: "nowrap" }}
                      >
                        {PLANET_ABBR[p.name] ?? p.name.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        }}
      </StatusView>
    </Card>
  );
}
