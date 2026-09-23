"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface SectPlanet {
  planet: string;
  own_sect: "diurnal" | "nocturnal";
  in_sect: boolean;
  above_horizon: boolean;
  in_hayz: boolean;
  sign: string;
}

interface SectResponse {
  sect: "diurnal" | "nocturnal";
  is_day_chart: boolean;
  benefic: string;
  malefic: string;
  planets: SectPlanet[];
}

/**
 * Whether a chart is diurnal (day) or nocturnal (night) - the traditional
 * astrology distinction that decides which benefic and malefic are "of the
 * sect in favour" - plus every planet's own standing: in its own sect,
 * above the horizon, and in hayz (in sect AND correctly placed relative to
 * the horizon - the strongest traditional condition a planet can be in).
 * Verified live: /api/astro/traditional/sect/.
 */
export function Sect({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<SectResponse>("astro/traditional/sect", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Sect" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat label="Chart" value={data.is_day_chart ? "Diurnal (day)" : "Nocturnal (night)"} />
              <Stat label="Sect Benefic" value={labelize(data.benefic)} />
              <Stat label="Sect Malefic" value={labelize(data.malefic)} />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={data.planets as unknown as Record<string, unknown>[]}
              columns={[
                { path: "planet", label: "Planet", render: (v) => labelize(String(v ?? "")) },
                { path: "own_sect", label: "Own Sect", render: (v) => labelize(String(v ?? "")) },
                { path: "in_sect", label: "In Sect", render: (v) => (v ? "✓" : "—") },
                { path: "above_horizon", label: "Above Horizon", render: (v) => (v ? "✓" : "—") },
                { path: "in_hayz", label: "In Hayz", render: (v) => (v ? "✓" : "—") },
                { path: "sign", label: "Sign" },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
