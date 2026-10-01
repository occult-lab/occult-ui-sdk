"use client";

import type { ReactNode } from "react";
import { Card } from "../primitives/Card";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import { ASPECTS, aspectKey } from "./westernWheelShared";
import { WesternChartWheel, type WheelAspect, type WheelBody } from "./wheelWestern";
import type { BirthDetails, CommonProps } from "@/types";

interface WesternPlanet {
  name: string;
  longitude: number;
  retrograde?: boolean;
}

interface WesternAspect {
  from: string;
  to: string;
  aspect: string;
  orb?: number;
}

interface NatalChartResponse {
  planets: WesternPlanet[];
  aspects: WesternAspect[];
}

interface HouseCuspsResponse {
  house_cusps: number[];
}

export interface WesternNatalWheelProps extends BirthDetails, CommonProps {
  /** Any value /api/astro/house/ accepts for method_name; defaults to Placidus, the most common modern system. */
  houseSystem?: string;
  size?: number;
}

/**
 * A single-person Western circular wheel, drawn as the Yogatara web app
 * draws it (see wheelWestern.tsx): house cusps from the ascendant (not the
 * fixed 30-degree-per-house diamond the Vedic charts use), planet glyphs
 * with their degrees, and major-aspect lines in the centre - the
 * chart most Western astrology sites open with, and the one shape this
 * library didn't have yet: SynastryWheel/TransitBiWheel only ever draw two
 * charts at once, and KpChartWheel has cusps but no aspect lines. Two
 * calls, not one - /api/astro/western/natal-chart/ has the planets and
 * aspects but no house data at all; /api/astro/house/ has the cusps.
 * Verified live against both.
 */
export function WesternNatalWheel({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  houseSystem = "placidus",
  size = 420,
  className,
}: WesternNatalWheelProps) {
  const chart = useOccultQuery<NatalChartResponse>("astro/western/natal-chart", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  const houses = useOccultQuery<HouseCuspsResponse>("astro/house", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    method_name: houseSystem,
    notation: "degree",
    keys: ["house_cusps"],
  });

  // StatusView is built for one query; this needs two (planets+aspects from
  // one endpoint, house cusps from another - see the component doc comment
  // on why they can't be merged into one call). Handled directly rather
  // than forcing both through StatusView's single-T generic, which doesn't
  // narrow cleanly across two different response shapes.
  let body: ReactNode;
  if (chart.status === "error") {
    body = <div className="occult-status occult-status--error">{chart.error.message}</div>;
  } else if (houses.status === "error") {
    body = <div className="occult-status occult-status--error">{houses.error.message}</div>;
  } else if (chart.status === "success" && houses.status === "success") {
    body = (
      <Wheel planets={chart.data.planets} aspects={chart.data.aspects} cusps={houses.data.house_cusps} houseSystem={houseSystem} size={size} />
    );
  } else {
    body = (
      <div className="occult-status occult-status--loading" role="status" aria-live="polite">
        <span className="occult-spinner" aria-hidden="true" />
        Calculating…
      </div>
    );
  }

  return (
    <Card title="Natal Chart" subtitle={place} className={className}>
      {body}
    </Card>
  );
}

/**
 * House systems whose tenth cusp is the Midheaven. In Equal, Whole Sign and
 * the like it is not, and neither response gives the MC on its own, so the
 * MC/IC axis is drawn only for these.
 */
const QUADRANT_SYSTEM = /placidus|koch|regiomontan|campanus|porph|topocentric|polich|alcabit|krusinski|apc|meridian|axial/i;

function Wheel({
  planets,
  aspects,
  cusps,
  houseSystem,
  size,
}: {
  planets: WesternPlanet[];
  aspects: WesternAspect[];
  cusps: number[];
  houseSystem: string;
  size: number;
}) {
  const houseCusps = Array.isArray(cusps) && cusps.length === 12 && cusps.every((c) => Number.isFinite(c)) ? cusps : undefined;
  const ascendant = houseCusps?.[0];
  const midheaven = houseCusps && QUADRANT_SYSTEM.test(houseSystem) ? houseCusps[9] : undefined;

  const bodies: WheelBody[] = (planets ?? [])
    .filter((p) => Number.isFinite(p.longitude))
    .map((p) => ({ name: p.name, longitude: p.longitude, retrograde: p.retrograde === true }));

  // Major aspects only, as Yogatara's natal wheel shows by default.
  const lines: WheelAspect[] = [];
  for (const a of aspects ?? []) {
    const type = aspectKey(String(a.aspect ?? ""));
    if (!type || !ASPECTS[type].major) continue;
    lines.push({ a: a.from, b: a.to, type, orb: a.orb });
  }

  return (
    <WesternChartWheel
      bodies={bodies}
      cusps={houseCusps}
      ascendant={ascendant}
      midheaven={midheaven}
      aspects={lines}
      size={size}
      ariaLabel="Western natal chart wheel"
    />
  );
}
