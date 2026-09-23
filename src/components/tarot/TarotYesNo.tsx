"use client";

import { Card } from "../primitives/Card";
import { Badge, Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface YesNoResponse {
  answer: "yes" | "no";
  card: string;
  orientation: "upright" | "reversed";
  meaning: string;
  how_decided: string;
}

export interface TarotYesNoProps extends CommonProps {
  question?: string;
  allowReversed?: boolean;
  seed?: string;
}

/**
 * A one-card yes/no draw. `how_decided` explains the convention used (a
 * reversal flips the card's usual lean) rather than leaving the reader to
 * guess why a "positive" card came back a "no". Verified live:
 * /api/astro/tarot/yes-no/.
 */
export function TarotYesNo({ question, allowReversed = true, seed, className }: TarotYesNoProps) {
  const state = useOccultQuery<YesNoResponse>("astro/tarot/yes-no", {
    allow_reversed: allowReversed,
    ...(question ? { question } : {}),
    ...(seed ? { seed } : {}),
  });

  return (
    <Card title="Tarot Yes or No" subtitle={question} className={className}>
      <StatusView state={state} loadingLabel="Drawing…">
        {(data) => (
          <>
            <StatRow>
              <Stat
                label="Answer"
                value={data.answer === "yes" ? "Yes" : "No"}
                hint={
                  <>
                    {data.card}
                    {data.orientation === "reversed" && <Badge tone="muted"> reversed</Badge>}
                  </>
                }
              />
            </StatRow>
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--occult-fg-muted)" }}>
              {data.how_decided}
            </p>
          </>
        )}
      </StatusView>
    </Card>
  );
}
