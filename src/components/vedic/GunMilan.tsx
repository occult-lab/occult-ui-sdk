"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

export interface GunMilanProps extends CommonProps {
  boyNakshatraNumber: number;
  boyPadaNumber: number;
  girlNakshatraNumber: number;
  girlPadaNumber: number;
}

/**
 * The 36-point Ashtakoota compatibility score.
 *
 * The API returns this as a bare 13-element array with no field names at
 * all — [varna, vashya, gana, tara, yoni, graha_maitri, bhakoot, nadi, total,
 * mahendra, vedha, rajju, sthree_dheergha] — which is only knowable by
 * reading the calculation source (core_engine/match/ashtakoota.py), since
 * neither the endpoint's docs nor its response say what each position means.
 * That mapping lives here, once, so nobody using this component has to
 * rediscover it. Verified live: /api/astro/gun-milan/.
 */
export function GunMilan({
  boyNakshatraNumber,
  boyPadaNumber,
  girlNakshatraNumber,
  girlPadaNumber,
  className,
}: GunMilanProps) {
  const state = useOccultQuery<{ score: (number | boolean)[] }>("astro/gun-milan", {
    boy_nakshatra_number: boyNakshatraNumber,
    boy_paadham_number: boyPadaNumber,
    girl_nakshatra_number: girlNakshatraNumber,
    girl_paadham_number: girlPadaNumber,
    nakshatra_number: boyNakshatraNumber,
    paadha_number: boyPadaNumber,
  });

  return (
    <Card title="Guna Milan" className={className}>
      <StatusView state={state}>
        {(data) => {
          const s = data.score;
          const koota = KOOTAS.map((k, i) => ({
            name: k.name,
            points: s[i],
            max: k.max,
          }));
          const total = typeof s[8] === "number" ? s[8] : 0;

          return (
            <>
              <StatRow>
                <Stat
                  label="Total"
                  value={`${total} / 36`}
                  hint={total >= 18 ? "Generally considered a workable match" : "Below the usual 18-point threshold"}
                />
              </StatRow>
              <DataTable
                className="occult-space-top"
                rows={koota}
                columns={[
                  { path: "name", label: "Koota" },
                  { path: "points", label: "Points" },
                  { path: "max", label: "Max" },
                ]}
              />
              <DataTable
                className="occult-space-top"
                rows={FLAGS.map((f, i) => ({ name: f, present: s[9 + i] }))}
                columns={[
                  { path: "name", label: "Additional check" },
                  {
                    path: "present",
                    label: "Present",
                    render: (v) => (v ? "✓" : "—"),
                  },
                ]}
              />
            </>
          );
        }}
      </StatusView>
    </Card>
  );
}

const KOOTAS = [
  { name: "Varna", max: 1 },
  { name: "Vashya", max: 2 },
  { name: "Gana", max: 6 },
  { name: "Tara", max: 3 },
  { name: "Yoni", max: 4 },
  { name: "Graha Maitri", max: 5 },
  { name: "Bhakoot", max: 7 },
  { name: "Nadi", max: 8 },
];

const FLAGS = ["Mahendra", "Vedha", "Rajju", "Stree Deergha"];
