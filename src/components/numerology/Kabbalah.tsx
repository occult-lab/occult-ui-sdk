"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface KabbalahPath {
  letter: string;
  hebrew: string;
  attribution: string;
  trump: string;
  theme: string;
}

interface KabbalahResponse {
  name: string;
  total: number;
  path_number: number;
  path: KabbalahPath;
}

export interface KabbalahProps extends CommonProps {
  name: string;
}

/**
 * A name reduced to one of the 22 paths of the Tree of Life - Latin
 * letters at their Hebrew-equivalent values, summed and reduced by
 * subtracting 22 until 22 or fewer remain. A separate system from the
 * generic NumerologyChart's chaldean/pythagorean/chinese/vedic keys - this
 * one has its own dedicated endpoint. Verified live:
 * /api/astro/numerology/kabbalah/.
 */
export function Kabbalah({ name, className }: KabbalahProps) {
  const [day, month, year] = [1, 1, 2000]; // the engine scores the NAME; birth date is not used by this key, but the field is required.
  const state = useOccultQuery<KabbalahResponse>("astro/numerology/kabbalah", {
    date_time: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`,
    name,
  });

  return (
    <Card title={name} subtitle="Kabbalah numerology" className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat label="Total" value={data.total} />
              <Stat label="Path" value={data.path_number} />
            </StatRow>
            <DataTable
              className="occult-space-top"
              rows={[
                { field: "Letter", value: `${data.path.letter} (${data.path.hebrew})` },
                { field: "Planetary Attribution", value: data.path.attribution },
                { field: "Tarot Trump", value: data.path.trump },
                { field: "Theme", value: data.path.theme },
              ]}
              columns={[
                { path: "field", label: "" },
                { path: "value", label: "" },
              ]}
            />
          </>
        )}
      </StatusView>
    </Card>
  );
}
