"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

export type NumerologySystem = "chaldean" | "pythagorean" | "chinese" | "vedic";

export interface NumerologyChartProps extends CommonProps {
  name: string;
  /** "YYYY-MM-DD" */
  birthDate: string;
  system?: NumerologySystem;
  /**
   * Which numbers to show. Defaults to the five every Chaldean/Pythagorean
   * reading opens with; pass your own list for other systems (e.g. Vedic's
   * bhagyank/namank/moolank) or to add karmic_debt_numbers, pinnacle_cycles,
   * and the ~25 others /api/astro/numerology/ supports.
   */
  keys?: string[];
}

const DEFAULT_KEYS = [
  "life_path_number",
  "expression_number",
  "soul_urge_number",
  "personality_number",
  "birthday_number",
];

const LABELS: Record<string, string> = {
  life_path_number: "Life Path",
  expression_number: "Expression",
  soul_urge_number: "Soul Urge",
  personality_number: "Personality",
  birthday_number: "Birthday",
  maturity_number: "Maturity",
  bhagyank: "Bhagyank",
  namank: "Namank",
  moolank: "Moolank",
};

/**
 * A grid of numerology core numbers - life path, expression, soul urge and
 * whichever others you ask for. One call, however many keys, costs one
 * credit - see the `keys` prop. Verified live: /api/astro/numerology/.
 */
export function NumerologyChart({
  name,
  birthDate,
  system = "chaldean",
  keys = DEFAULT_KEYS,
  className,
}: NumerologyChartProps) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const state = useOccultQuery<Record<string, unknown>>("astro/numerology", {
    date_time: `${birthDate}T00:00:00+00:00`,
    name,
    day,
    month,
    year,
    system,
    keys,
  });

  return (
    <Card title={name} subtitle="Numerology chart" className={className}>
      <StatusView state={state}>
        {(data) => (
          <StatRow>
            {keys.map((key) => {
              const value = data[key];
              if (value === undefined || typeof value === "object") return null;
              return (
                <Stat key={key} label={LABELS[key] ?? key} value={String(value)} />
              );
            })}
          </StatRow>
        )}
      </StatusView>
    </Card>
  );
}
