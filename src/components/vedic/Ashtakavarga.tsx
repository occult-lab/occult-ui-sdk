"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

interface AshtakavargaResponse {
  samudhaya_ashtaka_varga: Record<string, number>;
}

/**
 * Sarvashtakavarga: every sign's total strength points, 0-8 per planet
 * summed across all seven grahas plus the ascendant, out of a classical
 * maximum of 337. The single number most readings reach for first. The
 * response keys signs "Raasi 1".."Raasi 12" (Aries..Pisces) rather than by
 * name - mapped here rather than shown as-is. Verified live:
 * /api/astro/ashtakvarga/.
 */
export function Ashtakavarga({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  chartName = "RashiChart",
  className,
}: BirthDetails & CommonProps & { chartName?: string }) {
  const state = useOccultQuery<AshtakavargaResponse>("astro/ashtakvarga", {
    keys: ["samudhaya_ashtaka_varga"],
    latitude,
    longitude,
    timezone_as_float: timezone,
    chart_name: chartName,
    date_time: toApiDateTime(date, time, timezone),
  });

  return (
    <Card title="Sarvashtakavarga" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const rows = SIGNS.map((sign, i) => ({
            sign,
            points: data.samudhaya_ashtaka_varga[`Raasi ${i + 1}`] ?? 0,
          }));
          return (
            <DataTable
              rows={rows}
              columns={[
                { path: "sign", label: "Sign" },
                { path: "points", label: "Points (of 337 total)" },
              ]}
            />
          );
        }}
      </StatusView>
    </Card>
  );
}
