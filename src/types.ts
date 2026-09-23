/**
 * Shared prop shapes. Every chart/table component that needs a birth or
 * event moment takes BirthDetails; every component takes CommonProps for
 * styling/testing hooks. Keeping these in one place is what makes the
 * "swap Natal Chart for Transit Chart, same props" promise true.
 */

export interface BirthDetails {
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" or "HH:MM:SS", 24-hour. */
  time: string;
  /** Decimal degrees, north positive. */
  latitude: number;
  /** Decimal degrees, east positive. */
  longitude: number;
  /** Hours from UTC, e.g. 5.5 for IST, -5 for EST. */
  timezone: number;
  /** Shown in headers/captions; never sent to the API. */
  place?: string;
}

export interface CommonProps {
  className?: string;
  /** Overrides the OccultProvider's locale for this one component. */
  locale?: "en" | "hi";
}

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

export type HoroscopePeriod = "daily" | "tomorrow" | "yesterday" | "weekly" | "monthly" | "yearly";
