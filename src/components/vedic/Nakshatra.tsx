"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { formatDate, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface NakshatraSegment {
  name: string;
  name_hi?: string;
  start_time: string;
  end_time: string;
}

interface NakshatraResponse {
  current: { name: string; name_hi?: string; start: string; end: string };
  segments: NakshatraSegment[];
}

/**
 * The Moon's nakshatra for a moment, plus every segment touching that local
 * day - the same "which one is in force right now" shape the Panchang
 * widget uses. Verified live: /api/astro/nakshatra/.
 */
export function Nakshatra({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  locale,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<NakshatraResponse>("astro/nakshatra", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    keys: [],
  });

  return (
    <Card title="Nakshatra" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat
                label="Current"
                value={locale === "hi" && data.current.name_hi ? data.current.name_hi : data.current.name}
              />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={data.segments as unknown as Record<string, unknown>[]}
              columns={[
                {
                  path: "name",
                  label: "Nakshatra",
                  render: (v, row) =>
                    locale === "hi" && row.name_hi ? String(row.name_hi) : String(v ?? ""),
                },
                { path: "start_time", label: "Start", render: (v) => formatDate(v) },
                { path: "end_time", label: "End", render: (v) => formatDate(v) },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
