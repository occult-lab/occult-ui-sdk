"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface IChingNumerologyResponse {
  birth_hexagram_number: number;
  birth_hexagram: string;
  name_hexagram_number: number;
  name_hexagram: string;
}

export interface IChingNumerologyProps extends CommonProps {
  name: string;
  /** "YYYY-MM-DD" */
  birthDate: string;
}

/**
 * Birth date and name each reduced to a digit total, modulo 64, mapped onto
 * the King Wen sequence - a numerological mapping onto the 64 hexagrams,
 * not a cast reading (no changing lines, no relating hexagram - the API
 * states this itself). A separate endpoint from the generic
 * NumerologyChart. Verified live: /api/astro/numerology/iching/.
 */
export function IChingNumerology({ name, birthDate, className }: IChingNumerologyProps) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const state = useOccultQuery<IChingNumerologyResponse>("astro/numerology/iching", {
    date_time: `${birthDate}T00:00:00Z`,
    name,
    day,
    month,
    year,
  });

  return (
    <Card title={name} subtitle="I Ching numerology" className={className}>
      <StatusView state={state}>
        {(data) => (
          <StatRow>
            <Stat label="Birth Hexagram" value={`${data.birth_hexagram_number}. ${data.birth_hexagram}`} />
            <Stat label="Name Hexagram" value={`${data.name_hexagram_number}. ${data.name_hexagram}`} />
          </StatRow>
        )}
      </StatusView>
    </Card>
  );
}
