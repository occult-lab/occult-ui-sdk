"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { formatDate, labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  children?: DashaPeriod[];
}

interface VimshottariResponse {
  system: string;
  cycle_years: number;
  level_names: string[];
  periods: DashaPeriod[];
}

export interface VimshottariDashaProps extends BirthDetails, CommonProps {
  /** 1 = mahadasha only, 2 adds antardasha, 3 adds pratyantardasha. API caps at 4. */
  levels?: 1 | 2 | 3 | 4;
}

/**
 * The 120-year Vimshottari mahadasha timeline. Nested antardasha/
 * pratyantardasha rows are flattened into one table with a level column,
 * since a genuinely nested HTML table reads worse than an indent does.
 * Verified live: /api/astro/dasha/vimshottari/.
 */
export function VimshottariDasha({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  levels = 2,
  className,
}: VimshottariDashaProps) {
  const state = useOccultQuery<VimshottariResponse>("astro/dasha/vimshottari", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    levels,
  });

  return (
    <Card title="Vimshottari Dasha" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => {
          const rows = flatten(data.periods, data.level_names);
          return (
            <DataTable
              rows={rows}
              columns={[
                { path: "levelLabel", label: "Level" },
                { path: "lord", label: "Lord", render: (v) => labelize(String(v ?? "")) },
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

/** Depth-first flatten so every level shows in one table, indent via a level column. */
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
