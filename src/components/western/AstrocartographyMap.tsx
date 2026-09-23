"use client";

import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import { toApiDateTime } from "@/lib/format";
import { WORLD_LAND_PATH } from "./worldLand";
import type { BirthDetails, CommonProps } from "@/types";

interface LinePoint {
  latitude_deg: number;
  longitude_deg: number;
}

type LineCurve = { kind: "curve"; line_type: "AC" | "DC"; points: LinePoint[] };
type LineMeridian = { kind: "meridian"; line_type: "MC" | "IC"; longitude_deg: number };

interface BodyLines {
  object: string;
  asc: LineCurve;
  dsc: LineCurve;
  mc: LineMeridian;
  ic: LineMeridian;
}

interface AstrocartographyResponse {
  lines: BodyLines[];
}

export interface AstrocartographyMapProps extends BirthDetails, CommonProps {
  bodies?: string[];
  width?: number;
}

const BODY_COLOUR: Record<string, string> = {
  sun: "#f59e0b", moon: "#94a3b8", mercury: "#22c55e", venus: "#ec4899",
  mars: "#dc2626", jupiter: "#8b5cf6", saturn: "#0891b2",
  uranus: "#06b6d4", neptune: "#3b82f6", pluto: "#6b21a8",
};

/** Equirectangular projection: longitude -180..180 -> x 0..W, latitude 90..-90 -> y 0..H. */
function project(lon: number, lat: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}

/**
 * Astrocartography lines - where each planet was rising (AC), setting (DC),
 * overhead (MC) or underfoot (IC) at the birth moment, traced across the
 * whole globe, over real coastlines on an equirectangular projection. The
 * land outline is Natural Earth's public-domain 110m geometry, converted to
 * a path string at build time (scripts/build-world-land.mjs), so there is no
 * map dependency to install, no tile server to call and nothing to break
 * offline. The lines themselves are exact, verified live against
 * /api/astro/astrocartography/lines/.
 */
export function AstrocartographyMap({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  bodies = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"],
  width = 640,
  className,
}: AstrocartographyMapProps) {
  const state = useOccultQuery<AstrocartographyResponse>("astro/astrocartography/lines", {
    date_time: toApiDateTime(date, time, timezone),
    timezone_as_float: timezone,
    latitude,
    longitude,
    bodies,
    latitude_step: 5,
  });

  const height = width / 2;

  return (
    <Card title="Astrocartography" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="occult-wheel" style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}>
              <rect x={0} y={0} width={width} height={height} fill="var(--occult-bg-subtle)" stroke="var(--occult-border)" strokeWidth={1} />

              {/* Coastlines, so a line through the Pacific reads differently
                  from one through Europe. Natural Earth's 110m land outline,
                  baked into a path string at build time (see
                  scripts/build-world-land.mjs) - public-domain geometry, no
                  tile server, no runtime dependency, and it works offline.
                  Its 360x180 lon/lat space maps onto this equirectangular
                  projection by scaling alone, which is exactly what
                  `project` below does. */}
              <g transform={`scale(${width / 360} ${height / 180})`}>
                <path
                  d={WORLD_LAND_PATH}
                  fill="var(--occult-land)"
                  stroke="var(--occult-border)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>

              {/* Graticule: a line every 30 degrees, equator/prime meridian emphasised. */}
              {Array.from({ length: 11 }, (_, i) => i * 30 - 150).map((lon) => {
                const { x } = project(lon, 0, width, height);
                return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={height} stroke="var(--occult-border)" strokeWidth={lon === 0 ? 1 : 0.4} opacity={0.6} />;
              })}
              {Array.from({ length: 5 }, (_, i) => i * 30 - 60).map((lat) => {
                const { y } = project(0, lat, width, height);
                return <line key={`lat${lat}`} x1={0} y1={y} x2={width} y2={y} stroke="var(--occult-border)" strokeWidth={lat === 0 ? 1 : 0.4} opacity={0.6} />;
              })}

              {/* Birth place marker. */}
              {(() => {
                const p = project(longitude, latitude, width, height);
                return <circle cx={p.x} cy={p.y} r={4} fill="var(--occult-fg)" />;
              })()}

              {data.lines.map((body) => {
                const colour = BODY_COLOUR[body.object] ?? "var(--occult-accent)";
                const curveToPath = (curve: LineCurve) =>
                  curve.points
                    .map((pt, i) => {
                      const p = project(pt.longitude_deg, pt.latitude_deg, width, height);
                      return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
                    })
                    .join(" ");
                const meridianToPath = (m: LineMeridian) => {
                  const top = project(m.longitude_deg, 85, width, height);
                  const bottom = project(m.longitude_deg, -85, width, height);
                  return `M${top.x},${top.y} L${bottom.x},${bottom.y}`;
                };
                return (
                  <g key={body.object}>
                    <path d={curveToPath(body.asc)} fill="none" stroke={colour} strokeWidth={1.3} />
                    <path d={curveToPath(body.dsc)} fill="none" stroke={colour} strokeWidth={1.3} strokeDasharray="4 3" />
                    <path d={meridianToPath(body.mc)} fill="none" stroke={colour} strokeWidth={1.3} />
                    <path d={meridianToPath(body.ic)} fill="none" stroke={colour} strokeWidth={1.3} strokeDasharray="4 3" />
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", marginTop: "0.75rem", fontSize: "0.75rem" }}>
              {data.lines.map((body) => (
                <span key={body.object} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 3, background: BODY_COLOUR[body.object] ?? "var(--occult-accent)", display: "inline-block" }} />
                  {body.object.charAt(0).toUpperCase() + body.object.slice(1)}
                </span>
              ))}
            </div>
          </>
        )}
      </StatusView>
    </Card>
  );
}
