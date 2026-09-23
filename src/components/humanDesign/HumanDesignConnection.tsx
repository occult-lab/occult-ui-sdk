"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface Channel {
  channel: string;
  name: string;
  held_by?: string;
}

interface ConnectionResponse {
  person_a: { type: string; authority: string; profile: string };
  person_b: { type: string; authority: string; profile: string };
  connection: {
    electromagnetic: Channel[];
    companionship: Channel[];
    dominance: Channel[];
    compromise: Channel[];
  };
  combined_type: string;
  combined_definition: string;
  combined_defined_centres: string[];
}

export interface HumanDesignConnectionProps extends CommonProps {
  person: BirthDetails;
  partner: BirthDetails;
}

const CHANNEL_KINDS: Array<keyof ConnectionResponse["connection"]> = [
  "electromagnetic",
  "companionship",
  "dominance",
  "compromise",
];

/**
 * How two Human Design charts connect: which channels run between them, and
 * of what kind - electromagnetic (attraction), companionship (shared
 * interest), dominance or compromise (one person's gate completing the
 * other's, or each holding half). Verified live:
 * /api/astro/human-design/connection/.
 */
export function HumanDesignConnection({ person, partner, className }: HumanDesignConnectionProps) {
  const state = useOccultQuery<ConnectionResponse>("astro/human-design/connection", {
    date_time: toApiDateTime(person.date, person.time, person.timezone),
    partner_date_time: toApiDateTime(partner.date, partner.time, partner.timezone),
    timezone_as_float: person.timezone,
    partner_timezone_as_float: partner.timezone,
    latitude: person.latitude,
    longitude: person.longitude,
  });

  return (
    <Card title="Human Design Connection" className={className}>
      <StatusView state={state}>
        {(data) => {
          const rows = CHANNEL_KINDS.flatMap((kind) =>
            data.connection[kind].map((c) => ({
              kind: labelize(kind),
              channel: c.channel,
              name: c.name,
              held_by: c.held_by ? labelize(c.held_by) : "Both",
            })),
          );
          return (
            <>
              <StatRow>
                <Stat label={`${person.place ?? "Person A"}`} value={data.person_a.type} hint={data.person_a.authority} />
                <Stat label={`${partner.place ?? "Person B"}`} value={data.person_b.type} hint={data.person_b.authority} />
                <Stat label="Combined Type" value={data.combined_type} hint={data.combined_definition} />
              </StatRow>
              {rows.length > 0 ? (
                <DataTable
                  className="occult-space-top"
                  rows={rows}
                  columns={[
                    { path: "kind", label: "Kind" },
                    { path: "channel", label: "Channel" },
                    { path: "name", label: "Name" },
                    { path: "held_by", label: "Held By" },
                  ]}
                />
              ) : (
                <p className="occult-empty">No channels connect these two charts.</p>
              )}
            </>
          );
        }}
      </StatusView>
    </Card>
  );
}
