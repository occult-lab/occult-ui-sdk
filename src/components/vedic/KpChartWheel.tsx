"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import type { BirthDetails, CommonProps } from "@/types";
import { CircularChartWheel, type CircularBody } from "./wheelCircular";
import { WHEEL_COLOR } from "../western/westernWheelShared";

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

/**
 * KP chart bodies in Yogatara's order and abbreviations. Yogatara's KP screen
 * uses mean nodes by default, so the mean node is Rahu/Ketu here and the
 * true node the fallback; drawing both would put two Rahus on the wheel.
 * Uranus, Neptune and Pluto are drawn in the "outer" colour, as there.
 */
const KP_BODIES: { key: string; keys: string[]; abbr: string; outer?: boolean }[] = [
  { key: "sun", keys: ["sun"], abbr: "Su" },
  { key: "moon", keys: ["moon"], abbr: "Mo" },
  { key: "mars", keys: ["mars"], abbr: "Ma" },
  { key: "mercury", keys: ["mercury"], abbr: "Me" },
  { key: "jupiter", keys: ["jupiter"], abbr: "Ju" },
  { key: "venus", keys: ["venus"], abbr: "Ve" },
  { key: "saturn", keys: ["saturn"], abbr: "Sa" },
  { key: "rahu", keys: ["northmeannode", "northtruenode", "rahu"], abbr: "Ra" },
  { key: "ketu", keys: ["southmeannode", "southtruenode", "ketu"], abbr: "Ke" },
  { key: "uranus", keys: ["uranus"], abbr: "Ur", outer: true },
  { key: "neptune", keys: ["neptune"], abbr: "Ne", outer: true },
  { key: "pluto", keys: ["pluto"], abbr: "Pl", outer: true },
];

function kpBodies(data: KpChartResponse, ascLon: number): CircularBody[] {
  const lons = data.planet_longitudes ?? {};
  const bodies: CircularBody[] = [{ key: "lagna", label: "Lagna", lon: ascLon, ascendant: true, color: WHEEL_COLOR.ascendant }];
  for (const b of KP_BODIES) {
    const k = b.keys.find((name) => Number.isFinite(lons[name]));
    if (k === undefined) continue;
    bodies.push({ key: b.key, label: b.abbr, lon: lons[k] as number, color: b.outer ? WHEEL_COLOR.upagraha : WHEEL_COLOR.planet });
  }
  return bodies;
}

export interface KpChartWheelProps extends BirthDetails, CommonProps {
  size?: number;
}

/**
 * The KP (Krishnamurti Paddhati) house wheel: twelve UNEQUAL cusps from the
 * ascendant, not the fixed 30-degree diamond NatalChartWheel draws - KP's
 * Placidus-style cusps genuinely differ house to house. Drawn as the
 * Yogatara web app draws its KP chart in circular style (see
 * wheelCircular.tsx): signs, nakshatras, the planets at their exact degree,
 * and the cusps as house lines numbered I-XII. Verified live:
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
          const ordered = [...(data.houses ?? [])].sort((x, y) => x.house - y.house);
          const ascLon = Number.isFinite(data.ascendant) ? data.ascendant : ordered[0]?.start ?? 0;
          const cusps = ordered.length === 12 ? ordered.map((h) => h.start) : undefined;
          return (
            <CircularChartWheel
              ascLon={ascLon}
              bodies={kpBodies(data, ascLon)}
              cusps={cusps}
              size={size}
              ariaLabel="KP chart wheel with Placidus cusps"
            />
          );
        }}
      </StatusView>
    </Card>
  );
}
