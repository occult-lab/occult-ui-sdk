"use client";

import type { ReactNode } from "react";
import { cx } from "./Card";

/** A big labelled number/word - "Type: Generator", "Life Path: 7". */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("occult-stat", className)}>
      <span className="occult-stat__label">{label}</span>
      <span className="occult-stat__value">{value}</span>
      {hint && <span className="occult-stat__hint">{hint}</span>}
    </div>
  );
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("occult-stat-row", className)}>{children}</div>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "active" | "muted" }) {
  return <span className={cx("occult-badge", `occult-badge--${tone}`)}>{children}</span>;
}
