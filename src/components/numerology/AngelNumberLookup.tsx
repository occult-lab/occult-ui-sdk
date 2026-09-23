"use client";

import { Card } from "../primitives/Card";
import { Badge, Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface AngelNumberResponse {
  sequence: string;
  is_repeating: boolean;
  meaning: string;
  digit_root: number;
  root_meaning: string;
}

export interface AngelNumberLookupProps extends CommonProps {
  /** A digit sequence, e.g. "1111", "444". */
  sequence: string;
}

/**
 * A repeating-digit sequence's meaning, plus its digit-root fallback for
 * sequences without a named meaning of their own. Verified live:
 * /api/astro/numerology/angel/.
 */
export function AngelNumberLookup({ sequence, className }: AngelNumberLookupProps) {
  const state = useOccultQuery<AngelNumberResponse>("astro/numerology/angel", { sequence });

  return (
    <Card title={sequence} subtitle="Angel number" className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <p style={{ margin: "0 0 0.75rem" }}>
              {data.meaning}
              {data.is_repeating && <Badge tone="active"> repeating</Badge>}
            </p>
            <StatRow>
              <Stat label="Digit Root" value={data.digit_root} hint={data.root_meaning} />
            </StatRow>
          </>
        )}
      </StatusView>
    </Card>
  );
}
