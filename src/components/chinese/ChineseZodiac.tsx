"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { display } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface ChineseZodiacResponse {
  sign: string;
  animal: string;
  element: string;
  polarity: string;
  year_pillar: string;
  allies: string[];
  clash: string;
}

export interface ChineseZodiacProps extends CommonProps {
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM", defaults to noon - the animal only needs the year in almost every case. */
  time?: string;
  timezone?: number;
}

/**
 * The Chinese zodiac animal and element for a birth year - takes just a
 * date, unlike most of this library, since the animal turns on the year
 * (at Lichun, not January 1st) rather than an exact birth time. Verified
 * live: /api/astro/chinese/zodiac/.
 */
export function ChineseZodiac({ date, time = "12:00", timezone = 8, className }: ChineseZodiacProps) {
  const state = useOccultQuery<ChineseZodiacResponse>("astro/chinese/zodiac", {
    date_time: `${date}T${time}:00${timezone >= 0 ? "+" : "-"}${String(Math.abs(Math.trunc(timezone))).padStart(2, "0")}:${String(Math.round((Math.abs(timezone) % 1) * 60)).padStart(2, "0")}`,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Chinese Zodiac" className={className}>
      <StatusView state={state}>
        {(data) => (
          <StatRow>
            <Stat label="Sign" value={data.sign} />
            <Stat label="Allies" value={data.allies.map((a) => display(a)).join(", ")} />
            <Stat label="Clash" value={display(data.clash)} />
          </StatRow>
        )}
      </StatusView>
    </Card>
  );
}
