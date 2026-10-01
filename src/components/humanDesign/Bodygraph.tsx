"use client";

import { useMemo, type CSSProperties } from "react";
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
 * Human Design's own colour convention, copied from the Yogatara B2B app's
 * bodygraph (components/humanDesign/Bodygraph.tsx), which was matched against
 * Jovian Archive's MyBodyGraph. Not restyled to the library's theme tokens:
 * red-for-design / black-for-personality IS the legend. The graph is drawn on
 * its own light silhouette, so these stay correct on a dark card too; only
 * the HTML around it (column titles, glyphs, legend swatches) needs the
 * --occult-hd-* variables in styles.css.
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

/** [key, glyph, name] in the order MMI lists them: Sun, Earth, Moon, the nodes, then the planets outward. */
const BODIES: [string, string, string][] = [
  ["sun", "☉", "Sun"], ["earth", "⊕", "Earth"], ["moon", "☽", "Moon"],
  ["north_node", "☊", "North Node"], ["south_node", "☋", "South Node"],
  ["mercury", "☿", "Mercury"], ["venus", "♀", "Venus"], ["mars", "♂", "Mars"],
  ["jupiter", "♃", "Jupiter"], ["saturn", "♄", "Saturn"], ["uranus", "♅", "Uranus"],
  ["neptune", "♆", "Neptune"], ["pluto", "♇", "Pluto"],
];

type Layer = "design" | "personality";
interface Activation {
  body?: string;
  gate?: number;
  line?: number;
  gate_name?: string;
  longitude?: number;
  color?: number;
  tone?: number;
  base?: number;
}
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

/** "56.5.3.3.2": gate, line, colour, tone, base (as far as the response has them). */
function activationCode(a: Activation): string {
  return [a.gate, a.line, a.color, a.tone, a.base].filter((v) => v != null).join(".");
}

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

/** "10°58′10″ Sagittarius" for a tropical longitude. */
function longitudeText(lon: number): string {
  const x = ((lon % 360) + 360) % 360;
  const total = Math.floor((x % 30) * 3600 + 1e-6);
  const d = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″ ${SIGNS[Math.floor(x / 30)]}`;
}

function ColouredPipe({ d, layers }: { d: string; layers: Layer[] }) {
  if (layers.includes("design") && layers.includes("personality")) {
    return (
      <>
        <path d={d} stroke={DESIGN} strokeWidth={PIPE_W} />
        <path d={d} stroke={PERSONALITY} strokeWidth={INNER_W} />
      </>
    );
  }
  return <path d={d} stroke={layers.includes("design") ? DESIGN : PERSONALITY} strokeWidth={PIPE_W} />;
}

/**
 * One side's activations as a two-column table: the body (glyph and name) and
 * its gate.line with the gate's name. Hovering a row gives the full
 * gate.line.colour.tone.base code and the longitude when the API sends them.
 */
function ActivationColumn({ title, rows, colour }: { title: string; rows: Activation[]; colour: string }) {
  const byBody = new Map<string, Activation>();
  for (const r of rows ?? []) if (r.body) byBody.set(r.body, r);
  return (
    <div className="occult-bodygraph__table">
      <div className="occult-bodygraph__row occult-bodygraph__row--head">
        <p className="occult-bodygraph__th" style={{ color: colour }}>{title}</p>
        <p className="occult-bodygraph__th">Gate · line</p>
      </div>
      <div className="occult-bodygraph__rows">
        {BODIES.map(([body, glyph, name]) => {
          const r = byBody.get(body);
          const has = r?.gate != null;
          const tip = has
            ? `${name}: ${activationCode(r!)}${r!.gate_name ? ` — ${r!.gate_name}` : ""}${r!.longitude != null ? `, ${longitudeText(r!.longitude)}` : ""}`
            : name;
          return (
            <div key={body} title={tip} className="occult-bodygraph__row">
              <span className="occult-bodygraph__cell">
                <span className="occult-bodygraph__glyph" style={{ color: colour }}>{glyph}</span>
                <span className="occult-bodygraph__name">{name}</span>
              </span>
              <span className="occult-bodygraph__cell occult-bodygraph__cell--baseline">
                <span className="occult-bodygraph__code">{has ? `${r!.gate}.${r!.line ?? "-"}` : "—"}</span>
                {r?.gate_name && <span className="occult-bodygraph__gatename">{r.gate_name}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface BodygraphProps extends BirthDetails, CommonProps {
  size?: number;
}

/**
 * The Human Design bodygraph: nine centres, 36 channels, 64 gates, drawn
 * from the same fixed layout every chart shares - only which parts are
 * FILLED changes. Geometry is lib/bodygraphGeometry.ts (identical to
 * Yogatara's lib/jyotish/bodygraph.ts); drawing, tables and legend follow
 * Yogatara's Bodygraph, which was matched against MyBodyGraph.
 * Verified live: /api/astro/human-design/chart/.
 *
 * `size` is the graph's maximum width in pixels; it always shrinks to fit.
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

function BodygraphGraphic({ data }: { data: ChartResponse }) {
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

  const keyOf = (ch: ChannelDef) => `${Math.min(ch.a, ch.b)}-${Math.max(ch.a, ch.b)}`;

  // A defined channel is drawn whole in its layers' colours; otherwise each
  // active gate colours its own half, as MMI draws a hanging gate.
  const coloured = useMemo(() => {
    const whole = new Map<string, Layer[]>();
    for (const ch of data.channels ?? []) {
      const [a, b] = ch.gates ?? [];
      if (typeof a !== "number" || typeof b !== "number") continue;
      whole.set(`${Math.min(a, b)}-${Math.max(a, b)}`, layersOf(ch));
    }
    const out: { key: string; d: string; layers: Layer[] }[] = [];
    for (const ch of CHANNELS) {
      const key = keyOf(ch);
      const w = whole.get(key);
      if (w?.length) {
        out.push({ key, d: channelPath(ch), layers: w });
        continue;
      }
      const la = gateLayers.get(ch.a) ?? [];
      const lb = gateLayers.get(ch.b) ?? [];
      if (la.length) out.push({ key: `${key}:a`, d: channelHalf(ch, ch.a), layers: la });
      if (lb.length) out.push({ key: `${key}:b`, d: channelHalf(ch, ch.b), layers: lb });
    }
    return out;
  }, [data.channels, gateLayers]);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label="Human Design bodygraph">
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
          <path key={c.key} d={shapeToPath(c.shape)} fill={definedCentres.has(c.key) ? (DEFINED_FILL[c.key] ?? "#dcb98e") : OPEN_FILL} />
        ))}
      </g>
      <g fontFamily="system-ui, sans-serif">
        {Object.entries(GATES).map(([raw, g]) => {
          const gate = Number(raw);
          const active = (gateLayers.get(gate) ?? []).length > 0;
          const dark = DARK_FILLS.has(g.centre) && definedCentres.has(g.centre);
          return active ? (
            <g key={gate}>
              <circle cx={g.x} cy={g.y} r={12} fill={BADGE} />
              <text x={g.x} y={g.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#ffffff">{gate}</text>
            </g>
          ) : (
            <text key={gate} x={g.x} y={g.y + 5} textAnchor="middle" fontSize={15} fontWeight={500} fill={dark ? TEXT_ON_DARK : TEXT_ON_LIGHT}>{gate}</text>
          );
        })}
      </g>
    </svg>
  );
}

function BodygraphChart({ data, size }: { data: ChartResponse; size: number }) {
  // Laid out by the card's own width (a container query in styles.css), not
  // the window's. Wide: Design | graph | Personality. Medium: the graph,
  // then both tables side by side. Narrow (phones): the graph, then the
  // tables one under the other.
  const vars = { "--occult-bodygraph-size": `${size}px` } as CSSProperties;
  return (
    <div className="occult-bodygraph" style={vars}>
      <div className="occult-bodygraph__layout">
        <div className="occult-bodygraph__design">
          <ActivationColumn title="Design" rows={data.design ?? []} colour="var(--occult-hd-design-text)" />
        </div>
        <div className="occult-bodygraph__graph">
          <BodygraphGraphic data={data} />
        </div>
        <div className="occult-bodygraph__personality">
          <ActivationColumn title="Personality" rows={data.personality ?? []} colour="var(--occult-hd-personality-text)" />
        </div>
      </div>
      <div className="occult-bodygraph__legend">
        <span className="occult-bodygraph__key">
          <span className="occult-bodygraph__swatch" style={{ background: DESIGN }} />
          Design (~88° of Sun before birth)
        </span>
        <span className="occult-bodygraph__key">
          <span className="occult-bodygraph__swatch" style={{ background: PERSONALITY }} />
          Personality (birth)
        </span>
        <span className="occult-bodygraph__key">
          <span className="occult-bodygraph__dot" style={{ background: BADGE }} />
          Active gate
        </span>
      </div>
    </div>
  );
}
