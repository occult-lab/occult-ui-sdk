"use client";

/**
 * Shared rendering for every two-ring Western wheel this library draws -
 * currently SynastryWheel (two people) and TransitBiWheel (natal vs. a
 * second moment). Both call /api/astro/western/synastry/ with the same
 * response shape; the only difference is what the two rings are LABELLED.
 *
 * Drawn as the Yogatara web app draws its synastry bi-wheel (see
 * ../western/wheelWestern.tsx): person_a on the inner ring in the planet
 * colour, person_b on the outer ring in blue, cross-chart aspects in the
 * centre. The response has no ascendant or house cusps, so the wheel is
 * turned to 0° Aries on the left and no houses or angles are drawn.
 */

import { WesternChartWheel, type WheelAspect, type WheelBody } from "../western/wheelWestern";
import { aspectKey } from "../western/westernWheelShared";

export interface WesternPlanet {
  name: string;
  longitude: number;
  sign: string;
}

export interface SynastryAspect {
  person_a: string;
  person_b: string;
  aspect: string;
  orb: number;
}

export interface WesternWheelResponse {
  person_a: WesternPlanet[];
  person_b: WesternPlanet[];
  aspects: SynastryAspect[];
}

/** The API also sends `retrograde` on each body; read it where present. */
function toBodies(list: WesternPlanet[] | undefined): WheelBody[] {
  return (list ?? [])
    .filter((p) => Number.isFinite(p.longitude))
    .map((p) => ({ name: p.name, longitude: p.longitude, retrograde: (p as { retrograde?: unknown }).retrograde === true }));
}

export function WesternWheel({
  data,
  size,
  outerLabel = "B",
  innerLabel = "A",
}: {
  data: WesternWheelResponse;
  size: number;
  /** person_b's ring, outside (blue). */
  outerLabel?: string;
  /** person_a's ring, inside (planet red). */
  innerLabel?: string;
}) {
  const aspects: WheelAspect[] = [];
  for (const a of data.aspects ?? []) {
    const type = aspectKey(String(a.aspect ?? ""));
    if (!type) continue;
    aspects.push({ a: `in:${a.person_a}`, b: `out:${a.person_b}`, type, orb: a.orb });
  }

  return (
    <WesternChartWheel
      bodies={toBodies(data.person_a)}
      outerBodies={toBodies(data.person_b)}
      aspects={aspects}
      innerLabel={innerLabel}
      outerLabel={outerLabel}
      size={size}
      ariaLabel={`Bi-wheel: ${innerLabel} inside, ${outerLabel} outside`}
    />
  );
}
