"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import { WesternWheel, type WesternWheelResponse } from "./WesternWheelBase";
import type { BirthDetails, CommonProps } from "@/types";

export interface TransitBiWheelProps extends CommonProps {
  natal: BirthDetails;
  /** The moment to compare against; defaults to right now. */
  asOf?: Date;
  orbFactor?: number;
  size?: number;
}

/**
 * The natal chart (outer ring, filled dots) against a second moment's
 * planetary positions (inner ring, outlined dots) - "what's happening in
 * the sky against my birth chart right now". This is the same computation
 * as synastry (two sets of tropical positions plus the aspects between
 * them), just with the second "person" being a moment rather than a
 * birth - so it reuses /api/astro/western/synastry/ and WesternWheelBase's
 * rendering rather than a separate transit-specific endpoint or component.
 * `astro/western/synastry` needs a place for the "partner" too, but since
 * it returns pure geocentric longitudes (no house cusps), the natal
 * chart's own coordinates are reused rather than asking the caller for a
 * second, meaningless location for "now".
 */
export function TransitBiWheel({ natal, asOf, orbFactor = 1, size = 420, className }: TransitBiWheelProps) {
  const moment = asOf ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const transitDate = `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
  const transitTime = `${pad(moment.getHours())}:${pad(moment.getMinutes())}`;

  const state = useOccultQuery<WesternWheelResponse>("astro/western/synastry", {
    date_time: toApiDateTime(natal.date, natal.time, natal.timezone),
    timezone_as_float: natal.timezone,
    latitude: natal.latitude,
    longitude: natal.longitude,
    partner_date_time: `${transitDate}T${transitTime}:00Z`,
    partner_timezone_as_float: 0,
    orb_factor: orbFactor,
  });

  return (
    <Card title="Transit Bi-Wheel" subtitle={natal.place} className={className}>
      <StatusView state={state}>
        {(data) => <WesternWheel data={data} size={size} outerLabel="Natal" innerLabel="Transit" />}
      </StatusView>
    </Card>
  );
}
