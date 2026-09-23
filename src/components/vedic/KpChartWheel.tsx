"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import type { BirthDetails, CommonProps } from "@/types";

interface KpHouse {
  house: number;
  sign: string;
  start: number;
}

interface KpChartResponse {
  ascendant: number;
  houses: KpHouse[];
  planet_longitudes: Record<string, number>;
  planet_houses: Record<string, number>;
}

const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mercury: "Me", venus: "Ve", mars: "Ma",
  jupiter: "Ju", saturn: "Sa", uranus: "Ur", neptune: "Ne", pluto: "Pl",
  northtruenode: "Ra", northmeannode: "Ra", southtruenode: "Ke", southmeannode: "Ke",
};

function angleToPoint(longitudeDeg: number, ascendant: number, radius: number, cx: number, cy: number) {
  // The ascendant sits at the left (9 o'clock) and the wheel runs
  // counter-clockwise from there - the standard Western/KP house-wheel
  // orientation, unlike the 0-Aries-at-top convention WesternWheelBase
  // uses for synastry, because a KP chart's houses ARE unequal cusps
  // anchored to the ascendant, not a sign-based ring with no ascendant at
  // all (which is what synastry's response actually returns).
  const rad = ((ascendant - longitudeDeg) * Math.PI) / 180 + Math.PI;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export interface KpChartWheelProps extends BirthDetails, CommonProps {
  size?: number;
}

/**
 * The KP (Krishnamurti Paddhati) house wheel: twelve UNEQUAL cusps radiating
 * from the ascendant, not the fixed 30-degree diamond NatalChartWheel draws
 * - KP's Placidus-style cusps genuinely differ house to house, so reusing
 * the sign-based diamond would misrepresent the system. Verified live:
 * /api/astro/kp-chart/.
 */
export function KpChartWheel({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  size = 380,
  className,
}: KpChartWheelProps) {
  const state = useOccultQuery<KpChartResponse>("astro/kp-chart", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="KP Chart Wheel" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const cx = size / 2;
          const cy = size / 2;
          const outerR = size / 2 - 10;
          const cuspR = outerR - 30;
          const planetR = cuspR - 26;

          return (
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="occult-wheel" style={{ display: "block", margin: "0 auto" }}>
              <circle cx={cx} cy={cy} r={outerR} className="occult-wheel__ring" />
              <circle cx={cx} cy={cy} r={cuspR} className="occult-wheel__ring" />

              {data.houses.map((h) => {
                const rim = angleToPoint(h.start, data.ascendant, outerR, cx, cy);
                const inner = angleToPoint(h.start, data.ascendant, cuspR - 14, cx, cy);
                const isAngular = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
                const labelPos = angleToPoint(h.start + 12, data.ascendant, outerR - 12, cx, cy);
                return (
                  <g key={h.house}>
                    <line
                      x1={inner.x} y1={inner.y} x2={rim.x} y2={rim.y}
                      stroke="var(--occult-border)"
                      strokeWidth={isAngular ? 1.4 : 0.6}
                    />
                    <text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize={9} fontWeight={isAngular ? 700 : 400} fill="var(--occult-fg-muted)">
                      {h.house}
                    </text>
                  </g>
                );
              })}

              {Object.entries(data.planet_longitudes).map(([name, lon]) => {
                const pt = angleToPoint(lon, data.ascendant, planetR, cx, cy);
                return (
                  <g key={name}>
                    <circle cx={pt.x} cy={pt.y} r={9} fill="var(--occult-accent)" />
                    <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--occult-accent-fg)">
                      {PLANET_ABBR[name] ?? name.slice(0, 2)}
                    </text>
                  </g>
                );
              })}

              {/* Ascendant marker, fixed at the left by construction. */}
              <line x1={cx - outerR} y1={cy} x2={cx - cuspR + 10} y2={cy} stroke="var(--occult-accent)" strokeWidth={1.8} />
              <text x={cx - outerR + 4} y={cy - 6} fontSize={9} fontWeight={700} fill="var(--occult-accent)">
                Asc
              </text>
            </svg>
          );
        }}
      </StatusView>
    </Card>
  );
}
