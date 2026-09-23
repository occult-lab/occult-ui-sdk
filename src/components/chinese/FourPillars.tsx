"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { display, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface StemOrBranch {
  name: string;
  element: string;
  polarity?: string;
  animal?: string;
}

interface Pillar {
  pillar: string;
  stem: StemOrBranch;
  branch: StemOrBranch;
  name: string;
  animal: string;
}

interface FourPillarsResponse {
  day_master: StemOrBranch;
  pillars: Pillar[];
}

/**
 * The BaZi four pillars - year, month, day, hour - each a stem/branch pair,
 * with the day master (the person's own element) called out. Verified live:
 * /api/astro/chinese/four-pillars/.
 */
export function FourPillars({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<FourPillarsResponse>("astro/chinese/four-pillars", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Four Pillars (BaZi)" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat
                label="Day Master"
                value={data.day_master.name}
                hint={`${display(data.day_master.element)} · ${display(data.day_master.polarity)}`}
              />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={data.pillars as unknown as Record<string, unknown>[]}
              columns={[
                { path: "pillar", label: "Pillar", render: (v) => display(v) },
                { path: "stem.name", label: "Stem" },
                { path: "stem.element", label: "Stem Element" },
                { path: "branch.name", label: "Branch" },
                { path: "animal", label: "Animal" },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
