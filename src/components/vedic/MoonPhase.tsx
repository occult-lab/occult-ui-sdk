"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface MoonIlluminationResponse {
  illuminated_fraction: number;
  illuminated_percent: number;
  waxing: boolean;
  phase_name: string;
}

export interface MoonPhaseProps extends CommonProps {
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM", defaults to noon. */
  time?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  size?: number;
}

/**
 * A crescent/gibbous moon icon drawn from illuminated_fraction, not a fixed
 * set of eight phase icons - so a 34%-lit and a 41%-lit moon look visibly
 * different rather than both snapping to "waxing crescent". Two overlapping
 * arcs: an outer half-circle for the fully-lit side, and a terminator
 * ellipse whose horizontal radius is r*|1-2k| - the standard construction
 * for a phase disc, verified here by rendering waxing gibbous (illuminated
 * ~89%) and confirming visually that it reads as "nearly full, one side
 * still dark" rather than a thin crescent. Verified live:
 * /api/astro/moon-illumination/.
 */
export function MoonPhase({
  date,
  time = "12:00",
  latitude = 0,
  longitude = 0,
  timezone = 0,
  size = 120,
  className,
}: MoonPhaseProps) {
  const offset = `${timezone >= 0 ? "+" : "-"}${String(Math.abs(Math.trunc(timezone))).padStart(2, "0")}:${String(Math.round((Math.abs(timezone) % 1) * 60)).padStart(2, "0")}`;
  const state = useOccultQuery<MoonIlluminationResponse>("astro/moon-illumination", {
    date_time: `${date}T${time}:00${offset}`,
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Moon Phase" className={className}>
      <StatusView state={state}>
        {(data) => {
          const k = Math.min(1, Math.max(0, data.illuminated_fraction));
          const r = size / 2 - 2;
          const cx = size / 2;
          const cy = size / 2;
          const rx = r * Math.abs(1 - 2 * k);
          // Waxing lights from the right; waning from the left. The OUTER
          // arc (the limb) is fixed to that side regardless of k. The INNER
          // arc (the terminator ellipse) is what changes shape:
          //   k < 0.5 (crescent) - it curves the OPPOSITE way from the
          //     outer arc, cutting a thin sliver out of that half.
          //   k > 0.5 (gibbous)  - it curves the SAME way, bulging past a
          //     half-disc into the other side.
          // Verified by rendering k≈0 (new moon) and confirming it reads as
          // almost entirely dark, not - as a first, backwards attempt at
          // this formula produced - a fully lit disc.
          const outerSweep = data.waxing ? 1 : 0;
          const innerSweep = k < 0.5 ? (outerSweep === 1 ? 0 : 1) : outerSweep;
          const litPath = [
            `M ${cx} ${cy - r}`,
            `A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r}`,
            `A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r}`,
            "Z",
          ].join(" ");

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="occult-wheel">
                <circle cx={cx} cy={cy} r={r} fill="var(--occult-bg-subtle)" stroke="var(--occult-border)" strokeWidth={1} />
                <path d={litPath} fill="var(--occult-accent)" />
              </svg>
              <StatRow>
                <Stat label="Phase" value={data.phase_name} />
                <Stat label="Illuminated" value={`${data.illuminated_percent.toFixed(1)}%`} />
                <Stat label="Direction" value={data.waxing ? "Waxing" : "Waning"} />
              </StatRow>
            </div>
          );
        }}
      </StatusView>
    </Card>
  );
}
