/**
 * Shared value-formatting helpers, used by every table/card component so
 * the same API shape reads the same way everywhere in the library.
 *
 * The array handling here fixes a real bug found in panchang-web's earlier
 * version of this exact function: it checked `Array.isArray` before the
 * snake_case check and returned early, so an array like ["Throat",
 * "Solar_plexus"] got joined with its underscores intact ("Solar_plexus"
 * never reached the replace()). Every array element is now individually
 * passed through the same snake_case stripping as a lone string.
 */

/** Read a dotted path ("a.b.c") out of a nested object, tolerating gaps. */
export function atPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Whether a value is worth rendering a row/card for. */
export function isPresent(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function stripUnderscore(s: string): string {
  return s.includes("_") && !s.includes(" ") ? s.replace(/_/g, " ") : s;
}

/** Human-readable rendering of any value the API might return in a cell. */
export function display(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "✓" : "—";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    return v
      .map((item) => (typeof item === "string" ? stripUnderscore(item) : display(item)))
      .join(", ");
  }
  if (typeof v === "string") return stripUnderscore(v);
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** "6:42 AM" from an ISO-ish instant, in the viewer's local time. */
export function formatClock(value: unknown, locale?: string): string {
  if (typeof value !== "string" || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** "22 Sep 2026" from an ISO-ish date/datetime. */
export function formatDate(value: unknown, locale?: string): string {
  if (typeof value !== "string" || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

/** Title-cases a snake_case or kebab-case key for use as a column/row label. */
export function labelize(key: string): string {
  return key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * "5.5" -> "+05:30". Every endpoint that takes a `timezone_as_float` also
 * wants that same offset baked into `date_time`/`datetime` - half-hour and
 * 45-minute zones (India, Nepal) are common enough that this has to be exact,
 * not `${hours}:00`.
 */
export function utcOffsetSuffix(timezone: number): string {
  const sign = timezone < 0 ? "-" : "+";
  const abs = Math.abs(timezone);
  const hh = String(Math.trunc(abs)).padStart(2, "0");
  const mm = String(Math.round((abs % 1) * 60)).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

/** Combines a "YYYY-MM-DD" date and "HH:MM" time into an offset-qualified ISO instant. */
export function toApiDateTime(date: string, time: string, timezone: number): string {
  return `${date}T${time}${utcOffsetSuffix(timezone)}`;
}
