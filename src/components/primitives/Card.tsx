"use client";

import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("occult-card", className)}>
      {(title || subtitle) && (
        <div className="occult-card__head">
          {title && <h3 className="occult-card__title">{title}</h3>}
          {subtitle && <p className="occult-card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="occult-card__body">{children}</div>
    </div>
  );
}

export function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
