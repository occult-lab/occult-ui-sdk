"use client";

import type { ReactNode } from "react";
import { atPath, display } from "@/lib/format";
import { cx } from "./Card";

export interface DataTableColumn {
  path: string;
  label: string;
  /** Custom cell renderer, for when display() isn't enough (badges, links). */
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

/**
 * A row-oriented table: one <tr> per item in `rows`, one <td> per column.
 * This is the workhorse behind every "list of periods/planets/gates" table
 * in the library - Vimshottari dasha, ashtakavarga, ephemeris, upagrahas,
 * KP significators, all the same component with a different column set.
 */
export function DataTable({
  columns,
  rows,
  className,
  emptyLabel = "No data.",
}: {
  columns: DataTableColumn[];
  rows: Array<Record<string, unknown>>;
  className?: string;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="occult-empty">{emptyLabel}</p>;
  }
  return (
    <div className={cx("occult-table-wrap", className)}>
      <table className="occult-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.path}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => {
                const value = atPath(row, col.path);
                return (
                  <td key={col.path}>
                    {col.render ? col.render(value, row) : display(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A two-column key/value table - Type, Authority, Definition; Tithi, Nakshatra... */
export function KeyValueTable({
  rows,
  className,
}: {
  rows: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cx("occult-table-wrap", className)}>
      <table className="occult-table occult-table--kv">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
