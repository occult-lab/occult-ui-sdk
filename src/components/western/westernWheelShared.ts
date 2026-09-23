/**
 * Shared between every Western-tropical wheel component (SynastryWheel,
 * TransitBiWheel via WesternWheelBase, and WesternNatalWheel) - one copy of
 * the sign glyphs and planet abbreviations rather than three, so a label
 * fix (like the Cancer/Capricorn collision found and fixed in
 * SouthIndianChartWheel) only has to happen in one place.
 */

export const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mercury: "Me", venus: "Ve", mars: "Ma",
  jupiter: "Ju", saturn: "Sa", uranus: "Ur", neptune: "Ne", pluto: "Pl",
  // Western tradition's own names, not Vedic Rahu/Ketu - these endpoints
  // are tropical/Western throughout, and mixing terminology from two
  // systems in one label would misname the point to anyone versed in either.
  north_node: "NN", south_node: "SN", chiron: "Ch",
};
