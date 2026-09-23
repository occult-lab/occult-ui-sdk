"use client";

/**
 * Shared rendering for every two-ring Western wheel this library draws -
 * currently SynastryWheel (two people) and TransitBiWheel (natal vs. right
 * now). Both call /api/astro/western/synastry/ with the same response
 * shape; the only difference is what the two rings are LABELLED. Kept in
 * one place so a geometry fix (like the sign-abbreviation bug found and
 * fixed in SouthIndianChartWheel) only has to happen once.
 */

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

import { SIGN_GLYPH, PLANET_ABBR } from "../western/westernWheelShared";

/** Trine/sextile read as flowing, square/opposition as friction - the two
 *  families a two-ring wheel actually needs to distinguish visually. */
const HARMONIOUS = new Set(["trine", "sextile"]);
const CHALLENGING = new Set(["square", "opposition"]);

function angleToPoint(longitudeDeg: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  // 0 deg (Aries) at the top, clockwise. There is no ascendant in this
  // response to orient the wheel by (no house cusps at all), so this is a
  // stated convention, not a claim about a specific house system.
  const rad = ((longitudeDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function WesternWheel({
  data,
  size,
  outerLabel = "A",
  innerLabel = "B",
}: {
  data: WesternWheelResponse;
  size: number;
  /** Filled dots, outer ring. */
  outerLabel?: string;
  /** Outlined dots, inner ring. */
  innerLabel?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const zodiacR = outerR - 18;
  const ringA = zodiacR - 22;
  const ringB = ringA - 34;

  const byName = (list: WesternPlanet[]) => {
    const map = new Map<string, WesternPlanet>();
    for (const p of list) map.set(p.name, p);
    return map;
  };
  const aMap = byName(data.person_a);
  const bMap = byName(data.person_b);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="occult-wheel" style={{ display: "block", margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={outerR} className="occult-wheel__ring" />
      <circle cx={cx} cy={cy} r={zodiacR} className="occult-wheel__ring" />
      <circle cx={cx} cy={cy} r={ringA} className="occult-wheel__ring" />
      <circle cx={cx} cy={cy} r={ringB} fill="none" stroke="var(--occult-border)" strokeWidth={0.5} strokeDasharray="2 3" />

      {Object.entries(SIGN_GLYPH).map(([sign, glyph], i) => {
        const start = i * 30;
        const spoke = angleToPoint(start, outerR, cx, cy);
        const mid = angleToPoint(start + 15, (zodiacR + outerR) / 2, cx, cy);
        return (
          <g key={sign}>
            <line x1={cx} y1={cy} x2={spoke.x} y2={spoke.y} stroke="var(--occult-border)" strokeWidth={0.4} opacity={0.5} />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="var(--occult-fg-muted)">
              {glyph}
            </text>
          </g>
        );
      })}

      {data.aspects.map((asp, i) => {
        const pa = aMap.get(asp.person_a);
        const pb = bMap.get(asp.person_b);
        if (!pa || !pb) return null;
        const p1 = angleToPoint(pa.longitude, ringA, cx, cy);
        const p2 = angleToPoint(pb.longitude, ringB, cx, cy);
        const colour = HARMONIOUS.has(asp.aspect)
          ? "#3b82f6"
          : CHALLENGING.has(asp.aspect)
          ? "#dc2626"
          : "var(--occult-fg-muted)";
        return (
          <line
            key={`${asp.person_a}-${asp.person_b}-${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colour}
            strokeWidth={0.7}
            opacity={0.55}
          />
        );
      })}

      {data.person_a.map((p) => {
        const pt = angleToPoint(p.longitude, ringA, cx, cy);
        return (
          <g key={`a-${p.name}`}>
            <circle cx={pt.x} cy={pt.y} r={9} fill="var(--occult-accent)" />
            <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--occult-accent-fg)">
              {PLANET_ABBR[p.name] ?? p.name.slice(0, 2)}
            </text>
          </g>
        );
      })}

      {data.person_b.map((p) => {
        const pt = angleToPoint(p.longitude, ringB, cx, cy);
        return (
          <g key={`b-${p.name}`}>
            <circle cx={pt.x} cy={pt.y} r={9} fill="var(--occult-bg)" stroke="var(--occult-accent)" strokeWidth={1.5} />
            <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--occult-accent)">
              {PLANET_ABBR[p.name] ?? p.name.slice(0, 2)}
            </text>
          </g>
        );
      })}

      <title>{`${outerLabel} (filled) vs. ${innerLabel} (outlined)`}</title>
    </svg>
  );
}
