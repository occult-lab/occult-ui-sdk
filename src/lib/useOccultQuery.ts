"use client";

import { useEffect, useRef, useState } from "react";
import { OccultApiError } from "./client";
import { useOccultContext } from "./OccultProvider";

export type QueryState<T> =
  | { status: "loading"; data: undefined; error: undefined }
  | { status: "error"; data: undefined; error: OccultApiError | Error }
  | { status: "success"; data: T; error: undefined };

/**
 * The one data-fetching hook every component in the library is built on.
 *
 * `body` is compared by JSON value, not by reference, so passing a fresh
 * object literal as props every render (the normal way to call a component)
 * does not cause a fetch loop - only an actual change in what is being asked
 * for triggers a new request. `enabled: false` is how a component like the
 * Kundli form waits for the visitor to submit before it calls anything.
 */
export function useOccultQuery<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  options?: { enabled?: boolean },
): QueryState<T> {
  const { client } = useOccultContext();
  const enabled = options?.enabled ?? true;
  const bodyKey = JSON.stringify(body);
  const [state, setState] = useState<QueryState<T>>({
    status: "loading",
    data: undefined,
    error: undefined,
  });
  const bodyRef = useRef(body);
  bodyRef.current = body;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();

    setState({ status: "loading", data: undefined, error: undefined });

    client
      .post<T>(endpoint, bodyRef.current, { signal: controller.signal })
      .then((data) => {
        if (!cancelled) setState({ status: "success", data, error: undefined });
      })
      .catch((error: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        const err =
          error instanceof OccultApiError || error instanceof Error
            ? error
            : new Error(String(error));
        setState({ status: "error", data: undefined, error: err });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, endpoint, bodyKey, enabled]);

  return state;
}
