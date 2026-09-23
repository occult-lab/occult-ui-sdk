"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface FixedStar {
  star: string;
  magnitude: number;
  sign: string;
  degree_in_sign: number;
}

interface FixedStarsResponse {
  count: number;
  stars: FixedStar[];
}

export interface FixedStarsProps extends CommonProps {
  /** "YYYY-MM-DD" */
  date: string;
  time?: string;
  /** major (default): the ~15-20 most-cited stars. behenian: the 15 classical Behenian fixed stars. brightest / all. */
  preset?: "major" | "behenian" | "brightest" | "all";
}

/**
 * Fixed-star positions for a moment - which stars are worth watching and
 * where, by magnitude (lower = brighter). Verified live:
 * /api/astro/fixed-star/positions/.
 */
export function FixedStars({ date, time = "00:00", preset = "major", className }: FixedStarsProps) {
  const state = useOccultQuery<FixedStarsResponse>("astro/fixed-star/positions", {
    date_time: `${date}T${time}:00Z`,
    timezone_as_float: 0,
    preset,
  });

  return (
    <Card title="Fixed Stars" subtitle={`${preset} preset`} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={data.stars as unknown as Record<string, unknown>[]}
            columns={[
              { path: "star", label: "Star" },
              { path: "magnitude", label: "Magnitude" },
              { path: "sign", label: "Sign" },
              { path: "degree_in_sign", label: "Degree", render: (v) => `${Number(v).toFixed(2)}°` },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
