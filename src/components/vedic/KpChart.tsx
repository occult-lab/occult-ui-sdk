"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface KpHouse {
  house: number;
  sign: string;
  start: number;
  middle: number;
  end: number;
}

interface KpChartResponse {
  ascendant: number;
  houses: KpHouse[];
  planet_longitudes: Record<string, number>;
  planet_houses: Record<string, number>;
}

/**
 * The Krishnamurti Paddhati chart: 12 house cusps (start/middle/end in
 * degrees) plus which house each planet occupies. Verified live:
 * /api/astro/kp-chart/.
 */
export function KpChart({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<KpChartResponse>("astro/kp-chart", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="KP Chart" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const planetRows = Object.entries(data.planet_longitudes).map(([name, lon]) => ({
            name,
            longitude: lon,
            house: data.planet_houses[name],
          }));
          return (
            <>
              <DataTable
                rows={data.houses as unknown as Record<string, unknown>[]}
                columns={[
                  { path: "house", label: "House" },
                  { path: "sign", label: "Sign" },
                  { path: "start", label: "Cusp Start", render: (v) => `${Number(v).toFixed(2)}°` },
                ]}
              />
              <h4 className="occult-space-top" style={{ margin: "0 0 0.5rem" }}>
                Planets
              </h4>
              <DataTable
                rows={planetRows}
                columns={[
                  { path: "name", label: "Planet" },
                  { path: "house", label: "House" },
                  { path: "longitude", label: "Longitude", render: (v) => `${(Number(v) % 30).toFixed(2)}°` },
                ]}
              />
            </>
          );
        }}
      </StatusView>
    </Card>
  );
}
