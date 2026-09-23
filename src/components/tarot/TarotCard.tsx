"use client";

import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface DrawnCard {
  name: string;
  arcana: "major" | "minor";
  suit: string | null;
  orientation: "upright" | "reversed";
  meaning: string;
  yes_no: "yes" | "no";
}

interface TarotDrawResponse {
  question: string | null;
  cards: DrawnCard[];
}

export interface TarotCardProps extends CommonProps {
  /** Shown alongside the draw, and folded into the seed. */
  question?: string;
  allowReversed?: boolean;
  /** Send the same seed back to reproduce an exact draw - e.g. a daily card by date. */
  seed?: string;
}

/**
 * A single tarot draw - the "card of the day" component. For more than one
 * card in a named layout, use TarotSpread instead. Verified live:
 * /api/astro/tarot/draw/.
 */
export function TarotCard({ question, allowReversed = true, seed, className }: TarotCardProps) {
  const state = useOccultQuery<TarotDrawResponse>("astro/tarot/draw", {
    count: 1,
    allow_reversed: allowReversed,
    ...(question ? { question } : {}),
    ...(seed ? { seed } : {}),
  });

  return (
    <Card title="Tarot" subtitle={question} className={className}>
      <StatusView state={state} loadingLabel="Shuffling…">
        {(data) => {
          const card = data.cards[0];
          if (!card) return <p className="occult-empty">No card drawn.</p>;
          return (
            <div className="occult-tarot-card">
              <h4 style={{ margin: "0 0 0.35rem", fontSize: "1.15rem" }}>
                {card.name}
                {card.orientation === "reversed" && (
                  <Badge tone="muted"> reversed</Badge>
                )}
              </h4>
              <p style={{ margin: 0, color: "var(--occult-fg-muted)" }}>{card.meaning}</p>
            </div>
          );
        }}
      </StatusView>
    </Card>
  );
}
