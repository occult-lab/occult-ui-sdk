"use client";

import { useMemo } from "react";
import { Card } from "../primitives/Card";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import {
  CENTRES,
  CHANNELS,
  GATES,
  VIEW_H,
  VIEW_W,
  bodyPath,
  channelHalf,
  channelPath,
  shapeToPath,
  type ChannelDef,
} from "@/lib/bodygraphGeometry";
import type { BirthDetails, CommonProps } from "@/types";

/**
 * Human Design's own colour convention, sampled from the reference render
 * this geometry was matched against - not restyled to the library's theme
 * tokens, because red-for-design/black-for-personality IS the legend. A
 * bodygraph in brand colours would be unreadable to anyone who knows the
 * system, the same reasoning panchang-web's version states.
 */
const DESIGN = "#d0473f";
const PERSONALITY = "#3a3a3a";
const BODY = "#e1e1e1";
const PIPE = "#ffffff";
const OPEN_FILL = "#ffffff";
const BADGE = "#7d9ba9";
const TEXT_ON_LIGHT = "#6f7378";
const TEXT_ON_DARK = "#eadfda";

const DEFINED_FILL: Record<string, string> = {
  head: "#dcb98e", ajna: "#dcb98e", throat: "#dcb98e", identity: "#dcb98e",
  will: "#dcb98e", spleen: "#dcb98e",
  sacral: "#d04a49", solar_plexus: "#57423e", root: "#57423e",
};
const DARK_FILLS = new Set(["sacral", "solar_plexus", "root"]);

const PIPE_W = 14;
const INNER_W = 6;

const BODIES: [string, string][] = [
  ["sun", "☉"], ["earth", "⊕"], ["north_node", "☊"], ["south_node", "☋"],
  ["moon", "☽"], ["mercury", "☿"], ["venus", "♀"], ["mars", "♂"],
  ["jupiter", "♃"], ["saturn", "♄"], ["uranus", "♅"], ["neptune", "♆"], ["pluto", "♇"],
];

type Layer = "design" | "personality";
interface Activation { body?: string; gate?: number; line?: number }
interface GateDetail { gate: number; centre?: string; layers?: Layer[] }
interface CentreState { centre: string; defined?: boolean }
interface ChannelState { gates?: number[]; sources?: Record<string, Layer[]> }

interface ChartResponse {
  centres: CentreState[];
  channels: ChannelState[];
  gates_detail: GateDetail[];
  design: Activation[];
  personality: Activation[];
  type: string;
  authority: string;
}

function layersOf(ch: ChannelState): Layer[] {
  const seen = new Set<Layer>();
  for (const list of Object.values(ch.sources ?? {})) {
    for (const layer of list ?? []) seen.add(layer);
  }
  return [...seen];
}

function ColouredPipe({ d, layers }: { d: string; layers: Layer[] }) {
  const design = layers.includes("design");
  const personality = layers.includes("personality");
  if (design && personality) {
    return (
      <>
        <path d={d} stroke={DESIGN} strokeWidth={PIPE_W} />
        <path d={d} stroke={PERSONALITY} strokeWidth={INNER_W} />
      </>
    );
  }
  return <path d={d} stroke={design ? DESIGN : PERSONALITY} strokeWidth={PIPE_W} />;
}

function ActivationColumn({
  title, rows, colour, align,
}: { title: string; rows: Activation[]; colour: string; align: "left" | "right" }) {
  const byBody = new Map<string, Activation>();
  for (const r of rows ?? []) if (r.body) byBody.set(r.body, r);
  return (
    <div style={{ display: "flex", width: 84, flexShrink: 0, flexDirection: "column", gap: 4 }}>
      <p
        style={{
          fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--occult-fg-muted)", textAlign: align, margin: 0,
        }}
      >
        {title}
      </p>
      {BODIES.map(([body, glyph]) => {
        const row = byBody.get(body);
        return (
          <div
            key={body}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              borderRadius: 6, background: "var(--occult-bg-subtle)", padding: "2px 6px",
              justifyContent: align === "right" ? "flex-end" : "flex-start",
            }}
          >
            <span style={{ fontSize: "0.8rem", lineHeight: 1, color: colour }}>{glyph}</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--occult-fg)" }}>
              {row?.gate != null ? `${row.gate}.${row.line ?? "-"}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface BodygraphProps extends BirthDetails, CommonProps {
  size?: number;
}

/**
 * The Human Design bodygraph: nine centres, 36 channels, 64 gates, drawn
 * from the same fixed layout every chart shares - only which parts are
 * FILLED changes. Ported from panchang-web's already-verified geometry (see
 * lib/bodygraphGeometry.ts's header for why re-deriving it is not worth
 * repeating) and adapted to this library's data-fetching and theme system.
 * Verified live: /api/astro/human-design/chart/.
 */
export function Bodygraph({
  date, time, latitude, longitude, timezone, place, size = 360, className,
}: BodygraphProps) {
  const state = useOccultQuery<ChartResponse>("astro/human-design/chart", {
    date_time: `${date}T${time}${timezone >= 0 ? "+" : "-"}${String(Math.abs(Math.trunc(timezone))).padStart(2, "0")}:${String(Math.round((Math.abs(timezone) % 1) * 60)).padStart(2, "0")}`,
    timezone_as_float: timezone,
    latitude,
    longitude,
  });

  return (
    <Card title="Bodygraph" subtitle={place} className={className}>
      <StatusView state={state}>{(data) => <BodygraphChart data={data} size={size} />}</StatusView>
    </Card>
  );
}

function BodygraphChart({ data, size }: { data: ChartResponse; size: number }) {
  const definedCentres = useMemo(() => {
    const set = new Set<string>();
    for (const c of data.centres ?? []) if (c.defined) set.add(c.centre);
    return set;
  }, [data.centres]);

  const gateLayers = useMemo(() => {
    const map = new Map<number, Layer[]>();
    for (const g of data.gates_detail ?? []) {
      if (typeof g.gate === "number") map.set(g.gate, g.layers ?? []);
    }
    return map;
  }, [data.gates_detail]);

  const definedChannels = useMemo(() => {
    const map = new Map<string, Layer[]>();
    for (const ch of data.channels ?? []) {
      const [a, b] = ch.gates ?? [];
      if (typeof a !== "number" || typeof b !== "number") continue;
      map.set(`${Math.min(a, b)}-${Math.max(a, b)}`, layersOf(ch));
    }
    return map;
  }, [data.channels]);

  const keyOf = (ch: ChannelDef) => `${Math.min(ch.a, ch.b)}-${Math.max(ch.a, ch.b)}`;

  const coloured = useMemo(() => {
    const out: { key: string; d: string; layers: Layer[] }[] = [];
    for (const ch of CHANNELS) {
      const key = keyOf(ch);
      const whole = definedChannels.get(key);
      if (whole && whole.length > 0) {
        out.push({ key, d: channelPath(ch), layers: whole });
        continue;
      }
      const la = gateLayers.get(ch.a) ?? [];
      const lb = gateLayers.get(ch.b) ?? [];
      if (la.length > 0) out.push({ key: `${key}:a`, d: channelHalf(ch, ch.a), layers: la });
      if (lb.length > 0) out.push({ key: `${key}:b`, d: channelHalf(ch, ch.b), layers: lb });
    }
    return out;
  }, [definedChannels, gateLayers]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", width: "100%", alignItems: "flex-start", justifyContent: "center", gap: "0.75rem" }}>
        <ActivationColumn title="Design" rows={data.design ?? []} colour={DESIGN} align="left" />

        <div style={{ width: "100%", maxWidth: size, flexShrink: 1 }}>
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Human Design bodygraph">
            <path d={bodyPath()} fill={BODY} stroke="none" />

            <g fill="none" strokeLinecap="round">
              {CHANNELS.map((ch) => (
                <path key={keyOf(ch)} d={channelPath(ch)} stroke={PIPE} strokeWidth={PIPE_W} />
              ))}
            </g>

            <g fill="none" strokeLinecap="round">
              {coloured.map((c) => (
                <ColouredPipe key={c.key} d={c.d} layers={c.layers} />
              ))}
            </g>

            <g>
              {CENTRES.map((c) => (
                <path
                  key={c.key}
                  d={shapeToPath(c.shape)}
                  fill={definedCentres.has(c.key) ? (DEFINED_FILL[c.key] ?? "#dcb98e") : OPEN_FILL}
                />
              ))}
            </g>

            <g fontFamily="system-ui, sans-serif">
              {Object.entries(GATES).map(([raw, g]) => {
                const gate = Number(raw);
                const active = (gateLayers.get(gate) ?? []).length > 0;
                const dark = DARK_FILLS.has(g.centre) && definedCentres.has(g.centre);
                if (!active) {
                  return (
                    <text key={gate} x={g.x} y={g.y + 5} textAnchor="middle" fontSize={15} fontWeight={500} fill={dark ? TEXT_ON_DARK : TEXT_ON_LIGHT}>
                      {gate}
                    </text>
                  );
                }
                return (
                  <g key={gate}>
                    <circle cx={g.x} cy={g.y} r={12} fill={BADGE} />
                    <text x={g.x} y={g.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#ffffff">
                      {gate}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <ActivationColumn title="Personality" rows={data.personality ?? []} colour={PERSONALITY} align="right" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem 1.1rem", fontSize: "0.75rem", color: "var(--occult-fg-muted)" }}>
        <Legend colour={DESIGN} label="Design (~3 months before birth)" />
        <Legend colour={PERSONALITY} label="Personality (birth moment)" />
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ position: "relative", height: 10, width: 24, borderRadius: 999, background: DESIGN, display: "inline-block" }}>
            <span style={{ position: "absolute", inset: "3px 0", borderRadius: 999, background: PERSONALITY }} />
          </span>
          Both
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ height: 12, width: 12, borderRadius: "50%", background: BADGE, display: "inline-block" }} />
          Active gate
        </span>
      </div>
    </div>
  );
}

function Legend({ colour, label }: { colour: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ height: 10, width: 24, borderRadius: 999, background: colour, display: "inline-block" }} />
      {label}
    </span>
  );
}
