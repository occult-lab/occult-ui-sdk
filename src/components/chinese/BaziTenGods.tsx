"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface StemWithGod {
  name: string;
  element: string;
  ten_god: string;
}

interface Pillar {
  pillar: string;
  stem: StemWithGod;
  branch: { name: string; animal: string };
  hidden_stems: StemWithGod[];
}

interface BaziResponse {
  day_master: { name: string; element: string; polarity: string };
  pillars: Pillar[];
}

/**
 * The Four Pillars with every stem's Ten God relationship to the day
 * master - "Friend", "Direct Officer", "Hurting Officer" and so on - the
 * layer of interpretation BaZi readings are actually built on, not just the
 * raw stems FourPillars shows. Verified live: /api/astro/chinese/bazi/.
 */
export function BaziTenGods({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<BaziResponse>("astro/chinese/bazi", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="BaZi Ten Gods" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat label="Day Master" value={data.day_master.name} hint={data.day_master.element} />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={data.pillars.map((p) => ({
                pillar: p.pillar,
                stem: p.stem.name,
                ten_god: p.stem.ten_god,
                hidden: p.hidden_stems.map((h) => `${h.name} (${h.ten_god})`).join(", "),
              }))}
              columns={[
                { path: "pillar", label: "Pillar" },
                { path: "stem", label: "Stem" },
                { path: "ten_god", label: "Ten God" },
                { path: "hidden", label: "Hidden Stems" },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
