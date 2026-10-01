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
  signNumber,
  type ChartItem,
} from "./chartShared";

interface Planet {
  name: string;
  longitude: number;
  zodiac_name: string;
  house?: number | string;
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
 * Where yogatara-b2b's NorthIndianChart puts things, converted from its
 * percentages to this 300x300 grid. Houses are fixed - house 1 the top
 * diamond, running counter-clockwise (4 left, 7 bottom, 10 right) - and
 * each shows the number of the sign in it.
 *
 * - `sign`: the sign number, next to the chart's centre point.
 * - `single`: centre of the planet cluster when the house holds one item.
 * - `top`: where a cluster of two or more starts; it then grows downward.
 * - `room` / `width`: how far it may grow, and how wide one line may be,
 *   before the text is shrunk to fit.
 *
 * Two small departures from Yogatara, so a full label ("Ra 14° (Shr)")
 * cannot run over a line or a sign number: house 1's cluster starts a
 * little lower (the diamond is narrow at its tip), and the side triangles'
 * clusters sit 4 units further out with a narrower line.
 */
const HOUSES: { sign: [number, number]; single: [number, number]; top: number; room: number; width: number }[] = [
  { sign: [150, 138], single: [150, 45], top: 28, room: 100, width: 64 },
  { sign: [75, 60], single: [63, 30], top: 6, room: 50, width: 60 },
  { sign: [60, 75], single: [32, 75], top: 58, room: 36, width: 44 },
  { sign: [129, 150], single: [69, 180], top: 132, room: 82, width: 64 },
  { sign: [60, 225], single: [32, 225], top: 208, room: 36, width: 44 },
  { sign: [75, 240], single: [75, 270], top: 246, room: 50, width: 60 },
  { sign: [150, 165], single: [150, 195], top: 189, room: 106, width: 64 },
  { sign: [225, 240], single: [225, 270], top: 246, room: 50, width: 60 },
  { sign: [240, 225], single: [268, 234], top: 208, room: 36, width: 44 },
  { sign: [168, 150], single: [228, 150], top: 132, room: 82, width: 64 },
  { sign: [240, 75], single: [268, 75], top: 58, room: 36, width: 44 },
  { sign: [225, 60], single: [222, 30], top: 6, room: 50, width: 60 },
];

/** Yogatara's planet text: bold, 2.8% of the chart width, line-height 1.05. */
const FONT = 8.4;
/** The cluster's top padding (Tailwind p-1 at the reference size). */
const CLUSTER_PAD = 3.3;

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

function normalizeSign(n: number): number {
  let v = n;
  while (v > 12) v -= 12;
  while (v < 1) v += 12;
  return v;
}

/** The API's house when it sends one, else counted from the ascendant sign. */
function houseOf(planet: Planet, ascSign: number): number {
  const h = typeof planet.house === "string" ? parseInt(planet.house, 10) : planet.house;
  if (typeof h === "number" && h >= 1 && h <= 12) return h;
  const s = signNumber(planet.zodiac_name);
  return s && ascSign ? normalizeSign(s - ascSign + 1) : 0;
}

/**
 * The North Indian natal chart wheel - the diagram every Vedic astrology
 * site opens with, drawn the way yogatara-b2b draws it. Positions come from
 * /api/astro/planet-positions/ (verified live); the API does not render a
 * diagram itself despite documenting `render: "svg"` on that endpoint
 * (tested - the field is accepted but no svg ever comes back), so this
 * draws it client-side from the same plain numbers every other component
 * in this library uses.
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

          // Yogatara puts the ascendant first in house 1 ("As 27° (Chi)"),
          // then the planets in API order.
          const itemsByHouse: Record<number, ChartItem[]> = {};
          if (ascSign) {
            itemsByHouse[1] = [
              chartItem("asc", "As", data.ascendant.longitude ?? NaN, data.ascendant.zodiac_name, CHART_COLOR.ascendant),
            ];
          }
          for (const planet of data.planets) {
            const h = houseOf(planet, ascSign);
            if (!h) continue;
            (itemsByHouse[h] ??= []).push(
              chartItem(planet.name, planetAbbr(planet.name), planet.longitude, planet.zodiac_name, CHART_COLOR.planet, planet.nakshatra),
            );
          }

          return (
            <svg
              viewBox={VIEWBOX}
              className="occult-wheel"
              role="img"
              aria-label={`${CHART_LABELS[chartName] ?? chartName}, North Indian style`}
              style={{ display: "block", width: "100%", maxWidth: size, height: "auto", margin: "0 auto" }}
            >
              <rect x={0} y={0} width={300} height={300} fill="none" stroke={CHART_COLOR.line} strokeWidth={0.8} />
              <path
                d="M150 0 L300 150 L150 300 L0 150 Z M0 0 L300 300 M300 0 L0 300"
                fill="none"
                stroke={CHART_COLOR.line}
                strokeWidth={0.6}
              />
              {HOUSES.map((pos, i) => {
                const h = i + 1;
                const items = itemsByHouse[h] ?? [];
                const multi = items.length > 1;
                return (
                  <g key={h}>
                    {ascSign > 0 && (
                      <text
                        x={pos.sign[0]}
                        y={pos.sign[1]}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={10}
                        fontWeight={400}
                        style={{ fill: CHART_COLOR.line }}
                      >
                        {normalizeSign(ascSign + h - 1)}
                      </text>
                    )}
                    <ItemBlock
                      items={items}
                      x={pos.single[0]}
                      y={multi ? pos.top + CLUSTER_PAD : pos.single[1]}
                      anchor={multi ? "top" : "middle"}
                      maxWidth={pos.width}
                      maxHeight={pos.room}
                      fontSize={FONT}
                      minFontSize={5.5}
                      lineHeight={1.05}
                      rowGap={1.7}
                      itemGap={5}
                    />
                  </g>
                );
              })}
            </svg>
          );
        }}
      </StatusView>
    </Card>
  );
}
