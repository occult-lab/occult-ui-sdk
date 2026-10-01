/**
 * Shared between every Western-tropical wheel component (SynastryWheel,
 * TransitBiWheel via WesternWheelBase, and WesternNatalWheel): glyphs, sign
 * maths, the aspect set and the wheel palette. Ported from the Yogatara web
 * app's lib/western/astro.ts so the SDK's wheels draw the same symbols in the
 * same colours.
 *
 * Glyphs carry U+FE0E (text presentation) so browsers draw the astrological
 * symbol rather than a coloured emoji.
 */
export const TEXT_PRESENTATION = "︎";

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

/** Sign glyphs in zodiac order, Aries first, each with U+FE0E. */
export const SIGN_GLYPHS: string[] = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map(
  (g) => g + TEXT_PRESENTATION,
);

/** The same glyphs keyed by sign name. */
export const SIGN_GLYPH: Record<string, string> = Object.fromEntries(SIGN_NAMES.map((s, i) => [s, SIGN_GLYPHS[i] ?? ""]));

export const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mercury: "Me", venus: "Ve", mars: "Ma",
  jupiter: "Ju", saturn: "Sa", uranus: "Ur", neptune: "Ne", pluto: "Pl",
  // Western tradition's own names, not Vedic Rahu/Ketu - these endpoints
  // are tropical/Western throughout.
  north_node: "NN", south_node: "SN", chiron: "Ch",
};

const BODY_GLYPHS: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄",
  uranus: "♅", neptune: "♆", pluto: "♇", north_node: "☊", true_node: "☊", mean_node: "☊", node: "☊",
  south_node: "☋", chiron: "⚷", lilith: "⚸", black_moon_lilith: "⚸", mean_lilith: "⚸",
  ascendant: "AC", asc: "AC", midheaven: "MC", mc: "MC", part_of_fortune: "⊗", fortune: "⊗", vertex: "Vx",
};

/** Normalise an API body name ("North Node", "true_node", "Sun") to a key. */
export const bodyKey = (name: string) => name.trim().toLowerCase().replace(/[\s-]+/g, "_");

export function glyphOf(name: string): string {
  const g = BODY_GLYPHS[bodyKey(name)];
  if (!g) return name.slice(0, 2);
  return g.length === 1 ? g + TEXT_PRESENTATION : g;
}

const BODY_FULL_NAMES: Record<string, string> = {
  lilith: "Black Moon Lilith", black_moon_lilith: "Black Moon Lilith", mean_lilith: "Black Moon Lilith",
};

export function titleOf(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Black Moon Lilith" for lilith; otherwise the same as titleOf. */
export function fullNameOf(name: string): string {
  return BODY_FULL_NAMES[bodyKey(name)] ?? titleOf(name);
}

export const norm360 = (d: number) => ((d % 360) + 360) % 360;
export const signIndexOf = (lon: number) => Math.floor(norm360(lon) / 30);

/** 23.8 in Leo → "23°48′ ♌". */
export function formatLon(lon: number, withSign = true): string {
  const l = norm360(lon);
  const totalMin = Math.floor((l % 30) * 60 + 1e-9);
  const txt = `${Math.floor(totalMin / 60)}°${String(totalMin % 60).padStart(2, "0")}′`;
  return withSign ? `${txt} ${SIGN_GLYPHS[signIndexOf(l)]}` : txt;
}

export type AspectName =
  | "conjunction" | "opposition" | "trine" | "square" | "sextile"
  | "quincunx" | "semisextile" | "semisquare" | "sesquiquadrate" | "quintile" | "biquintile";

export type AspectTone = "hard" | "soft" | "neutral";

export const ASPECTS: Record<AspectName, { angle: number; label: string; major: boolean; tone: AspectTone }> = {
  conjunction: { angle: 0, label: "Conjunction", major: true, tone: "neutral" },
  opposition: { angle: 180, label: "Opposition", major: true, tone: "hard" },
  trine: { angle: 120, label: "Trine", major: true, tone: "soft" },
  square: { angle: 90, label: "Square", major: true, tone: "hard" },
  sextile: { angle: 60, label: "Sextile", major: true, tone: "soft" },
  quincunx: { angle: 150, label: "Quincunx", major: false, tone: "neutral" },
  semisextile: { angle: 30, label: "Semi-sextile", major: false, tone: "soft" },
  semisquare: { angle: 45, label: "Semi-square", major: false, tone: "hard" },
  sesquiquadrate: { angle: 135, label: "Sesquiquadrate", major: false, tone: "hard" },
  quintile: { angle: 72, label: "Quintile", major: false, tone: "soft" },
  biquintile: { angle: 144, label: "Biquintile", major: false, tone: "soft" },
};

/** Map an API aspect name ("Semi-Square", "semi_sextile", "Conjunction") to ours. */
export function aspectKey(name: string): AspectName | null {
  const k = name.toLowerCase().replace(/[\s_-]+/g, "");
  const alias: Record<string, AspectName> = {
    conjunction: "conjunction", conjunct: "conjunction", opposition: "opposition", opposite: "opposition",
    trine: "trine", square: "square", sextile: "sextile", quincunx: "quincunx", inconjunct: "quincunx",
    semisextile: "semisextile", semisquare: "semisquare", octile: "semisquare",
    sesquiquadrate: "sesquiquadrate", sesquisquare: "sesquiquadrate", trioctile: "sesquiquadrate",
    quintile: "quintile", biquintile: "biquintile",
  };
  return alias[k] ?? null;
}

/**
 * The wheel palette: Yogatara's chart colours, through --occult-wheel-*
 * variables (styles.css, "Astrological wheels") so they swap for the dark
 * theme the way Yogatara's own --chart-* tokens do.
 */
export const WHEEL_COLOR = {
  border: "var(--occult-wheel-border)",
  label: "var(--occult-wheel-label)",
  planet: "var(--occult-wheel-planet)",
  ascendant: "var(--occult-wheel-ascendant)",
  arudha: "var(--occult-wheel-arudha)",
  lagna: "var(--occult-wheel-lagna)",
  upagraha: "var(--occult-wheel-upagraha)",
  cream: "var(--occult-wheel-cream)",
  bg: "var(--occult-bg)",
} as const;

/** Colours per aspect tone, as Yogatara's TONE_COLOR. */
export const TONE_COLOR: Record<AspectTone, string> = {
  hard: WHEEL_COLOR.planet,
  soft: WHEEL_COLOR.arudha,
  neutral: WHEEL_COLOR.lagna,
};
