/**
 * Geometry for the Human Design bodygraph.
 *
 * Ported verbatim from panchang-web's lib/jyotish/bodygraph.ts, which is
 * itself the product of several failed approaches recorded in its own
 * header: computing gate positions from their channels put dots on a
 * centre's perimeter (correct topology, unrecognisable as a bodygraph);
 * routing channels by a bow-by-length or orthogonal-pipe formula produced
 * either a tangle or something boxy. The reference render (846 x 1027)
 * was traced row by row for the body outline, blob-detected for the centre
 * boxes, and centroid-measured for the gate badges; the channel curves were
 * then hand-tuned against a side-by-side overlay. None of that is worth
 * redoing, so this is a direct port, not a re-derivation.
 */

export type CentreKey =
  | "head" | "ajna" | "throat" | "identity" | "will"
  | "spleen" | "sacral" | "solar_plexus" | "root";

export const VIEW_W = 846;
export const VIEW_H = 1027;

export type Point = { x: number; y: number };

const BODY_ROWS: [number, number, number][] = [
  [60, 340, 443], [72, 321, 463], [84, 309, 476], [96, 302, 486],
  [108, 296, 493], [120, 291, 498], [132, 288, 501], [144, 286, 503],
  [156, 287, 503], [168, 293, 502], [180, 290, 499], [192, 285, 496],
  [204, 280, 491], [216, 279, 485], [228, 291, 479], [240, 291, 473],
  [252, 291, 466], [264, 291, 462], [276, 294, 458], [288, 335, 457],
  [300, 335, 457], [312, 332, 460], [324, 327, 465], [336, 318, 474],
  [348, 303, 487], [360, 278, 510], [372, 228, 568], [384, 210, 588],
  [396, 203, 593], [408, 198, 598], [420, 193, 603], [432, 188, 608],
  [444, 183, 613], [456, 178, 618], [468, 173, 623], [480, 168, 628],
  [492, 162, 633], [504, 157, 638], [516, 152, 643], [528, 147, 648],
  [540, 142, 653], [552, 137, 658], [564, 132, 663], [576, 127, 668],
  [588, 122, 673], [600, 117, 678], [612, 112, 683], [624, 107, 687],
  [636, 101, 692], [648, 96, 697], [660, 91, 702], [672, 86, 707],
  [684, 81, 712], [696, 76, 717], [708, 71, 722], [720, 66, 727],
  [732, 61, 732], [744, 56, 736], [756, 51, 741], [768, 46, 746],
  [780, 41, 751], [792, 37, 755], [804, 34, 759], [816, 34, 758],
  [828, 39, 753], [840, 49, 743], [852, 60, 732], [864, 71, 720],
  [876, 83, 708], [888, 95, 696], [900, 108, 683], [912, 122, 669],
  [924, 136, 655], [936, 151, 640], [948, 168, 623], [960, 186, 605],
  [972, 208, 583], [984, 234, 558], [996, 269, 523], [1008, 330, 464],
];

export function bodyPath(): string {
  const first = BODY_ROWS[0];
  if (!first) return "";
  const right = BODY_ROWS.map(([y, , r]) => `${r},${y}`);
  const left = [...BODY_ROWS].reverse().map(([y, l]) => `${l},${y}`);
  return `M${first[1]},${first[0]} L${right.join(" L")} L${left.join(" L")} Z`;
}

export const GATES: Record<number, { centre: CentreKey; x: number; y: number }> = {
  64: { centre: "head", x: 369, y: 115 },
  61: { centre: "head", x: 397, y: 115 },
  63: { centre: "head", x: 427, y: 115 },

  47: { centre: "ajna", x: 368, y: 170 },
  24: { centre: "ajna", x: 397, y: 170 },
  4: { centre: "ajna", x: 426, y: 170 },
  17: { centre: "ajna", x: 371, y: 226 },
  11: { centre: "ajna", x: 425, y: 227 },
  43: { centre: "ajna", x: 397, y: 261 },

  62: { centre: "throat", x: 368, y: 326 },
  23: { centre: "throat", x: 397, y: 326 },
  56: { centre: "throat", x: 426, y: 326 },
  16: { centre: "throat", x: 348, y: 360 },
  35: { centre: "throat", x: 446, y: 361 },
  20: { centre: "throat", x: 348, y: 389 },
  12: { centre: "throat", x: 445, y: 390 },
  31: { centre: "throat", x: 368, y: 432 },
  8: { centre: "throat", x: 397, y: 432 },
  33: { centre: "throat", x: 426, y: 432 },
  45: { centre: "throat", x: 445, y: 417 },

  1: { centre: "identity", x: 396, y: 490 },
  7: { centre: "identity", x: 368, y: 512 },
  13: { centre: "identity", x: 426, y: 512 },
  10: { centre: "identity", x: 335, y: 552 },
  25: { centre: "identity", x: 457, y: 554 },
  15: { centre: "identity", x: 368, y: 590 },
  46: { centre: "identity", x: 426, y: 590 },
  2: { centre: "identity", x: 396, y: 612 },

  21: { centre: "will", x: 545, y: 600 },
  51: { centre: "will", x: 527, y: 618 },
  26: { centre: "will", x: 498, y: 654 },
  40: { centre: "will", x: 578, y: 668 },

  48: { centre: "spleen", x: 115, y: 711 },
  57: { centre: "spleen", x: 144, y: 726 },
  44: { centre: "spleen", x: 175, y: 745 },
  50: { centre: "spleen", x: 204, y: 770 },
  32: { centre: "spleen", x: 175, y: 797 },
  28: { centre: "spleen", x: 148, y: 812 },
  18: { centre: "spleen", x: 120, y: 829 },

  5: { centre: "sacral", x: 368, y: 733 },
  14: { centre: "sacral", x: 397, y: 733 },
  29: { centre: "sacral", x: 426, y: 733 },
  34: { centre: "sacral", x: 348, y: 759 },
  59: { centre: "sacral", x: 446, y: 804 },
  27: { centre: "sacral", x: 348, y: 804 },
  42: { centre: "sacral", x: 368, y: 829 },
  3: { centre: "sacral", x: 397, y: 829 },
  9: { centre: "sacral", x: 426, y: 829 },

  36: { centre: "solar_plexus", x: 677, y: 710 },
  22: { centre: "solar_plexus", x: 650, y: 725 },
  37: { centre: "solar_plexus", x: 620, y: 743 },
  6: { centre: "solar_plexus", x: 588, y: 770 },
  49: { centre: "solar_plexus", x: 617, y: 797 },
  55: { centre: "solar_plexus", x: 646, y: 812 },
  30: { centre: "solar_plexus", x: 673, y: 829 },

  53: { centre: "root", x: 368, y: 895 },
  60: { centre: "root", x: 397, y: 895 },
  52: { centre: "root", x: 426, y: 895 },
  54: { centre: "root", x: 348, y: 919 },
  19: { centre: "root", x: 446, y: 919 },
  38: { centre: "root", x: 348, y: 952 },
  39: { centre: "root", x: 446, y: 952 },
  58: { centre: "root", x: 348, y: 981 },
  41: { centre: "root", x: 446, y: 981 },
};

export const GATE_CENTRE: Record<number, CentreKey> = Object.fromEntries(
  Object.entries(GATES).map(([g, v]) => [Number(g), v.centre]),
) as Record<number, CentreKey>;

export type ChannelDef = { a: number; b: number; c?: [number, number, number, number] };

export const CHANNELS: ChannelDef[] = [
  { a: 64, b: 47 }, { a: 61, b: 24 }, { a: 63, b: 4 },
  { a: 17, b: 62 }, { a: 43, b: 23 }, { a: 11, b: 56 },
  { a: 31, b: 7 }, { a: 8, b: 1 }, { a: 33, b: 13 },
  { a: 15, b: 5 }, { a: 2, b: 14 }, { a: 46, b: 29 },
  { a: 42, b: 53 }, { a: 3, b: 60 }, { a: 9, b: 52 },

  { a: 10, b: 20, c: [330, 500, 336, 430] },
  { a: 10, b: 34, c: [330, 620, 336, 700] },
  { a: 20, b: 34, c: [312, 470, 312, 690] },

  { a: 16, b: 48, c: [210, 365, 100, 540] },
  { a: 20, b: 57, c: [250, 400, 140, 540] },
  { a: 10, b: 57, c: [280, 552, 170, 620] },
  { a: 34, b: 57, c: [290, 760, 220, 745] },
  { a: 26, b: 44, c: [400, 655, 230, 660] },
  { a: 27, b: 50, c: [300, 810, 250, 795] },

  { a: 32, b: 54, c: [160, 870, 240, 925] },
  { a: 28, b: 38, c: [120, 900, 230, 960] },
  { a: 18, b: 58, c: [80, 940, 220, 995] },

  { a: 35, b: 36, c: [590, 362, 700, 560] },
  { a: 12, b: 22, c: [560, 395, 660, 560] },
  { a: 45, b: 21, c: [500, 430, 540, 520] },
  { a: 25, b: 51, c: [490, 560, 515, 590] },
  { a: 37, b: 40, c: [605, 720, 592, 690] },
  { a: 6, b: 59, c: [540, 780, 490, 800] },

  { a: 19, b: 49, c: [530, 925, 600, 870] },
  { a: 39, b: 55, c: [560, 960, 640, 890] },
  { a: 41, b: 30, c: [590, 995, 690, 900] },
];

export function channelPath(ch: ChannelDef): string {
  const pa = GATES[ch.a];
  const pb = GATES[ch.b];
  if (!pa || !pb) return "";
  if (!ch.c) return `M${pa.x},${pa.y} L${pb.x},${pb.y}`;
  const [x1, y1, x2, y2] = ch.c;
  return `M${pa.x},${pa.y} C${x1},${y1} ${x2},${y2} ${pb.x},${pb.y}`;
}

/**
 * The half of a channel nearest one of its gates - what a "hanging gate"
 * (only one end of a channel active) shows: a stub in the right colour,
 * split from the full curve at t=0.5 by de Casteljau so it lands exactly
 * on the original path rather than an approximation of it.
 */
export function channelHalf(ch: ChannelDef, fromGate: number): string {
  const pa = GATES[ch.a];
  const pb = GATES[ch.b];
  if (!pa || !pb) return "";
  const forward = fromGate === ch.a;
  const p0 = forward ? pa : pb;
  const p3 = forward ? pb : pa;

  if (!ch.c) {
    return `M${p0.x},${p0.y} L${(pa.x + pb.x) / 2},${(pa.y + pb.y) / 2}`;
  }

  const [x1, y1, x2, y2] = ch.c;
  const c1 = forward ? { x: x1, y: y1 } : { x: x2, y: y2 };
  const c2 = forward ? { x: x2, y: y2 } : { x: x1, y: y1 };

  const mid = (p: Point, q: Point): Point => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const m01 = mid(p0, c1);
  const m12 = mid(c1, c2);
  const m23 = mid(c2, p3);
  const m012 = mid(m01, m12);
  const m123 = mid(m12, m23);
  const m = mid(m012, m123);
  return `M${p0.x},${p0.y} C${m01.x},${m01.y} ${m012.x},${m012.y} ${m.x},${m.y}`;
}

export type CentreShape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "poly"; points: [number, number][]; r: number };

export type CentreGeometry = { key: CentreKey; label: string; shape: CentreShape };

export const CENTRES: CentreGeometry[] = [
  { key: "head", label: "Head", shape: { kind: "poly", points: [[397, 8], [470, 132], [324, 132]], r: 10 } },
  { key: "ajna", label: "Ajna", shape: { kind: "poly", points: [[324, 154], [470, 154], [397, 284]], r: 10 } },
  { key: "throat", label: "Throat", shape: { kind: "rect", x: 336, y: 313, w: 121, h: 134, r: 10 } },
  { key: "identity", label: "G / Identity", shape: { kind: "poly", points: [[396, 475], [464, 552], [396, 630], [328, 552]], r: 8 } },
  { key: "will", label: "Will", shape: { kind: "poly", points: [[545, 584], [606, 674], [484, 674]], r: 8 } },
  { key: "spleen", label: "Spleen", shape: { kind: "poly", points: [[96, 692], [220, 770], [96, 847]], r: 10 } },
  { key: "sacral", label: "Sacral", shape: { kind: "rect", x: 336, y: 720, w: 121, h: 122, r: 10 } },
  { key: "solar_plexus", label: "Solar Plexus", shape: { kind: "poly", points: [[696, 695], [572, 770], [696, 845]], r: 10 } },
  { key: "root", label: "Root", shape: { kind: "rect", x: 336, y: 880, w: 121, h: 124, r: 10 } },
];

function roundedPolygon(points: [number, number][], r: number): string {
  const n = points.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const prevPoint = points[(i - 1 + n) % n];
    const curPoint = points[i];
    const nextPoint = points[(i + 1) % n];
    if (!prevPoint || !curPoint || !nextPoint) continue;
    const [px, py] = prevPoint;
    const [cx, cy] = curPoint;
    const [nx, ny] = nextPoint;
    const inLen = Math.hypot(cx - px, cy - py) || 1;
    const outLen = Math.hypot(nx - cx, ny - cy) || 1;
    const rr = Math.min(r, inLen / 2, outLen / 2);
    const ax = cx - ((cx - px) / inLen) * rr;
    const ay = cy - ((cy - py) / inLen) * rr;
    const bx = cx + ((nx - cx) / outLen) * rr;
    const by = cy + ((ny - cy) / outLen) * rr;
    parts.push(`${i === 0 ? "M" : "L"}${ax},${ay} Q${cx},${cy} ${bx},${by}`);
  }
  return parts.join(" ") + " Z";
}

export function shapeToPath(shape: CentreShape): string {
  if (shape.kind === "rect") {
    const { x, y, w, h, r } = shape;
    return [
      `M${x + r},${y}`,
      `h${w - 2 * r}`, `a${r},${r} 0 0 1 ${r},${r}`,
      `v${h - 2 * r}`, `a${r},${r} 0 0 1 ${-r},${r}`,
      `h${-(w - 2 * r)}`, `a${r},${r} 0 0 1 ${-r},${-r}`,
      `v${-(h - 2 * r)}`, `a${r},${r} 0 0 1 ${r},${-r}`,
      "Z",
    ].join(" ");
  }
  return roundedPolygon(shape.points, shape.r);
}
