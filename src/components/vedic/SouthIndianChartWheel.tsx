"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";
import {
  CHART_COLOR,
  CHART_LABELS,
  ItemBlock,
  VIEWBOX,
  chartItem,
  planetAbbr,
  type ChartItem,
} from "./chartShared";

interface Planet {
  name: string;
  longitude: number;
  zodiac_name: string;
  nakshatra?: string;
}

interface Ascendant {
  zodiac_name: string;
  longitude?: number;
}

interface ChartResponse {
  planets: Planet[];
  ascendant: Ascendant;
}

/**
 * South Indian style is the opposite of North Indian: SIGNS are fixed to
 * these twelve perimeter cells forever (Pisces always top-left, Virgo
 * always bottom-right); what moves chart to chart is which planets land in
 * each cell. Ported from yogatara-b2b's SOUTH_INDIAN_CELL_SIGN
 * (lib/dashboard/southIndian.ts) - a fixed mapping, not something to
 * recompute per chart. Like Yogatara, the cells carry no sign labels: the
 * layout itself says which sign each one is.
 */
const CELL_SIGN = [
  "Pisces", "Aries", "Taurus", "Gemini",
  "Aquarius", "Cancer",
  "Capricorn", "Leo",
  "Sagittarius", "Scorpio", "Libra", "Virgo",
] as const;

const CELL = 75;

/** Top-left corner of each perimeter cell on the 300x300 grid, in CELL_SIGN
 *  order: clockwise from Pisces in the top-left, the centre 2x2 left empty. */
const PERIMETER: [number, number][] = [
  [0, 0], [CELL, 0], [CELL * 2, 0], [CELL * 3, 0],
  [0, CELL], [CELL * 3, CELL],
  [0, CELL * 2], [CELL * 3, CELL * 2],
  [0, CELL * 3], [CELL, CELL * 3], [CELL * 2, CELL * 3], [CELL * 3, CELL * 3],
];

/** Yogatara draws on 1000x1000; this grid is 300x300. */
const K = 0.3;
const LINE_WIDTH = 2 * K;

/**
 * Yogatara's cell font: 34 units, stepped down by how many characters the
 * cell holds so a crowded sign stays inside its box, never below 16.
 */
function cellFontSize(items: ChartItem[]): number {
  // Counted Yogatara's way: abbreviation + 4 for " 29°" + 7 for " (Ash)".
  const chars = items.reduce((n, item) => {
    const abbr = item.text.split(" ")[0] ?? "";
    return n + abbr.length + (item.text.includes("°") ? 4 : 0) + (item.text.includes("(") ? 7 : 0);
  }, 0);
  let fs = 34;
  if (chars > 60) fs *= 0.55;
  else if (chars > 45) fs *= 0.65;
  else if (chars > 30) fs *= 0.75;
  else if (chars > 20) fs *= 0.82;
  else if (chars > 12) fs *= 0.9;
  else if (chars > 6) fs *= 0.95;
  return Math.max(16, Math.round(fs)) * K;
}

/** Yogatara's centre label: "Rashi" for the natal chart, else the division's name. */
function centreLabel(chartName: string): string {
  return (CHART_LABELS[chartName] ?? chartName).replace(/\s*\(.*\)$/, "");
}

export interface SouthIndianChartWheelProps extends BirthDetails, CommonProps {
  chartName?: string;
  ayanamsa?: string;
  size?: number;
  title?: string;
}

/**
 * The South Indian ("box") chart layout, drawn the way yogatara-b2b draws
 * it - fixed sign positions, the ascendant written into its sign's cell as
 * "AS", the chart's name in the empty centre. Same data source as
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
          // Ascendant first, then planets - Yogatara's KIND_ORDER.
          const itemsBySign: Record<string, ChartItem[]> = {};
          const asc = data.ascendant;
          if (asc.zodiac_name) {
            itemsBySign[asc.zodiac_name] = [
              chartItem("asc", "AS", asc.longitude ?? NaN, asc.zodiac_name, CHART_COLOR.ascendant),
            ];
          }
          for (const planet of data.planets) {
            if (!planet.zodiac_name) continue;
            (itemsBySign[planet.zodiac_name] ??= []).push(
              chartItem(planet.name, planetAbbr(planet.name), planet.longitude, planet.zodiac_name, CHART_COLOR.planet, planet.nakshatra),
            );
          }

          const label = centreLabel(chartName);
          const labelSize = (label.length > 10 ? 35 : label.length > 6 ? 40 : 50) * K;

          return (
            <svg
              viewBox={VIEWBOX}
              className="occult-wheel"
              role="img"
              aria-label="South Indian chart"
              style={{ display: "block", width: "100%", maxWidth: size, height: "auto", margin: "0 auto" }}
            >
              <rect
                x={K}
                y={K}
                width={300 - 2 * K}
                height={300 - 2 * K}
                rx={20 * K}
                fill="none"
                stroke={CHART_COLOR.line}
                strokeWidth={LINE_WIDTH}
              />
              {CELL_SIGN.map((sign, i) => {
                const cell = PERIMETER[i];
                if (!cell) return null;
                const [x, y] = cell;
                const items = itemsBySign[sign] ?? [];
                return (
                  <g key={sign}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL}
                      height={CELL}
                      fill="none"
                      stroke={CHART_COLOR.line}
                      strokeWidth={LINE_WIDTH}
                    />
                    <ItemBlock
                      items={items}
                      x={x + CELL / 2}
                      y={y + CELL / 2}
                      anchor="middle"
                      maxWidth={69}
                      maxHeight={70}
                      fontSize={cellFontSize(items)}
                      minFontSize={16 * K}
                      lineHeight={1.1}
                      rowGap={4 * K}
                      itemGap={8 * K}
                    />
                  </g>
                );
              })}
              <rect
                x={CELL}
                y={CELL}
                width={CELL * 2}
                height={CELL * 2}
                fill="none"
                stroke={CHART_COLOR.line}
                strokeWidth={LINE_WIDTH}
              />
              <text
                x={150}
                y={150}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={labelSize}
                fontWeight={400}
                style={{ fill: CHART_COLOR.label }}
              >
                {label.length > 14 ? (
                  <>
                    <tspan x={150} dy="-0.6em">{label.slice(0, 14)}</tspan>
                    <tspan x={150} dy="1.2em">{label.slice(14)}</tspan>
                  </>
                ) : (
                  label
                )}
              </text>
            </svg>
          );
        }}
      </StatusView>
    </Card>
  );
}
