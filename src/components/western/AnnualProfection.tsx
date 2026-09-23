"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface ProfectionPeriod {
  house: number;
  sign: string;
  lord: string;
}

interface ProfectionResponse {
  age: number;
  annual: ProfectionPeriod;
  monthly: ProfectionPeriod;
  daily: ProfectionPeriod;
}

/**
 * Annual (and monthly, daily) profections: which house has "come into
 * focus" this year by counting forward from the ascendant one house per
 * year of age, and that house's ruler - the "lord of the year" - read as
 * the traditional timing technique this reduces to. Verified live:
 * /api/astro/traditional/profections/.
 */
export function AnnualProfection({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<ProfectionResponse>("astro/traditional/profections", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Annual Profection" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <StatRow>
            <Stat label="Age" value={data.age} />
            <Stat label="Year: House / Lord" value={`H${data.annual.house} · ${labelize(data.annual.lord)}`} hint={data.annual.sign} />
            <Stat label="Month: House / Lord" value={`H${data.monthly.house} · ${labelize(data.monthly.lord)}`} hint={data.monthly.sign} />
            <Stat label="Day: House / Lord" value={`H${data.daily.house} · ${labelize(data.daily.lord)}`} hint={data.daily.sign} />
          </StatRow>
        )}
      </StatusView>
    </Card>
  );
}
