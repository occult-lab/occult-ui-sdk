"use client";

import type { ReactNode } from "react";
import type { QueryState } from "@/lib/useOccultQuery";

/**
 * Wraps a useOccultQuery() result: shows a skeleton while loading, a plain
 * message on error (the API key is never echoed into this, unlike the admin
 * side of the WordPress plugin - a public-facing component has no
 * "manage_options" equivalent to gate a detailed error behind), and renders
 * `children(data)` on success. Every chart/table component in the library
 * is a one-line wrapper around this plus its own visual.
 */
export function StatusView<T>({
  state,
  children,
  loadingLabel = "Calculating…",
}: {
  state: QueryState<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
}) {
  if (state.status === "loading") {
    return (
      <div className="occult-status occult-status--loading" role="status" aria-live="polite">
        <span className="occult-spinner" aria-hidden="true" />
        {loadingLabel}
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="occult-status occult-status--error" role="alert">
        {state.error.message}
      </div>
    );
  }
  return <>{children(state.data)}</>;
}
