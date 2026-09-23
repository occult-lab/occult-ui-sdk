"use client";

import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";
import { StatusView } from "../primitives/StatusView";
import { formatDate, labelize } from "@/lib/format";
import { useOccultQuery } from "@/lib/useOccultQuery";
import type { CommonProps } from "@/types";

interface Ingress {
  body: string;
  datetime_utc: string;
  from_sign: string;
  to_sign: string;
  retrograde: boolean;
}

interface IngressResponse {
  count: number;
  ingresses: Ingress[];
}

export interface EphemerisTableProps extends CommonProps {
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
}

/**
 * Every sign change (and which of them are retrograde stations) across a
 * date range - the "what's moving this month" table every ephemeris page
 * opens with. Verified live: /api/astro/mundane/ingresses/.
 */
export function EphemerisTable({
  startDate,
  endDate,
  latitude = 0,
  longitude = 0,
  timezone = 0,
  className,
}: EphemerisTableProps) {
  const state = useOccultQuery<IngressResponse>("astro/mundane/ingresses", {
    date_time: `${startDate}T00:00:00Z`,
    end_date_time: `${endDate}T00:00:00Z`,
    latitude,
    longitude,
    timezone_as_float: timezone,
  });

  return (
    <Card title="Ephemeris" subtitle={`${startDate} – ${endDate}`} className={className}>
      <StatusView state={state}>
        {(data) => (
          <DataTable
            rows={data.ingresses as unknown as Record<string, unknown>[]}
            emptyLabel="No sign changes in this range."
            columns={[
              { path: "datetime_utc", label: "Date", render: (v) => formatDate(v) },
              { path: "body", label: "Body", render: (v) => labelize(String(v ?? "")) },
              { path: "from_sign", label: "From" },
              { path: "to_sign", label: "To" },
              { path: "retrograde", label: "Retrograde", render: (v) => (v ? "℞" : "—") },
            ]}
          />
        )}
      </StatusView>
    </Card>
  );
}
