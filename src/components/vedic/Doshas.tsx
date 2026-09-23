"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

/**
 * `manglik` and `ganda_moola` are excluded on purpose: both were verified
 * broken against the live API while building this component. `manglik`
 * 500s with "planets_in_retrograde() missing 1 required positional
 * argument: 'place'"; `ganda_moola` always returns false because
 * `moon_star` is typed as a string while the comparison table it checks
 * against holds integers. Neither is a UI problem to work around - they're
 * backend defects, reported rather than silently papered over here.
 */
const DOSHA_KEYS = ["kala_sarpa", "ghata", "guru_chandala_dosha", "pitru_dosha", "kalathra", "shrapit"] as const;

const LABELS: Record<string, string> = {
  kala_sarpa: "Kala Sarpa",
  ghata: "Ghata",
  guru_chandala_dosha: "Guru Chandala",
  pitru_dosha: "Pitru",
  kalathra: "Kalathra",
  shrapit: "Shrapit",
};

type DoshaResult = boolean | [boolean, boolean] | [boolean, number[]];

/**
 * Six of the ten dosha checks the API supports - see the excluded-keys note
 * above for why not all ten. Each returns either a plain boolean or a
 * [present, detail] pair; both shapes are normalised into one table here.
 * Verified live: /api/astro/dosha/.
 */
export function Doshas({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<Record<string, DoshaResult>>("astro/dosha", {
    keys: [...DOSHA_KEYS],
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone,
    manglik_reference_planet: 0,
    include_lagna_house: true,
    include_2nd_house: true,
    apply_exceptions: true,
    moon_star: "1",
  });

  return (
    <Card title="Doshas" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const rows = DOSHA_KEYS.map((key) => {
            const value = data[key];
            const present = Array.isArray(value) ? value[0] : value;
            const detail = Array.isArray(value) && Array.isArray(value[1])
              ? `Rules: ${value[1].join(", ")}`
              : "";
            return { name: LABELS[key], present, detail };
          });
          return (
            <DataTable
              rows={rows}
              columns={[
                { path: "name", label: "Dosha" },
                { path: "present", label: "Present", render: (v) => (v ? "✓" : "—") },
                { path: "detail", label: "Detail" },
              ]}
            />
          );
        }}
      </StatusView>
    </Card>
  );
}
