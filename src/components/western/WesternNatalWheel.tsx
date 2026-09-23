"use client";

import type { ReactNode } from "react";
import { Card } from "../primitives/Card";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import { SIGN_GLYPH, PLANET_ABBR } from "./westernWheelShared";
import type { BirthDetails, CommonProps } from "@/types";

interface WesternPlanet {
  name: string;
  longitude: number;
}

interface WesternAspect {
  from: string;
  to: string;
  aspect: string;
}

interface NatalChartResponse {
  planets: WesternPlanet[];
  aspects: WesternAspect[];
}

interface HouseCuspsResponse {
  house_cusps: number[];
}

const HARMONIOUS = new Set(["trine", "sextile"]);
const CHALLENGING = new Set(["square", "opposition"]);

export interface WesternNatalWheelProps extends BirthDetails, CommonProps {
  /** Any value /api/astro/house/ accepts for method_name; defaults to Placidus, the most common modern system. */
  houseSystem?: string;
  size?: number;
}

/**
 * A single-person Western circular wheel: house cusps radiating from the
 * ascendant (not the fixed 30-degree-per-house diamond the Vedic charts
 * use), planets on the ring, and aspect lines threading the centre - the
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
      <Wheel planets={chart.data.planets} aspects={chart.data.aspects} cusps={houses.data.house_cusps} size={size} />
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

function angleToPoint(longitudeDeg: number, ascendant: number, radius: number, cx: number, cy: number) {
  // Ascendant fixed at the left (9 o'clock), running counter-clockwise -
  // the same convention KpChartWheel uses, and for the same reason: both
  // have a real ascendant to orient by, unlike SynastryWheel/TransitBiWheel
  // (no house data at all, hence their own 0-Aries-at-top convention).
  const rad = ((ascendant - longitudeDeg) * Math.PI) / 180 + Math.PI;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function Wheel({
  planets,
  aspects,
  cusps,
  size,
}: {
  planets: WesternPlanet[];
  aspects: WesternAspect[];
  cusps: number[];
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const zodiacR = outerR - 18;
  const cuspR = zodiacR - 4;
  const planetR = cuspR - 30;
  const ascendant = cusps[0] ?? 0;

  const byName = new Map(planets.map((p) => [p.name, p]));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="occult-wheel" style={{ display: "block", margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={outerR} className="occult-wheel__ring" />
      <circle cx={cx} cy={cy} r={zodiacR} className="occult-wheel__ring" />
      <circle cx={cx} cy={cy} r={planetR - 20} className="occult-wheel__ring" />

      {Object.entries(SIGN_GLYPH).map(([sign, glyph], i) => {
        // Signs are fixed to the ecliptic (0deg Aries, 30deg Taurus, ...),
        // not to the ascendant - only the wheel's rotation is anchored to
        // it, so this is the sign's own absolute longitude, not an
        // ascendant-relative offset.
        const pt = angleToPoint(i * 30 + 15, ascendant, (zodiacR + outerR) / 2, cx, cy);
        return (
          <text key={sign} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="var(--occult-fg-muted)">
            {glyph}
          </text>
        );
      })}

      {cusps.map((cuspDeg, i) => {
        const houseNum = i + 1;
        const rim = angleToPoint(cuspDeg, ascendant, cuspR, cx, cy);
        const isAngular = houseNum === 1 || houseNum === 4 || houseNum === 7 || houseNum === 10;
        const nextCusp = cusps[(i + 1) % 12] ?? cuspDeg;
        const span = ((nextCusp - cuspDeg + 360) % 360) || 30;
        const labelPt = angleToPoint(cuspDeg + span / 2, ascendant, cuspR - 14, cx, cy);
        return (
          <g key={houseNum}>
            <line x1={cx} y1={cy} x2={rim.x} y2={rim.y} stroke="var(--occult-border)" strokeWidth={isAngular ? 1.3 : 0.5} />
            <text x={labelPt.x} y={labelPt.y} textAnchor="middle" fontSize={8} fill="var(--occult-fg-muted)">
              {houseNum}
            </text>
          </g>
        );
      })}

      {aspects.map((asp, i) => {
        const a = byName.get(asp.from);
        const b = byName.get(asp.to);
        if (!a || !b) return null;
        const p1 = angleToPoint(a.longitude, ascendant, planetR - 20, cx, cy);
        const p2 = angleToPoint(b.longitude, ascendant, planetR - 20, cx, cy);
        const colour = HARMONIOUS.has(asp.aspect) ? "#3b82f6" : CHALLENGING.has(asp.aspect) ? "#dc2626" : "var(--occult-fg-muted)";
        return <line key={`${asp.from}-${asp.to}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colour} strokeWidth={0.7} opacity={0.5} />;
      })}

      {planets.map((p) => {
        const pt = angleToPoint(p.longitude, ascendant, planetR, cx, cy);
        return (
          <g key={p.name}>
            <circle cx={pt.x} cy={pt.y} r={9} fill="var(--occult-accent)" />
            <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--occult-accent-fg)">
              {PLANET_ABBR[p.name] ?? p.name.slice(0, 2)}
            </text>
          </g>
        );
      })}

      {/* Ascendant marker. */}
      {(() => {
        const asc = angleToPoint(ascendant, ascendant, outerR, cx, cy);
        return (
          <>
            <line x1={cx} y1={cy} x2={asc.x} y2={asc.y} stroke="var(--occult-accent)" strokeWidth={1.8} />
            <text x={asc.x < cx ? asc.x + 8 : asc.x - 8} y={asc.y} fontSize={9} fontWeight={700} fill="var(--occult-accent)" textAnchor={asc.x < cx ? "start" : "end"}>
              ASC
            </text>
          </>
        );
      })()}
    </svg>
  );
}
