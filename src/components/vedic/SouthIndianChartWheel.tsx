"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface Planet {
  name: string;
  zodiac_name: string;
}

interface Ascendant {
  zodiac_name: string;
}

interface ChartResponse {
  planets: Planet[];
  ascendant: Ascendant;
}

const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa",
  northtruenode: "Ra", northmeannode: "Ra",
  southtruenode: "Ke", southmeannode: "Ke",
  uranus: "Ur", neptune: "Ne", pluto: "Pl",
};

/**
 * Sign abbreviations, ported from yogatara-b2b's NorthIndianChart.tsx
 * signMap rather than a naive `.slice(0, 2)` - which was tried first here
 * and is wrong: it gives Cancer and Capricorn both "Ca", indistinguishable
 * in the corner label. This table is what disambiguates every sign to a
 * genuinely unique two letters.
 */
const SIGN_ABBR: Record<string, string> = {
  Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Cn", Leo: "Le", Virgo: "Vi",
  Libra: "Li", Scorpio: "Sc", Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
};

/**
 * South Indian style is the opposite of North Indian: SIGNS are fixed to
 * these twelve perimeter cells forever (Pisces always top-left, Virgo
 * always bottom-right); what moves chart to chart is which house number
 * and which planets land in each cell. Ported from yogatara-b2b's
 * SOUTH_INDIAN_CELL_SIGN (lib/dashboard/southIndian.ts) - a fixed mapping,
 * not something to recompute per chart.
 */
const CELL_SIGN = [
  "Pisces", "Aries", "Taurus", "Gemini",
  "Aquarius", "Cancer",
  "Capricorn", "Leo",
  "Sagittarius", "Scorpio", "Libra", "Virgo",
] as const;

const CELL_SIZE = 100;
/** Top-left corner of each of the 12 perimeter cells, in a 400x400 viewBox
 *  4x4 grid with the center 2x2 left empty. */
const PERIMETER: [number, number][] = [
  [0, 0], [CELL_SIZE, 0], [CELL_SIZE * 2, 0], [CELL_SIZE * 3, 0],
  [0, CELL_SIZE], [CELL_SIZE * 3, CELL_SIZE],
  [0, CELL_SIZE * 2], [CELL_SIZE * 3, CELL_SIZE * 2],
  [0, CELL_SIZE * 3], [CELL_SIZE, CELL_SIZE * 3],
  [CELL_SIZE * 2, CELL_SIZE * 3], [CELL_SIZE * 3, CELL_SIZE * 3],
];

export interface SouthIndianChartWheelProps extends BirthDetails, CommonProps {
  chartName?: string;
  ayanamsa?: string;
  size?: number;
  title?: string;
}

/**
 * The South Indian ("box") chart layout - fixed sign positions, a rotating
 * ascendant marker instead of a rotating house grid. Same data source as
 * NatalChartWheel (/api/astro/planet-positions/), different, genuinely
 * distinct geometry - not a restyle of the North Indian component.
 */
export function SouthIndianChartWheel({
  date,
  time,
  latitude,
  longitude,
  place,
  chartName = "RashiChart",
  ayanamsa = "LAHIRI",
  size = 360,
  title = "South Indian Chart",
  className,
}: SouthIndianChartWheelProps) {
  const state = useOccultQuery<ChartResponse>("astro/planet-positions", {
    chart_name: chartName,
    datetime: `${date}T${time}`,
    latitude,
    longitude,
    ayanamsa,
  });

  return (
    <Card title={title} subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const planetsBySign: Record<string, Planet[]> = {};
          for (const planet of data.planets) {
            (planetsBySign[planet.zodiac_name] ??= []).push(planet);
          }
          const ascendantSign = data.ascendant.zodiac_name;

          return (
            <svg
              viewBox="0 0 400 400"
              style={{ width: size, height: size, margin: "0 auto", display: "block" }}
              className="occult-wheel"
            >
              {CELL_SIGN.map((sign, i) => {
                const cell = PERIMETER[i];
                if (!cell) return null;
                const [x, y] = cell;
                const planets = planetsBySign[sign] ?? [];
                const isAscendant = sign === ascendantSign;
                return (
                  <g key={sign}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill="none"
                      stroke={isAscendant ? "var(--occult-accent)" : "var(--occult-border)"}
                      strokeWidth={isAscendant ? 1.5 : 0.6}
                    />
                    <text x={x + 4} y={y + 12} fontSize={7} fill="var(--occult-fg-muted)">
                      {SIGN_ABBR[sign] ?? sign.slice(0, 2)}
                    </text>
                    <text
                      x={x + CELL_SIZE / 2}
                      y={y + CELL_SIZE / 2 + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight={700}
                      fill="var(--occult-accent)"
                    >
                      {planets.map((p) => PLANET_ABBR[p.name] ?? p.name.slice(0, 2)).join(" ")}
                    </text>
                  </g>
                );
              })}
              <rect x={CELL_SIZE} y={CELL_SIZE} width={CELL_SIZE * 2} height={CELL_SIZE * 2} fill="none" stroke="var(--occult-border)" strokeWidth={0.6} />
              <text x={200} y={200} textAnchor="middle" fontSize={11} fill="var(--occult-fg-muted)">
                Rashi
              </text>
            </svg>
          );
        }}
      </StatusView>
    </Card>
  );
}
