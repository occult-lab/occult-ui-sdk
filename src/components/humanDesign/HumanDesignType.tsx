"use client";

import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Stat";
import { Stat, StatRow } from "../primitives/Stat";
import { StatusView } from "../primitives/StatusView";
import { labelize, toApiDateTime } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { BirthDetails, CommonProps } from "@/types";

interface HumanDesignProperties {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  not_self_theme: string;
  defined_centres: string[];
  open_centres: string[];
}

/**
 * Type, Strategy, Authority and Profile - the four facts a Human Design
 * reading opens with - plus the defined/open centres as badges. For the
 * full bodygraph diagram, a separate Bodygraph component (ported from the
 * geometry already built for panchang-web) is the next piece to add here;
 * this one covers the properties every other HD component in RoxyAPI's
 * catalogue (HD profile, HD variables) is a variation of. Verified live:
 * /api/astro/human-design/properties/.
 */
export function HumanDesignType({
  date,
  time,
  latitude,
  longitude,
  timezone,
  place,
  className,
}: BirthDetails & CommonProps) {
  const state = useOccultQuery<HumanDesignProperties>("astro/human-design/properties", {
    date_time: toApiDateTime(date, time, timezone),
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Human Design" subtitle={place} className={className}>
      <StatusView state={state}>
        {(data) => (
          <>
            <StatRow>
              <Stat label="Type" value={data.type} hint={data.strategy} />
              <Stat label="Authority" value={data.authority} />
              <Stat label="Profile" value={data.profile} />
              <Stat label="Definition" value={data.definition} />
            </StatRow>
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--occult-fg-muted)", margin: "0 0 0.4rem" }}>
                Defined centres
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {data.defined_centres.map((c) => (
                  <Badge key={c} tone="active">{labelize(c)}</Badge>
                ))}
                {data.open_centres.map((c) => (
                  <Badge key={c} tone="muted">{labelize(c)}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </StatusView>
    </Card>
  );
}
