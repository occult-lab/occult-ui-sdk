"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface LuckPillar {
  name: string;
  sequence: number;
  from_age: number;
  to_age: number;
  ten_god: string;
}

interface LuckPillarsResponse {
  direction: string;
  starting_age: number;
  luck_pillars: LuckPillar[];
}

export interface LuckPillarsProps extends BirthDetails, CommonProps {
  gender: "male" | "female";
  /** How many ten-year pillars to return, 1-12. */
  count?: number;
}

/**
 * The ten-year Da Yun luck cycles - direction depends on gender and the
 * birth year's stem polarity, which the response states rather than
 * leaving the caller to work out. Verified live:
 * /api/astro/chinese/luck-pillars/.
 */
export function LuckPillars({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  gender,
  count = 8,
  className,
}: LuckPillarsProps) {
  const state = useOccultQuery<LuckPillarsResponse>("astro/chinese/luck-pillars", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    gender,
    count,
  });

  return (
    <Card title="Luck Pillars (Da Yun)" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat label="Direction" value={data.direction === "forward" ? "Forward" : "Backward"} />
              <Stat label="Starting Age" value={data.starting_age.toFixed(1)} />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={data.luck_pillars as unknown as Record<string, unknown>[]}
              columns={[
                { path: "sequence", label: "#" },
                { path: "name", label: "Pillar" },
                {
                  path: "from_age",
                  label: "Ages",
                  render: (_, row) => `${Number(row.from_age).toFixed(0)}–${Number(row.to_age).toFixed(0)}`,
                },
                { path: "ten_god", label: "Ten God" },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
