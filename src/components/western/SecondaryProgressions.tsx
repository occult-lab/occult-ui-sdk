"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface ProgressedPlanet {
  name: string;
  sign: string;
  formatted: string;
}

interface ProgressionsResponse {
  years_elapsed: number;
  natal: ProgressedPlanet[];
  progressed: ProgressedPlanet[];
}

export interface SecondaryProgressionsProps extends BirthDetails, CommonProps {
  /** The moment to progress to; defaults to now. */
  progressedTo?: Date;
}

/**
 * "A day for a year": each day after birth stands for one year of life, so
 * the planets' positions that many days on show what's symbolically
 * "moved" by now. Verified live: /api/astro/western/progressions/.
 */
export function SecondaryProgressions({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  progressedTo,
  className,
}: SecondaryProgressionsProps) {
  const moment = progressedTo ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const progressedDate = `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}T${pad(moment.getHours())}:${pad(moment.getMinutes())}:00Z`;

  const state = useOccultQuery<ProgressionsResponse>("astro/western/progressions", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    progressed_to: progressedDate,
  });

  return (
    <Card title="Secondary Progressions" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const natalBy = new Map(data.natal.map((p) => [p.name, p]));
          return (
            <>
              <StatRow>
                <Stat label="Years Elapsed" value={data.years_elapsed.toFixed(1)} />
              </StatRow>
              <DataTable
                className="occult-space-top"
                rows={data.progressed.map((p) => ({
                  planet: labelize(p.name),
                  natal: natalBy.get(p.name)?.formatted ?? "—",
                  progressed: p.formatted,
                }))}
                columns={[
                  { path: "planet", label: "Planet" },
                  { path: "natal", label: "Natal" },
                  { path: "progressed", label: "Progressed" },
                ]}
              />
            </>
          );
        }}
      </StatusView>
    </Card>
  );
}
