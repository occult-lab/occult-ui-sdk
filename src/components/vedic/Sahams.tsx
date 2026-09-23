"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface Saham {
  name: string;
  result: {
    astrological: { sign: string; degree: number; minutes: number };
    nakshatra: string;
  };
}

interface SahamsResponse {
  count: number;
  sahams: Saham[];
  sect_note: string;
}

/**
 * The Sahams (Arabic Parts): sensitive points computed from three chart
 * factors each, one per life area - Fortune, Learning, Fame and dozens
 * more. This engine always uses the day-chart formula regardless of
 * whether the birth was actually diurnal or nocturnal - stated by the API
 * itself in `sect_note`, surfaced here rather than silently hidden.
 * Verified live: /api/astro/sahams/.
 */
export function Sahams({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<SahamsResponse>("astro/sahams", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Sahams (Arabic Parts)" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <DataTable
              rows={data.sahams.map((s) => ({
                name: s.name,
                sign: s.result.astrological.sign,
                degree: `${s.result.astrological.degree}°${s.result.astrological.minutes}'`,
                nakshatra: s.result.nakshatra,
              }))}
              columns={[
                { path: "name", label: "Saham" },
                { path: "sign", label: "Sign" },
                { path: "degree", label: "Degree" },
                { path: "nakshatra", label: "Nakshatra" },
              ]}
            />
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.78rem", color: "var(--occult-fg-muted)" }}>
              {data.sect_note}
            </p>
          </>
        )}
      </StatusView>
    </Card>
  );
}
