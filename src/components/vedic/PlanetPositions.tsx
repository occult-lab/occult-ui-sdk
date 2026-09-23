"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  nakshatra: string;
  pada: number;
  zodiac_name: string;
  house: number;
}

interface PlanetPositionsResponse {
  planets: Planet[];
}

export interface PlanetPositionsProps extends BirthDetails, CommonProps {
  /** Which chart to compute the positions for. Defaults to the rashi (D1) chart. */
  chartName?: string;
  /** LAHIRI, RAMAN, KRISHNAMURTI... any ayanamsa the API accepts. */
  ayanamsa?: string;
}

/**
 * Every graha's sign, house, nakshatra and pada — the table almost every
 * Vedic reading opens with. Verified live: /api/astro/planet-positions/.
 */
export function PlanetPositions({
  date,
  time,
  latitude,
  longitude,
  place,
  chartName = "RashiChart",
  ayanamsa = "LAHIRI",
  className,
}: PlanetPositionsProps) {
  const state = useOccultQuery<PlanetPositionsResponse>("astro/planet-positions", {
    chart_name: chartName,
    datetime: `${date}T${time}`,
    latitude,
    longitude,
    ayanamsa,
  });

  return (
    <Card title="Planetary Positions" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={data.planets as unknown as Record<string, unknown>[]}
            columns={[
              { path: "name", label: "Planet" },
              { path: "zodiac_name", label: "Sign" },
              {
                path: "longitude",
                label: "Degree",
                render: (v) => (typeof v === "number" ? `${(v % 30).toFixed(2)}°` : "—"),
              },
              { path: "house", label: "House" },
              { path: "nakshatra", label: "Nakshatra" },
              { path: "pada", label: "Pada" },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
