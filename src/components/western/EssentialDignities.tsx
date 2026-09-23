"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface DignityPlanet {
  name: string;
  sign: string;
  dignities: string[];
  debilities: string[];
  peregrine: boolean;
  score: number;
}

interface DignitiesResponse {
  planets: DignityPlanet[];
}

/**
 * Each planet's essential dignity score by sign - domicile, exaltation,
 * triplicity, term and face counted for, detriment and fall against, and
 * "peregrine" when none of the five dignities apply at all (traditionally
 * the weakest condition a planet can be in). Verified live:
 * /api/astro/traditional/dignities/.
 */
export function EssentialDignities({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<DignitiesResponse>("astro/traditional/dignities", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Essential Dignities" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={data.planets.map((p) => ({
              planet: labelize(p.name),
              sign: p.sign,
              dignities: p.dignities.length ? p.dignities.map(labelize).join(", ") : "—",
              debilities: p.debilities.length ? p.debilities.map(labelize).join(", ") : "—",
              condition: p.peregrine ? "Peregrine" : "—",
              score: p.score,
            }))}
            columns={[
              { path: "planet", label: "Planet" },
              { path: "sign", label: "Sign" },
              { path: "dignities", label: "Dignities" },
              { path: "debilities", label: "Debilities" },
              { path: "condition", label: "Condition" },
              { path: "score", label: "Score" },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
