"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface DeckCard {
  name: string;
  arcana: "major" | "minor";
  suit: string | null;
  number: number | null;
  upright: string;
  reversed: string;
}

interface TarotDeckResponse {
  deck: string;
  count: number;
  cards: DeckCard[];
}

export interface TarotDeckProps extends CommonProps {
  arcana?: "both" | "major" | "minor";
  suit?: "all" | "Wands" | "Cups" | "Swords" | "Pentacles";
}

/**
 * A reference listing of the deck - every card's upright and reversed
 * meaning, filterable to one arcana or suit. For drawing cards rather than
 * looking them up, use TarotCard or TarotSpread instead. Verified live:
 * /api/astro/tarot/deck/.
 */
export function TarotDeck({ arcana = "both", suit = "all", className }: TarotDeckProps) {
  const state = useOccultQuery<TarotDeckResponse>("astro/tarot/deck", { arcana, suit });

  return (
    <Card title="Tarot Deck Reference" subtitle={`${arcana} arcana`} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={data.cards as unknown as Record<string, unknown>[]}
            columns={[
              { path: "name", label: "Card" },
              { path: "upright", label: "Upright" },
              { path: "reversed", label: "Reversed" },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
