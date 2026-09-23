"use client";

import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

export type TarotSpreadName =
  | "one_card"
  | "three_card"
  | "celtic_cross"
  | "horseshoe"
  | "relationship"
  | "situation";

interface SpreadCard {
  position: number;
  position_name: string;
  name: string;
  orientation: "upright" | "reversed";
  meaning: string;
}

interface TarotSpreadResponse {
  spread_name: string;
  positions: string[];
  cards: SpreadCard[];
}

export interface TarotSpreadProps extends CommonProps {
  spread?: TarotSpreadName;
  question?: string;
  allowReversed?: boolean;
  seed?: string;
}

/**
 * A named layout - three-card Past/Present/Future, the ten-card Celtic
 * Cross, and others - each card labelled with its position's meaning, not
 * just its number. Verified live: /api/astro/tarot/spread/.
 */
export function TarotSpread({
  spread = "three_card",
  question,
  allowReversed = true,
  seed,
  className,
}: TarotSpreadProps) {
  const state = useOccultQuery<TarotSpreadResponse>("astro/tarot/spread", {
    spread,
    allow_reversed: allowReversed,
    ...(question ? { question } : {}),
    ...(seed ? { seed } : {}),
  });

  return (
    <Card title="Tarot Spread" subtitle={question} className={className}>
      <StatusView state={state} loadingLabel="Laying out the cards…">
        {(data) => (
          <div className="occult-tarot-spread">
            {data.cards.map((card) => (
              <div key={card.position} className="occult-tarot-spread__card">
                <span className="occult-badge occult-badge--muted">{card.position_name}</span>
                <h4 style={{ margin: "0.35rem 0 0.2rem" }}>
                  {card.name}
                  {card.orientation === "reversed" && <Badge tone="muted"> reversed</Badge>}
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--occult-fg-muted)" }}>
                  {card.meaning}
                </p>
              </div>
            ))}
          </div>
        )}
      </StatusView>
    </Card>
  );
}
