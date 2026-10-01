/**
 * Drawing pieces shared by the North and South Indian chart wheels.
 *
 * Both charts copy the look of yogatara-b2b's NorthIndianChart and
 * SouthIndianChart: thin indigo lines, sign numbers in the line colour,
 * and every body written as "Su 14° (Ash)" - abbreviation, whole degree
 * within the sign, nakshatra abbreviation - in one chart red, with the
 * ascendant in purple. Yogatara colours every planet the same; it has no
 * per-planet palette in these charts.
 *
 * Both are drawn on a 300x300 grid inside a viewBox padded by 2 units on
 * every side ("-2 -2 304 304"), so a stroke on the outer edge is not cut in
 * half. Everything is SVG text (no HTML overlay), so labels scale with the
 * chart and cannot drift.
 */

export const VIEWBOX = "-2 -2 304 304";

/**
 * Yogatara's chart colours: --chart-border and --chart-label from
 * app/globals.css, planet and lagna colours from the defaults in
 * lib/settings/chartSettings.ts (which the app writes over --chart-planet
 * and --chart-ascendant at runtime, so the lagna shows purple, not the
 * orange in globals.css). The light values are the fallbacks here;
 * styles.css redefines them for the dark theme with Yogatara's own dark
 * values, because #312e81 lines and #171717 text vanish on a dark card.
 */
export const CHART_COLOR = {
  line: "var(--occult-chart-line, #312e81)",
  planet: "var(--occult-chart-planet, #b90000)",
  ascendant: "var(--occult-chart-ascendant, #6b21a8)",
  label: "var(--occult-chart-label, #171717)",
} as const;

export const ZODIAC_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/** 1-12, or 0 for an unknown name. */
export function signNumber(name: string | undefined): number {
  return name ? ZODIAC_ORDER.indexOf(name) + 1 : 0;
}

/** yogatara-b2b lib/chart/planetNames.ts PLANET_ABBR_ENGLISH. */
export const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa",
  uranus: "Ur", neptune: "Ne", pluto: "Pl",
  northtruenode: "Ra", northmeannode: "Ra",
  southtruenode: "Ke", southmeannode: "Ke",
};

export function planetAbbr(name: string): string {
  return PLANET_ABBR[name.toLowerCase()] ?? name.slice(0, 2).toUpperCase();
}

/** yogatara-b2b lib/chart/nakshatraNames.ts NAKSHATRA_ABBR, 1-27 in order. */
const NAKSHATRA_ABBR = [
  "Ash", "Bha", "Kri", "Roh", "Mri", "Ard", "Pun", "Pus", "Ash",
  "Mag", "PPh", "UPh", "Has", "Chi", "Swa", "Vis", "Anu", "Jye",
  "Mul", "PSh", "USh", "Shr", "Dha", "Sha", "PBh", "UBh", "Rev",
];

/** The API's own nakshatra spellings, in order (core/consts.py). */
const API_NAKSHATRA = [
  "ashwini", "bharani", "krittika", "rohini", "mrigasira", "aardra",
  "punarvasu", "pushyami", "aasresha", "makha", "poorvaphalguni",
  "uttaraphalguni", "hasta", "chitra", "swaati", "visaakha", "anooraadha",
  "jyeshtha", "moola", "poorvaashaadha", "uttaraashaadha", "sravanam",
  "dhanishtha", "satabhishak", "poorvaabhaadra", "uttaraabhaadra", "revati",
];

/** Degrees within the sign (0-30), whether `longitude` is absolute or not. */
export function degreeInSign(longitude: number): number {
  return ((longitude % 30) + 30) % 30;
}

/**
 * Nakshatra 1-27, the way Yogatara picks it: the API's name when it has
 * one, otherwise derived from sign + degree (13°20' per nakshatra from 0°
 * Aries). Returns 0 when neither is usable.
 */
function nakshatraNumber(longitude: number, sign: string, apiName?: string): number {
  if (apiName) {
    const idx = API_NAKSHATRA.indexOf(apiName.toLowerCase().replace(/[^a-z]/g, ""));
    if (idx >= 0) return idx + 1;
  }
  const signIdx = signNumber(sign) - 1;
  if (signIdx < 0 || !Number.isFinite(longitude)) return 0;
  const idx = Math.floor((signIdx * 30 + degreeInSign(longitude)) / (360 / 27));
  return Math.min(Math.max(idx + 1, 1), 27);
}

export interface ChartItem {
  key: string;
  text: string;
  color: string;
}

/**
 * One body as Yogatara writes it: "Su 14° (Ash)". `apiNakshatra` is left
 * out for the ascendant, which Yogatara always derives from its longitude.
 */
export function chartItem(
  key: string,
  abbr: string,
  longitude: number,
  sign: string,
  color: string,
  apiNakshatra?: string,
): ChartItem {
  let text = abbr;
  if (Number.isFinite(longitude)) {
    // Yogatara rounds; capped so 29.6° reads 29°, never "30°" in a 30° sign.
    text += ` ${Math.min(29, Math.round(degreeInSign(longitude)))}°`;
  }
  const nak = nakshatraNumber(longitude, sign, apiNakshatra);
  if (nak) text += ` (${NAKSHATRA_ABBR[nak - 1]})`;
  return { key, text, color };
}

/** Rough width of bold sans text; only used to decide line breaks. */
function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55;
}

function packRows(items: ChartItem[], fontSize: number, maxWidth: number, gap: number): ChartItem[][] {
  const rows: ChartItem[][] = [];
  let row: ChartItem[] = [];
  let width = 0;
  for (const item of items) {
    const w = textWidth(item.text, fontSize);
    if (row.length && width + gap + w > maxWidth) {
      rows.push(row);
      row = [];
      width = 0;
    }
    width += (row.length ? gap : 0) + w;
    row.push(item);
  }
  if (row.length) rows.push(row);
  return rows;
}

export interface ItemBlockProps {
  items: ChartItem[];
  /** Horizontal centre of the block. */
  x: number;
  /** Vertical centre ("middle") or top edge ("top") of the block. */
  y: number;
  anchor: "middle" | "top";
  maxWidth: number;
  maxHeight: number;
  fontSize: number;
  minFontSize: number;
  /** Line height as a multiple of the font size. */
  lineHeight: number;
  /** Extra space between rows. */
  rowGap: number;
  /** Space between two items sharing a row. */
  itemGap: number;
}

/**
 * Items wrapped into centred rows, like Yogatara's flex-wrap cluster, and
 * shrunk step by step until the rows fit `maxHeight`, so a crowded house
 * stays inside its cell instead of spilling over the lines. An item wider
 * than `maxWidth` on its own shrinks the block too.
 */
export function ItemBlock({
  items, x, y, anchor, maxWidth, maxHeight, fontSize, minFontSize, lineHeight, rowGap, itemGap,
}: ItemBlockProps) {
  if (!items.length) return null;
  let fs = fontSize;
  let rows = packRows(items, fs, maxWidth, itemGap);
  const height = () => rows.length * fs * lineHeight + (rows.length - 1) * rowGap;
  const tooWide = () => items.some((item) => textWidth(item.text, fs) > maxWidth);
  while ((height() > maxHeight || tooWide()) && fs > minFontSize) {
    fs = Math.max(minFontSize, fs * 0.92);
    rows = packRows(items, fs, maxWidth, itemGap);
  }
  const step = fs * lineHeight + rowGap;
  const top = anchor === "top" ? y : y - height() / 2;
  return (
    <>
      {rows.map((row, i) => (
        <text
          key={row[0]?.key ?? i}
          x={x}
          y={top + i * step + (fs * lineHeight) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fs}
          fontWeight={700}
        >
          {row.map((item, j) => (
            <tspan key={item.key} dx={j ? itemGap : undefined} style={{ fill: item.color }}>
              {item.text}
            </tspan>
          ))}
        </text>
      ))}
    </>
  );
}

/**
 * `chart_name` -> display label, for every divisional chart the API's own
 * `chart_name` enum documents (seen on /api/astro/ashtakvarga/'s field
 * list, which is the one endpoint that publishes it - /api/astro/
 * planet-positions/ accepts the same values but doesn't enumerate them).
 */
export const CHART_LABELS: Record<string, string> = {
  RashiChart: "Rashi (D-1)",
  BhavaChart: "Bhava",
  HoraChart: "Hora (D-2)",
  DrekkanaChart: "Drekkana (D-3)",
  ChaturthamsaChart: "Chaturthamsa (D-4)",
  PanchamsaChart: "Panchamsa (D-5)",
  ShashthamsaChart: "Shashthamsa (D-6)",
  SaptamsaChart: "Saptamsa (D-7)",
  AshtamsaChart: "Ashtamsa (D-8)",
  NavamsaChart: "Navamsa (D-9)",
  DasamsaChart: "Dasamsa (D-10)",
  RudramsaChart: "Rudramsa (D-11)",
  DwadasamsaChart: "Dwadasamsa (D-12)",
  ShodasamsaChart: "Shodasamsa (D-16)",
  VimsamsaChart: "Vimsamsa (D-20)",
  ChaturvimsamsaChart: "Chaturvimsamsa (D-24)",
  NakshatramsaChart: "Nakshatramsa (D-27)",
  TrimsamsaChart: "Trimsamsa (D-30)",
  KhavedamsaChart: "Khavedamsa (D-40)",
  AkshavedamsaChart: "Akshavedamsa (D-45)",
  ShashtyamsaChart: "Shashtyamsa (D-60)",
  NavnavamsaChart: "Navnavamsa (D-81)",
  NavnavamsaChartNew: "Navnavamsa (D-81)",
  AstottaramsaChart: "Astottaramsa (D-108)",
  AstottaramsaChartNew: "Astottaramsa (D-108)",
  DwadasdwadasamsaChart: "Dwadasdwadasamsa (D-144)",
  DwadasdwadasamsaChartNew: "Dwadasdwadasamsa (D-144)",
};
