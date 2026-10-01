"use client";

/**
 * The circular chart style, drawn as the Yogatara web app draws it
 * (components/chart/CircularWheel.tsx and lib/charts/circular.ts there):
 * outside in, the signs, the 27 nakshatras, the bodies at their exact
 * degree, and the house numbers, with the Ascendant on the left and the
 * zodiac running anticlockwise. Houses are whole signs unless `cusps` are
 * given (KP's Placidus cusps, numbered I-XII).
 *
 * Draws in a 1000 x 1000 viewBox and scales to `size` / its container.
 */

import { WHEEL_COLOR } from "../western/westernWheelShared";

const SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"] as const;

/** The 27 nakshatras, short enough to fit their 13°20′ of the ring. */
const NAKSHATRA_SHORT = [
  "Ash", "Bha", "Kri", "Roh", "Mri", "Ard", "Pun", "Pus", "Asl",
  "Mag", "PPh", "UPh", "Has", "Chi", "Swa", "Vis", "Anu", "Jye",
  "Mul", "PSh", "USh", "Shr", "Dha", "Sha", "PBh", "UBh", "Rev",
] as const;

const C = 500;
const R_OUT = 492;
const R_SIGN = 420; // signs between R_SIGN and R_OUT
const R_NAK = 372; // nakshatras between R_NAK and R_SIGN
const R_HOUSE = 158; // bodies between R_HOUSE and R_NAK
const R_CORE = 102; // house numbers between R_CORE and R_HOUSE
const TIER_R = [320, 252, 186];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export type CircularBody = { key: string; label: string; lon: number; ascendant?: boolean; color?: string };
type PlacedBody = CircularBody & { tier: number };

/** Screen angle in degrees, counter-clockwise from 3 o'clock, with the Ascendant at 9 o'clock. */
const screenAngle = (lon: number, ascLon: number) => 180 + (lon - ascLon);

/** A point `r` from the centre at a screen angle (SVG y grows downward). */
function polar(r: number, angle: number): { x: number; y: number } {
  const a = (angle * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C - r * Math.sin(a) };
}

/** "24°57′" for a degree within a sign. */
function degMin(deg: number): string {
  const total = Math.floor(deg * 60 + 1e-6);
  return `${Math.floor(total / 60)}°${String(total % 60).padStart(2, "0")}′`;
}

const arcGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * Each body keeps its exact angle; a body whose label would touch another's
 * on the same ring moves to the next ring inward (tier 0 is the outermost).
 * When every ring is crowded the body goes where it overlaps least.
 */
function placeBodies(bodies: CircularBody[], tierRadii: number[], width: (b: CircularBody) => number, pad = 6): PlacedBody[] {
  const placed: PlacedBody[] = [];
  const widths = new Map<string, number>();
  for (const b of [...bodies].sort((x, y) => x.lon - y.lon)) {
    const w = width(b);
    let best = 0;
    let bestOverlap = Infinity;
    for (let t = 0; t < tierRadii.length; t++) {
      const toDeg = 180 / Math.PI / tierRadii[t]!;
      const overlap = Math.max(
        0,
        ...placed.filter((p) => p.tier === t).map((p) => ((w + (widths.get(p.key) ?? 0)) / 2 + pad) * toDeg - arcGap(p.lon, b.lon)),
      );
      if (overlap === 0) {
        best = t;
        break;
      }
      if (overlap < bestOverlap) {
        best = t;
        bestOverlap = overlap;
      }
    }
    widths.set(b.key, w);
    placed.push({ ...b, tier: best });
  }
  return placed;
}

function sector(r1: number, r2: number, a1: number, a2: number) {
  const p1 = polar(r2, a1);
  const p2 = polar(r2, a2);
  const p3 = polar(r1, a2);
  const p4 = polar(r1, a1);
  // Angles grow counter-clockwise on screen, which is SVG's sweep-flag 0.
  return `M${p1.x} ${p1.y} A${r2} ${r2} 0 0 0 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${r1} ${r1} 0 0 1 ${p4.x} ${p4.y} Z`;
}

export function CircularChartWheel({
  ascLon,
  bodies,
  cusps,
  size,
  ariaLabel = "Circular chart",
}: {
  /** The Ascendant, 0-360 from 0° Aries; it sits at 9 o'clock. */
  ascLon: number;
  bodies: CircularBody[];
  /** Twelve house cusps (0-360), drawn as house lines numbered I-XII. Whole-sign houses when absent. */
  cusps?: number[];
  size: number;
  ariaLabel?: string;
}) {
  const ascSign = Math.floor((((ascLon % 360) + 360) % 360) / 30);
  const at = (lon: number) => screenAngle(lon, ascLon);
  const nameSize = 30;
  const degSize = 19;
  // A label is as wide as its name or the degree under it, whichever is wider.
  const placed = placeBodies(bodies, TIER_R, (b) => Math.max(b.label.length * nameSize * 0.6, 6 * degSize * 0.55));
  const houseCusps = cusps && cusps.length === 12 ? cusps : null;

  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} className="occult-astro-wheel" role="img" aria-label={ariaLabel}>
      <circle cx={C} cy={C} r={R_OUT} fill={WHEEL_COLOR.bg} stroke={WHEEL_COLOR.border} strokeWidth={3} />

      {/* Signs, the Ascendant's tinted like the lagna house of the square charts. */}
      {SIGN_ABBR.map((abbr, i) => {
        const a1 = at(i * 30);
        const mid = polar((R_SIGN + R_OUT) / 2, a1 + 15);
        return (
          <g key={abbr}>
            {i === ascSign && <path d={sector(R_HOUSE, R_OUT, a1, a1 + 30)} fill={WHEEL_COLOR.cream} />}
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={700} fill={WHEEL_COLOR.label}>
              {abbr}
            </text>
          </g>
        );
      })}

      <circle cx={C} cy={C} r={R_SIGN} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={2} />
      <circle cx={C} cy={C} r={R_NAK} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={1.5} />
      <circle cx={C} cy={C} r={R_HOUSE} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={2} />
      <circle cx={C} cy={C} r={R_CORE} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={1.5} />

      {/* Nakshatra divisions and names. */}
      {NAKSHATRA_SHORT.map((n, i) => {
        const a = at((i * 40) / 3);
        const p1 = polar(R_NAK, a);
        const p2 = polar(R_SIGN, a);
        const mid = polar((R_NAK + R_SIGN) / 2, a + 20 / 3);
        return (
          <g key={`${n}${i}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={WHEEL_COLOR.border} strokeWidth={0.8} opacity={0.6} />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={18} fill={WHEEL_COLOR.label} opacity={0.7}>
              {n}
            </text>
          </g>
        );
      })}

      {/* Sign boundaries across the sign and nakshatra rings. */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = at(i * 30);
        const p1 = polar(houseCusps ? R_NAK : R_CORE, a);
        const p2 = polar(R_OUT, a);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={WHEEL_COLOR.border} strokeWidth={2} />;
      })}

      {/* Houses: whole signs, or the given cusps. */}
      {houseCusps
        ? houseCusps.map((cusp, i) => {
            const next = houseCusps[(i + 1) % 12]!;
            const span = (((next - cusp) % 360) + 360) % 360;
            const a = at(cusp);
            const p1 = polar(R_CORE, a);
            const p2 = polar(R_NAK, a);
            const mid = polar((R_CORE + R_HOUSE) / 2, a + span / 2);
            return (
              <g key={`cusp${i}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={WHEEL_COLOR.border} strokeWidth={i % 3 === 0 ? 2.5 : 1.2} strokeDasharray={i % 3 === 0 ? undefined : "8 6"} />
                <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={i === 0 ? 700 : 500} fill={i === 0 ? WHEEL_COLOR.ascendant : WHEEL_COLOR.label}>
                  {ROMAN[i]}
                </text>
              </g>
            );
          })
        : Array.from({ length: 12 }, (_, i) => {
            const house = ((i - ascSign + 12) % 12) + 1;
            const mid = polar((R_CORE + R_HOUSE) / 2, at(i * 30) + 15);
            return (
              <text key={`h${i}`} x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={house === 1 ? 700 : 500} fill={house === 1 ? WHEEL_COLOR.ascendant : WHEEL_COLOR.label}>
                {house}
              </text>
            );
          })}

      {/* Degree ticks every 10° inside the nakshatra ring. */}
      {Array.from({ length: 36 }, (_, i) => {
        if (i % 3 === 0) return null;
        const a = at(i * 10);
        const p1 = polar(R_NAK, a);
        const p2 = polar(R_NAK - 12, a);
        return <line key={`t${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={WHEEL_COLOR.border} strokeWidth={1} opacity={0.5} />;
      })}

      {/* The Ascendant's exact degree, on the eastern horizon. */}
      <line x1={C - R_NAK + 16} y1={C} x2={C - R_OUT} y2={C} stroke={WHEEL_COLOR.ascendant} strokeWidth={4} />

      {/* Bodies: a tick at the exact degree, the name and degree inward of it. */}
      {placed.map((b) => {
        const a = at(b.lon);
        const color = b.color ?? (b.ascendant ? WHEEL_COLOR.ascendant : WHEEL_COLOR.planet);
        const t1 = polar(R_NAK, a);
        const t2 = polar(R_NAK - 16, a);
        const name = polar(TIER_R[b.tier] ?? TIER_R[0]!, a);
        return (
          <g key={b.key}>
            <title>{`${b.label} ${degMin(((b.lon % 30) + 30) % 30)} ${SIGN_ABBR[Math.floor((((b.lon % 360) + 360) % 360) / 30)]}`}</title>
            <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={color} strokeWidth={3} />
            <text x={name.x} y={name.y} textAnchor="middle" dominantBaseline="central" fontSize={nameSize} fontWeight={700} fill={color}>
              {b.label}
            </text>
            {/* Under the name wherever the body is, so it reads the same all round. */}
            <text x={name.x} y={name.y + (nameSize + degSize) / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={degSize} fill={color}>
              {degMin(((b.lon % 30) + 30) % 30)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
