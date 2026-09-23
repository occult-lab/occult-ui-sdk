/**
 * occult-api-ui — drop-in React components for the Occult API.
 *
 * Wrap your app once:
 *
 *   import { OccultProvider, PlanetPositions } from "occult-api-ui";
 *   import "occult-api-ui/styles.css";
 *
 *   <OccultProvider apiKey={key}>
 *     <PlanetPositions date="1990-08-15" time="10:30" latitude={26.9124} longitude={75.7873} timezone={5.5} />
 *   </OccultProvider>
 *
 * Every component below was built against a real response from the running
 * API (not a guessed shape) before being added to this file - see each
 * component's own doc comment for which endpoint it verified against.
 */

// Setup
export { OccultProvider, useOccultContext } from "./lib/OccultProvider";
export { OccultClient, OccultApiError, createOccultClient } from "./lib/client";
export type { OccultClientOptions } from "./lib/client";
export { useOccultQuery } from "./lib/useOccultQuery";
export type { QueryState } from "./lib/useOccultQuery";

// Shared types
export type {
  BirthDetails,
  CommonProps,
  ZodiacSign,
  HoroscopePeriod,
} from "./types";
export { ZODIAC_SIGNS } from "./types";

// Primitives - for composing your own components against the same look.
export { Card, cx } from "./components/primitives/Card";
export { DataTable, KeyValueTable } from "./components/primitives/DataTable";
export type { DataTableColumn } from "./components/primitives/DataTable";
export { Stat, StatRow, Badge } from "./components/primitives/Stat";
export { StatusView } from "./components/primitives/StatusView";

// Vedic / Jyotish
export { PlanetPositions } from "./components/vedic/PlanetPositions";
export type { PlanetPositionsProps } from "./components/vedic/PlanetPositions";
export { NatalChartWheel } from "./components/vedic/NatalChartWheel";
export type { NatalChartWheelProps } from "./components/vedic/NatalChartWheel";
export { SouthIndianChartWheel } from "./components/vedic/SouthIndianChartWheel";
export type { SouthIndianChartWheelProps } from "./components/vedic/SouthIndianChartWheel";
export { MoonPhase } from "./components/vedic/MoonPhase";
export type { MoonPhaseProps } from "./components/vedic/MoonPhase";
export { SynastryWheel } from "./components/vedic/SynastryWheel";
export type { SynastryWheelProps } from "./components/vedic/SynastryWheel";
export { TransitBiWheel } from "./components/vedic/TransitBiWheel";
export type { TransitBiWheelProps } from "./components/vedic/TransitBiWheel";
export { KpChartWheel } from "./components/vedic/KpChartWheel";
export type { KpChartWheelProps } from "./components/vedic/KpChartWheel";
export { Sahams } from "./components/vedic/Sahams";

// Western / Traditional
export { FixedStars } from "./components/western/FixedStars";
export type { FixedStarsProps } from "./components/western/FixedStars";
export { Sect } from "./components/western/Sect";
export { Almuten } from "./components/western/Almuten";
export { EssentialDignities } from "./components/western/EssentialDignities";
export { AnnualProfection } from "./components/western/AnnualProfection";
export { SecondaryProgressions } from "./components/western/SecondaryProgressions";
export type { SecondaryProgressionsProps } from "./components/western/SecondaryProgressions";
export { AstrocartographyMap } from "./components/western/AstrocartographyMap";
export type { AstrocartographyMapProps } from "./components/western/AstrocartographyMap";
export { LocalSpaceMap } from "./components/western/LocalSpaceMap";
export type { LocalSpaceMapProps } from "./components/western/LocalSpaceMap";
export { EphemerisTable } from "./components/western/EphemerisTable";
export type { EphemerisTableProps } from "./components/western/EphemerisTable";
export { WesternNatalWheel } from "./components/western/WesternNatalWheel";
export type { WesternNatalWheelProps } from "./components/western/WesternNatalWheel";
export { VimshottariDasha } from "./components/vedic/VimshottariDasha";
export type { VimshottariDashaProps } from "./components/vedic/VimshottariDasha";
export { CurrentDasha } from "./components/vedic/CurrentDasha";
export type { CurrentDashaProps } from "./components/vedic/CurrentDasha";
export { GunMilan } from "./components/vedic/GunMilan";
export type { GunMilanProps } from "./components/vedic/GunMilan";
export { Nakshatra } from "./components/vedic/Nakshatra";
export { Ashtakavarga } from "./components/vedic/Ashtakavarga";
export { Rashifal } from "./components/vedic/Rashifal";
export type { RashifalProps } from "./components/vedic/Rashifal";
export { KpChart } from "./components/vedic/KpChart";
export { Doshas } from "./components/vedic/Doshas";
export { DashaTimeline, DASHA_SYSTEMS } from "./components/vedic/DashaTimeline";
export type { DashaTimelineProps, DashaSystemName } from "./components/vedic/DashaTimeline";

// Numerology
export { NumerologyChart } from "./components/numerology/NumerologyChart";
export type { NumerologyChartProps, NumerologySystem } from "./components/numerology/NumerologyChart";
export { Kabbalah } from "./components/numerology/Kabbalah";
export type { KabbalahProps } from "./components/numerology/Kabbalah";
export { IChingNumerology } from "./components/numerology/IChingNumerology";
export type { IChingNumerologyProps } from "./components/numerology/IChingNumerology";
export { AngelNumberLookup } from "./components/numerology/AngelNumberLookup";
export type { AngelNumberLookupProps } from "./components/numerology/AngelNumberLookup";

// Tarot
export { TarotCard } from "./components/tarot/TarotCard";
export type { TarotCardProps } from "./components/tarot/TarotCard";
export { TarotSpread } from "./components/tarot/TarotSpread";
export type { TarotSpreadProps, TarotSpreadName } from "./components/tarot/TarotSpread";
export { TarotDeck } from "./components/tarot/TarotDeck";
export type { TarotDeckProps } from "./components/tarot/TarotDeck";
export { TarotYesNo } from "./components/tarot/TarotYesNo";
export type { TarotYesNoProps } from "./components/tarot/TarotYesNo";

// Chinese
export { FourPillars } from "./components/chinese/FourPillars";
export { ChineseZodiac } from "./components/chinese/ChineseZodiac";
export type { ChineseZodiacProps } from "./components/chinese/ChineseZodiac";
export { BaziTenGods } from "./components/chinese/BaziTenGods";
export { LuckPillars } from "./components/chinese/LuckPillars";
export type { LuckPillarsProps } from "./components/chinese/LuckPillars";

// Human Design
export { HumanDesignType } from "./components/humanDesign/HumanDesignType";
export { Bodygraph } from "./components/humanDesign/Bodygraph";
export type { BodygraphProps } from "./components/humanDesign/Bodygraph";
export { HumanDesignConnection } from "./components/humanDesign/HumanDesignConnection";
export type { HumanDesignConnectionProps } from "./components/humanDesign/HumanDesignConnection";

// Formatting helpers, exported for anyone composing custom cells/columns.
export { atPath, display, isPresent, formatClock, formatDate, labelize, utcOffsetSuffix, toApiDateTime } from "./lib/format";
