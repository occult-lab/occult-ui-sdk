"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { OccultClient, type OccultClientOptions } from "./client";

interface OccultContextValue {
  client: OccultClient;
  /** "en" or "hi" - components ask the API for the matching language field. */
  locale: "en" | "hi";
}

const OccultContext = createContext<OccultContextValue | null>(null);

export interface OccultProviderProps extends OccultClientOptions {
  locale?: "en" | "hi";
  children: ReactNode;
}

/**
 * Wrap your app (or just the part that uses occult-api-ui) once:
 *
 *   <OccultProvider apiKey={process.env.NEXT_PUBLIC_OCCULT_API_KEY}>
 *     <NatalChart date="1990-04-12" time="06:30" place="Jaipur, India" />
 *   </OccultProvider>
 *
 * Every component in this library reads its client from here via
 * useOccultClient() rather than taking an apiKey prop itself - one place to
 * configure the key, the base URL and the language, not one per component.
 *
 * A key embedded in a browser bundle is visible to anyone who opens
 * devtools. That is fine for a local prototype; for anything shipped to
 * real users, proxy through your own server (see the `occult-api-demo`
 * pattern: your frontend calls your API, your server calls Occult API,
 * the key never reaches the browser) and pass a short-lived token or your
 * own endpoint as `baseUrl` instead.
 */
export function OccultProvider({
  apiKey,
  baseUrl,
  headers,
  locale = "en",
  children,
}: OccultProviderProps) {
  const value = useMemo<OccultContextValue>(
    () => ({
      client: new OccultClient({ apiKey, baseUrl, headers }),
      locale,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, baseUrl, locale],
  );

  return <OccultContext.Provider value={value}>{children}</OccultContext.Provider>;
}

export function useOccultContext(): OccultContextValue {
  const ctx = useContext(OccultContext);
  if (!ctx) {
    throw new Error(
      "occult-api-ui components must be rendered inside <OccultProvider apiKey=\"...\">.",
    );
  }
  return ctx;
}
