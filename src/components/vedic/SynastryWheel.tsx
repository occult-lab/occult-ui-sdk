"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import { WesternWheel, type WesternWheelResponse } from "./WesternWheelBase";
import type { BirthDetails, CommonProps } from "@/types";

export interface SynastryWheelProps extends CommonProps {
  person: BirthDetails;
  partner: BirthDetails;
  orbFactor?: number;
  size?: number;
}

/**
 * A real Western wheel, not a house grid: this endpoint returns tropical
 * ecliptic longitudes and cross-chart aspects, no ascendant or house cusps
 * at all - so the natural, honest rendering is a 360-degree ring, not a
 * borrowed Vedic diamond. See WesternWheelBase for the shared geometry
 * (also used by TransitBiWheel) and its note on the 0-degree-Aries-at-top
 * convention.
 */
export function SynastryWheel({ person, partner, orbFactor = 1, size = 420, className }: SynastryWheelProps) {
  const state = useOccultQuery<WesternWheelResponse>("astro/western/synastry", {
    date_time: toApiDateTime(person.date, person.time, person.timezone),
    timezone_as_float: person.timezone,
    latitude: person.latitude,
    longitude: person.longitude,
    partner_date_time: toApiDateTime(partner.date, partner.time, partner.timezone),
    partner_timezone_as_float: partner.timezone,
    orb_factor: orbFactor,
  });

  return (
    <Card title="Synastry" subtitle={`${person.place ?? "Person A"} & ${partner.place ?? "Person B"}`} className={className}>
      <StatusView state={state}>
        {(data) => (
          <WesternWheel
            data={data}
            size={size}
            outerLabel={person.place ?? "Person A"}
            innerLabel={partner.place ?? "Person B"}
          />
        )}
      </StatusView>
    </Card>
  );
}
