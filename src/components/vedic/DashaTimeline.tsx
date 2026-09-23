"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { formatDate, labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

/**
 * Every named dasha system this API computes, mapped to its endpoint.
 * `VimshottariDasha` and `CurrentDasha` are dedicated components for the two
 * systems people ask for by name; every other one of the 29 shares an
 * identical response shape (confirmed by reading
 * astro_api/views/focused/dasha.py's shared `shape()` method, used by every
 * `_named()` endpoint), so one generic component covers all of them rather
 * than 29 near-duplicate files.
 */
export const DASHA_SYSTEMS = {
  yogini: "astro/dasha/yogini",
  ashtottari: "astro/dasha/ashtottari",
  shodashottari: "astro/dasha/shodashottari",
  chara: "astro/dasha/chara",
  narayana: "astro/dasha/narayana",
  kalachakra: "astro/dasha/kalachakra",
  sudasa: "astro/dasha/sudasa",
  dwadashottari: "astro/dasha/dwadashottari",
  panchottari: "astro/dasha/panchottari",
  sataabdika: "astro/dasha/sataabdika",
  chaturaseetiSama: "astro/dasha/chaturaseeti-sama",
  dwisaptati: "astro/dasha/dwisaptati",
  shattrimsaSama: "astro/dasha/shattrimsa-sama",
  budhiGati: "astro/dasha/budhi-gati",
  drig: "astro/dasha/drig",
  nirayanaShoola: "astro/dasha/nirayana-shoola",
  shoola: "astro/dasha/shoola",
  sthira: "astro/dasha/sthira",
  trikona: "astro/dasha/trikona",
  brahma: "astro/dasha/brahma",
  chakra: "astro/dasha/chakra",
  kendradhi: "astro/dasha/kendradhi",
  lagnamsaka: "astro/dasha/lagnamsaka",
  mandooka: "astro/dasha/mandooka",
  navamsa: "astro/dasha/navamsa",
  paryaaya: "astro/dasha/paryaaya",
  sandhya: "astro/dasha/sandhya",
  taraLagna: "astro/dasha/tara-lagna",
  yogardha: "astro/dasha/yogardha",
} as const;

export type DashaSystemName = keyof typeof DASHA_SYSTEMS;

interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  children?: DashaPeriod[];
}

interface DashaResponse {
  system: string;
  lord_type: "planet" | "sign";
  level_names: string[];
  periods: DashaPeriod[];
}

export interface DashaTimelineProps extends BirthDetails, CommonProps {
  /** Any key of DASHA_SYSTEMS, e.g. "chara", "yogini", "kalachakra". */
  system: DashaSystemName;
  levels?: 1 | 2 | 3 | 4;
}

/**
 * The mahadasha timeline for any of the 29 non-Vimshottari systems this API
 * computes - Jaimini's Chara and Narayana dashas, Yogini, Kalachakra, and
 * two dozen others. Same shape and same component as VimshottariDasha,
 * parameterized by system rather than duplicated per system.
 */
export function DashaTimeline({
  system,
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  levels = 2,
  className,
}: DashaTimelineProps) {
  const state = useOccultQuery<DashaResponse>(DASHA_SYSTEMS[system], {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    levels,
  });

  return (
    <Card title={labelize(system)} subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const rows = flatten(data.periods, data.level_names);
          return (
            <DataTable
              rows={rows}
              columns={[
                { path: "levelLabel", label: "Level" },
                { path: "lord", label: data.lord_type === "sign" ? "Sign" : "Lord", render: (v) => labelize(String(v ?? "")) },
                { path: "start", label: "Start", render: (v) => formatDate(v) },
                { path: "end", label: "End", render: (v) => formatDate(v) },
              ]}
            />
          );
        }}
      </StatusView>
    </Card>
  );
}

function flatten(
  periods: DashaPeriod[],
  levelNames: string[],
  depth = 0,
): Array<{ levelLabel: string; lord: string; start: string; end: string }> {
  const rows: Array<{ levelLabel: string; lord: string; start: string; end: string }> = [];
  for (const period of periods) {
    const indent = "— ".repeat(depth);
    rows.push({
      levelLabel: `${indent}${labelize(levelNames[depth] ?? "level")}`,
      lord: period.lord,
      start: period.start,
      end: period.end,
    });
    if (period.children?.length) {
      rows.push(...flatten(period.children, levelNames, depth + 1));
    }
  }
  return rows;
}
