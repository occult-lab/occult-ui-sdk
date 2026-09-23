"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface AlmutenPoint {
  sign: string;
  formatted: string;
  almuten: string;
  tied: string[];
}

interface AlmutenResponse {
  by_point: Record<string, AlmutenPoint>;
}

const POINT_ORDER = ["sun", "moon", "ascendant", "midheaven", "part_of_fortune"];

/**
 * The Almuten (essential ruler, by point score) of the Sun, Moon,
 * Ascendant, Midheaven and Part of Fortune - the traditional dignity-score
 * winner for each, not just its sign ruler. Verified live:
 * /api/astro/traditional/almuten/.
 */
export function Almuten({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<AlmutenResponse>("astro/traditional/almuten", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Almuten" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={POINT_ORDER.filter((k) => data.by_point[k]).map((k) => {
              const p = data.by_point[k];
              return {
                point: labelize(k),
                position: p?.formatted ?? "",
                almuten: labelize(p?.almuten ?? ""),
                tied: p?.tied.length ? p.tied.map(labelize).join(", ") : "—",
              };
            })}
            columns={[
              { path: "point", label: "Point" },
              { path: "position", label: "Position" },
              { path: "almuten", label: "Almuten" },
              { path: "tied", label: "Tied With" },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
