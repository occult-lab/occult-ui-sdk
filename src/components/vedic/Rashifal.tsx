"use client";

import { Card } from "../primitives/Card";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { display, labelize } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps, ZodiacSign } from "@/types";

interface DailyRashifal {
  date: string;
  sign: string;
  element: string;
  general_prediction: string;
  general_prediction_hi?: string;
  aspects: Record<string, string>;
  aspects_hi?: Record<string, string>;
  lucky: { color: string; number: number; time: string };
  moon_transit: { house: number; classification: string };
}

interface RashifalResponse {
  get_daily_rashifal: DailyRashifal;
}

export interface RashifalProps extends CommonProps {
  sign: ZodiacSign;
  /** "YYYY-MM-DD", defaults to today. */
  date?: string;
}

/**
 * A daily horoscope reading for one sign: the general prediction, aspects
 * (career, love, health...), lucky color/number/time, and the Moon's house
 * transit driving it. Verified live: /api/astro/rashifal/
 * (get_daily_rashifal key).
 */
export function Rashifal({ sign, date, locale, className }: RashifalProps) {
  const state = useOccultQuery<RashifalResponse>("astro/rashifal", {
    rashi: sign,
    ...(date ? { date } : {}),
    keys: ["get_daily_rashifal"],
  });

  return (
    <Card title={labelize(sign)} subtitle="Daily horoscope" className={className}>
      <StatusView state={state}>
        {(data) => {
          const r = data.get_daily_rashifal;
          const prediction = locale === "hi" && r.general_prediction_hi ? r.general_prediction_hi : r.general_prediction;
          const aspects = locale === "hi" && r.aspects_hi ? r.aspects_hi : r.aspects;
          return (
            <>
              <p style={{ margin: "0 0 1rem" }}>{prediction}</p>
              <StatRow>
                <Stat label="Lucky Color" value={display(r.lucky.color)} />
                <Stat label="Lucky Number" value={r.lucky.number} />
                <Stat label="Lucky Time" value={display(r.lucky.time)} />
                <Stat
                  label="Moon Transit"
                  value={`House ${r.moon_transit.house}`}
                  hint={labelize(r.moon_transit.classification)}
                />
              </StatRow>
              <div className="occult-space-top" style={{ display: "grid", gap: "0.6rem" }}>
                {Object.entries(aspects).map(([name, text]) => (
                  <div key={name}>
                    <strong>{labelize(name)}:</strong> {text}
                  </div>
                ))}
              </div>
            </>
          );
        }}
      </StatusView>
    </Card>
  );
}
