"use client";

/**
 * The Western chart wheel, drawn as the Yogatara web app draws it
 * (components/western/WesternWheel.tsx there): a sign band tinted by element
 * with the sign glyphs, a 1/5/10-degree tick scale, house cusps and numbers,
 * the four angles, aspect lines in the centre coloured by tone (dashed for
 * minor aspects), and each body as a glyph with its degree, spread apart when
 * crowded but tied to its exact degree by a leader line. With `outerBodies`
 * it becomes a bi-wheel: the second chart on its own ring outside the first.
 *
 * Draws in a 1000 x 1000 viewBox and scales to `size` / its container.
 */

import {
  ASPECTS,
  SIGN_GLYPHS,
  TONE_COLOR,
  WHEEL_COLOR,
  formatLon,
  fullNameOf,
  glyphOf,
  norm360,
  titleOf,
  type AspectName,
} from "./westernWheelShared";

export type WheelBody = { name: string; longitude: number; retrograde?: boolean };
export type WheelAspect = { a: string; b: string; type: AspectName; orb?: number };

const C = 500;
const R_OUT = 490;
const R_SIGN_IN = 425;
const TICK_1 = 6;
const TICK_5 = 11;
const TICK_10 = 17;

const SIGN_FILL = {
  fire: "rgba(220, 80, 50, 0.08)",
  earth: "rgba(80, 140, 60, 0.08)",
  air: "rgba(210, 170, 40, 0.09)",
  water: "rgba(60, 110, 200, 0.08)",
} as const;
const ELEMENTS = ["fire", "earth", "air", "water"] as const;
const GLYPH_CLASS = "occult-astro-wheel__glyph";
const bare = (key: string) => key.replace(/^(in|out):/, "");

/** Screen point for a longitude: the rotation anchor on the left, the zodiac running anticlockwise. */
function polar(lon: number, asc: number, r: number): [number, number] {
  const t = Math.PI + ((lon - asc) * Math.PI) / 180;
  return [C + r * Math.cos(t), C - r * Math.sin(t)];
}

function arcPath(from: number, to: number, asc: number, rOut: number, rIn: number): string {
  const [x1, y1] = polar(from, asc, rOut);
  const [x2, y2] = polar(to, asc, rOut);
  const [x3, y3] = polar(to, asc, rIn);
  const [x4, y4] = polar(from, asc, rIn);
  // Longitude grows anticlockwise on screen, which is SVG sweep 0.
  return `M${x1},${y1} A${rOut},${rOut} 0 0 0 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 0 1 ${x4},${y4} Z`;
}

/**
 * Spread glyph positions so neighbours are at least `gap` degrees apart,
 * keeping each as close to its true longitude as the crowd allows.
 */
function spread(lons: number[], gap: number): number[] {
  const order = lons.map((l, i) => [norm360(l), i] as const).sort((a, b) => a[0] - b[0]);
  const pos = order.map(([l]) => l);
  for (let pass = 0; pass < 60 && pos.length > 1; pass++) {
    let moved = false;
    for (let k = 0; k < pos.length; k++) {
      const next = (k + 1) % pos.length;
      let d = pos[next]! - pos[k]!;
      if (next === 0) d += 360;
      if (d < gap) {
        const push = (gap - d) / 2;
        pos[k]! -= push;
        pos[next]! += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(lons.length);
  order.forEach(([, i], k) => (out[i] = pos[k]!));
  return out;
}

function BodyRing({
  bodies, asc, rGlyph, rTick, color, gap,
}: { bodies: WheelBody[]; asc: number; rGlyph: number; rTick: number; color: string; gap: number }) {
  const shown = spread(bodies.map((b) => b.longitude), gap);
  return (
    <g>
      {bodies.map((b, i) => {
        const [tx, ty] = polar(b.longitude, asc, rTick);
        const [tx2, ty2] = polar(b.longitude, asc, rTick - 9);
        const at = shown[i] ?? b.longitude;
        const [lx, ly] = polar(at, asc, rGlyph + 22);
        const [gx, gy] = polar(at, asc, rGlyph);
        const [dx, dy] = polar(at, asc, rGlyph - 30);
        const deg = Math.floor(norm360(b.longitude) % 30);
        return (
          <g key={`${b.name}-${i}`}>
            <title>{`${fullNameOf(b.name)} ${formatLon(b.longitude)}${b.retrograde ? " retrograde" : ""}`}</title>
            <line x1={tx} y1={ty} x2={tx2} y2={ty2} stroke={color} strokeWidth={2} />
            <line x1={tx2} y1={ty2} x2={lx} y2={ly} stroke={color} strokeWidth={1.1} opacity={0.75} />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize={36} fill={color} fontWeight={600} className={GLYPH_CLASS}>
              {glyphOf(b.name)}
            </text>
            <text x={dx} y={dy} textAnchor="middle" dominantBaseline="central" fontSize={17} fill={color} opacity={0.85}>
              {deg}°{b.retrograde ? "℞" : ""}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function WesternChartWheel({
  bodies,
  cusps,
  ascendant,
  midheaven,
  aspects = [],
  outerBodies,
  innerLabel,
  outerLabel,
  size,
  ariaLabel = "Western chart wheel",
}: {
  /** The chart on the inner ring (natal). */
  bodies: WheelBody[];
  /** Twelve house cusps from the first; leave out when the response has none. */
  cusps?: number[];
  /**
   * The Ascendant, drawn on the left with the AC/DC axis. Without one (a
   * response with no houses) the wheel is turned to 0° Aries on the left
   * and no angles are drawn.
   */
  ascendant?: number;
  midheaven?: number;
  /** Aspects drawn inside the wheel; on a bi-wheel name sides as "in:sun" / "out:sun". */
  aspects?: WheelAspect[];
  /** A second chart on an outer ring: transits, a partner. */
  outerBodies?: WheelBody[];
  innerLabel?: string;
  outerLabel?: string;
  size: number;
  ariaLabel?: string;
}) {
  const asc = ascendant ?? 0;
  const bi = !!outerBodies?.length;
  // Ring radii, outside in.
  const rOuterBand = bi ? R_SIGN_IN - TICK_10 - 6 : 0;
  const rSep = bi ? 345 : R_SIGN_IN - TICK_10 - 4;
  const rHouseOut = bi ? 272 : 300;
  const rHouseIn = rHouseOut - 34;
  const rAspect = rHouseIn;

  const byName = new Map<string, number>();
  if (ascendant !== undefined) byName.set("in:ascendant", ascendant);
  if (midheaven !== undefined) byName.set("in:midheaven", midheaven);
  bodies.forEach((b) => byName.set(`in:${b.name}`, b.longitude));
  (outerBodies ?? []).forEach((b) => byName.set(`out:${b.name}`, b.longitude));
  const find = (key: string) => byName.get(key) ?? byName.get(`in:${key}`) ?? byName.get(`out:${key}`);

  const angles: [string, number][] =
    ascendant === undefined
      ? []
      : [
          ["AC", ascendant],
          ["DC", ascendant + 180],
          ...(midheaven !== undefined ? ([["MC", midheaven], ["IC", midheaven + 180]] as [string, number][]) : []),
        ];

  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} className="occult-astro-wheel" role="img" aria-label={ariaLabel}>
      {/* Zodiac ring */}
      {SIGN_GLYPHS.map((glyph, s) => {
        const [gx, gy] = polar(s * 30 + 15, asc, (R_OUT + R_SIGN_IN) / 2);
        return (
          <g key={s}>
            <path d={arcPath(s * 30, s * 30 + 30, asc, R_OUT, R_SIGN_IN)} fill={SIGN_FILL[ELEMENTS[s % 4]!]} stroke={WHEEL_COLOR.border} strokeWidth={1.6} />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize={34} fill={WHEEL_COLOR.label} opacity={0.8} className={GLYPH_CLASS}>
              {glyph}
            </text>
          </g>
        );
      })}
      {/* Degree ticks */}
      {Array.from({ length: 360 }, (_, d) => {
        const len = d % 10 === 0 ? TICK_10 : d % 5 === 0 ? TICK_5 : TICK_1;
        const [x1, y1] = polar(d, asc, R_SIGN_IN);
        const [x2, y2] = polar(d, asc, R_SIGN_IN - len);
        return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WHEEL_COLOR.border} strokeWidth={d % 10 === 0 ? 1.4 : 0.9} opacity={0.95} />;
      })}
      <circle cx={C} cy={C} r={R_SIGN_IN} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={1.6} />
      {bi && <circle cx={C} cy={C} r={rSep} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={1.4} opacity={0.9} />}

      {/* Houses */}
      {cusps?.length === 12 && (
        <g>
          {cusps.map((cusp, h) => {
            const next = cusps[(h + 1) % 12]!;
            const span = norm360(next - cusp);
            const [nx, ny] = polar(cusp + span / 2, asc, (rHouseOut + rHouseIn) / 2);
            const angular = h % 3 === 0;
            const [x1, y1] = polar(cusp, asc, rAspect);
            const [x2, y2] = polar(cusp, asc, R_SIGN_IN - TICK_10);
            return (
              <g key={h}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={WHEEL_COLOR.border} strokeWidth={angular ? 2.8 : 1.4} opacity={angular ? 1 : 0.85} />
                <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" fontSize={17} fill={WHEEL_COLOR.label} opacity={0.85}>
                  {h + 1}
                </text>
              </g>
            );
          })}
        </g>
      )}
      <circle cx={C} cy={C} r={rHouseOut} fill="none" stroke={WHEEL_COLOR.border} strokeWidth={1.2} opacity={0.9} />
      <circle cx={C} cy={C} r={rHouseIn} fill={WHEEL_COLOR.bg} stroke={WHEEL_COLOR.border} strokeWidth={1.4} />

      {/* Angles */}
      {angles.map(([label, lon]) => {
        const [x, y] = polar(lon, asc, R_OUT + 2);
        const [lx, ly] = polar(lon, asc, R_OUT - 8);
        // In the house-number ring, just before the angle, clear of the house number.
        const [tx, ty] = polar(lon - 5, asc, (rHouseOut + rHouseIn) / 2);
        return (
          <g key={label}>
            <title>{`${label} ${formatLon(lon)}`}</title>
            <line x1={x} y1={y} x2={lx} y2={ly} stroke={WHEEL_COLOR.ascendant} strokeWidth={4} />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill={WHEEL_COLOR.ascendant}>
              {label}
            </text>
          </g>
        );
      })}

      {/* Aspects; conjunctions are left to the glyphs sitting together. */}
      {aspects.map((a, i) => {
        const la = find(a.a);
        const lb = find(a.b);
        if (la === undefined || lb === undefined) return null;
        const meta = ASPECTS[a.type];
        if (!meta || a.type === "conjunction") return null;
        const [x1, y1] = polar(la, asc, rAspect - 4);
        const [x2, y2] = polar(lb, asc, rAspect - 4);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TONE_COLOR[meta.tone]} strokeWidth={meta.major ? 2.2 : 1.5} strokeDasharray={meta.major ? undefined : "6 5"} opacity={0.95}>
            <title>{`${titleOf(bare(a.a))} ${meta.label} ${titleOf(bare(a.b))}${a.orb !== undefined ? ` (orb ${Math.abs(a.orb).toFixed(2)}°)` : ""}`}</title>
          </line>
        );
      })}

      {/* Bodies */}
      {bi ? (
        <>
          <BodyRing bodies={outerBodies!} asc={asc} rGlyph={(rOuterBand + rSep) / 2 + 4} rTick={R_SIGN_IN - TICK_10} color={WHEEL_COLOR.arudha} gap={7} />
          <BodyRing bodies={bodies} asc={asc} rGlyph={(rSep + rHouseOut) / 2 + 2} rTick={rSep} color={WHEEL_COLOR.planet} gap={8} />
        </>
      ) : (
        <BodyRing bodies={bodies} asc={asc} rGlyph={(rSep + rHouseOut) / 2 + 8} rTick={R_SIGN_IN - TICK_10} color={WHEEL_COLOR.planet} gap={7} />
      )}

      {/* Ring legend for bi-wheels */}
      {bi && (innerLabel || outerLabel) && (
        <g fontSize={17} textAnchor="middle" stroke={WHEEL_COLOR.bg} strokeWidth={5} paintOrder="stroke" strokeLinejoin="round">
          {outerLabel && <text x={C} y={C - 12} fill={WHEEL_COLOR.arudha} fontWeight={600}>{`Outer: ${outerLabel}`}</text>}
          {innerLabel && <text x={C} y={C + 16} fill={WHEEL_COLOR.planet} fontWeight={600}>{`Inner: ${innerLabel}`}</text>}
        </g>
      )}
    </svg>
  );
}
