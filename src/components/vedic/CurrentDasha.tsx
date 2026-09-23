"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface DashaStep {
  level: string;
  lord: string;
  elapsed_percent: number | null;
  remaining_days: number;
}

interface CurrentDashaResponse {
  system: string;
  running: boolean;
  chain: DashaStep[];
  summary: string;
  note: string | null;
}

export interface CurrentDashaProps extends BirthDetails, CommonProps {
  levels?: 1 | 2 | 3 | 4;
  /** Any other supported system name; defaults to Vimshottari. */
  system?: string;
}

/**
 * Which period is running right now, at every level - the question people
 * actually ask of a dasha, answered directly rather than making the caller
 * walk a timeline and compare dates themselves. Verified live:
 * /api/astro/dasha/current/.
 */
export function CurrentDasha({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  levels = 3,
  system,
  className,
}: CurrentDashaProps) {
  const state = useOccultQuery<CurrentDashaResponse>("astro/dasha/current", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    levels,
    ...(system ? { system } : {}),
  });

  return (
    <Card title="Current Dasha" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) =>
          data.running ? (
            <>
              <p style={{ margin: "0 0 0.75rem", fontWeight: 700 }}>{data.summary}</p>
              <StatRow>
                {data.chain.map((step) => (
                  <Stat
                    key={step.level}
                    label={labelize(step.level)}
                    value={labelize(step.lord)}
                    hint={
                      step.elapsed_percent !== null
                        ? `${step.elapsed_percent.toFixed(0)}% elapsed · ${Math.round(step.remaining_days)} days left`
                        : undefined
                    }
                  />
                ))}
              </StatRow>
            </>
          ) : (
            <p className="occult-empty">{data.note ?? "No period covers this moment."}</p>
          )
        }
      </StatusView>
    </Card>
  );
}
