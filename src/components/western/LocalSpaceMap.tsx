"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface LocalSpaceLine {
  object: string;
  azimuth_deg: number;
  compass: string;
  above_horizon: boolean;
  line: { latitude_deg: number; longitude_deg: number }[];
}

interface LocalSpaceResponse {
  origin: { latitude_deg: number; longitude_deg: number };
  lines: LocalSpaceLine[];
}

export interface LocalSpaceMapProps extends BirthDetails, CommonProps {
  bodies?: string[];
  width?: number;
}

const BODY_COLOUR: Record<string, string> = {
  sun: "#f59e0b", moon: "#94a3b8", mercury: "#22c55e", venus: "#ec4899",
  mars: "#dc2626", jupiter: "#8b5cf6", saturn: "#0891b2",
  uranus: "#06b6d4", neptune: "#3b82f6", pluto: "#6b21a8",
};

function project(lon: number, lat: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}

/**
 * Local Space: a line from the birth PLACE outward in the exact compass
 * direction each planet stood at the birth moment - a different technique
 * from astrocartography (which traces where a planet's angle would fall
 * anywhere on Earth); this one is anchored to one place. Same plain
 * lat/long grid as AstrocartographyMap, for the same reason (no bundled
 * coastline dataset). Verified live:
 * /api/astro/astrocartography/local-space/.
 */
export function LocalSpaceMap({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  bodies = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"],
  width = 640,
  className,
}: LocalSpaceMapProps) {
  const state = useOccultQuery<LocalSpaceResponse>("astro/astrocartography/local-space", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
    bodies,
  });

  const height = width / 2;

  return (
    <Card title="Local Space" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="occult-wheel" style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}>
              <rect x={0} y={0} width={width} height={height} fill="var(--occult-bg-subtle)" stroke="var(--occult-border)" strokeWidth={1} />
              {Array.from({ length: 11 }, (_, i) => i * 30 - 150).map((lon) => {
                const { x } = project(lon, 0, width, height);
                return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={height} stroke="var(--occult-border)" strokeWidth={lon === 0 ? 1 : 0.4} opacity={0.6} />;
              })}
              {Array.from({ length: 5 }, (_, i) => i * 30 - 60).map((lat) => {
                const { y } = project(0, lat, width, height);
                return <line key={`lat${lat}`} x1={0} y1={y} x2={width} y2={y} stroke="var(--occult-border)" strokeWidth={lat === 0 ? 1 : 0.4} opacity={0.6} />;
              })}

              {(() => {
                const p = project(data.origin.longitude_deg, data.origin.latitude_deg, width, height);
                return <circle cx={p.x} cy={p.y} r={5} fill="var(--occult-fg)" />;
              })()}

              {data.lines.map((body) => {
                const colour = BODY_COLOUR[body.object] ?? "var(--occult-accent)";
                const origin = project(data.origin.longitude_deg, data.origin.latitude_deg, width, height);
                const path = [origin, ...body.line.map((pt) => project(pt.longitude_deg, pt.latitude_deg, width, height))]
                  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                  .join(" ");
                return <path key={body.object} d={path} fill="none" stroke={colour} strokeWidth={1.3} opacity={body.above_horizon ? 1 : 0.45} />;
              })}
            </svg>
            <DataTable
              className="occult-space-top"
              rows={data.lines.map((l) => ({
                object: labelize(l.object),
                compass: l.compass,
                azimuth: `${l.azimuth_deg.toFixed(1)}°`,
                above_horizon: l.above_horizon,
              }))}
              columns={[
                { path: "object", label: "Body" },
                { path: "compass", label: "Direction" },
                { path: "azimuth", label: "Azimuth" },
                { path: "above_horizon", label: "Above Horizon", render: (v) => (v ? "✓" : "—") },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
