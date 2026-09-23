/**
 * A thin, typed wrapper over the Occult API.
 *
 * Deliberately dumb: one method, one job. It signs requests with the API
 * key, decodes the {data, message, is_error} envelope every endpoint shares,
 * and throws a typed OccultApiError on anything else - callers (the hooks in
 * useOccultQuery.ts) turn that into loading/error/data state, this module
 * doesn't know about React at all.
 *
 * The key is the caller's problem to keep off the client. A component here
 * never assumes it is safe to embed a key in the browser - see the
 * `serverOnly` note on OccultClientOptions.
 */

export interface OccultClientOptions {
  /** Your Occult API key (`X-API-Key`). */
  apiKey: string;
  /**
   * Override for self-hosted or staging deployments. Defaults to the
   * production API.
   */
  baseUrl?: string;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
}

export class OccultApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "OccultApiError";
    this.status = status;
    this.code = code;
  }
}

interface Envelope<T> {
  data: T;
  message: string;
  is_error: boolean;
}

const DEFAULT_BASE_URL = "https://api.occultapi.com";

export class OccultClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: OccultClientOptions) {
    if (!options.apiKey) {
      throw new Error(
        "OccultClient needs an apiKey. Get one at https://occultapi.com/signup.",
      );
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.extraHeaders = options.headers ?? {};
  }

  /**
   * POST to one endpoint (e.g. "astro/panchanga") and return the decoded
   * `data` payload. Every occult-api-ui component calls this, never `fetch`
   * directly, so retry/caching behaviour can change in one place later.
   */
  async post<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    init?: { signal?: AbortSignal },
  ): Promise<T> {
    const path = endpoint.replace(/^\/+|\/+$/g, "");
    const url = `${this.baseUrl}/api/${path}/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...this.extraHeaders,
      },
      body: JSON.stringify(body),
      signal: init?.signal,
    });

    const raw = await response.text();
    let json: Envelope<T> | null = null;
    try {
      json = raw ? (JSON.parse(raw) as Envelope<T>) : null;
    } catch {
      // Falls through to the "unexpected response" error below.
    }

    if (!response.ok) {
      const message =
        (json && typeof json.message === "string" && json.message) ||
        `The Occult API returned status ${response.status}.`;
      throw new OccultApiError(message, response.status);
    }

    if (!json || !("data" in json)) {
      throw new OccultApiError(
        "The Occult API returned an unexpected response.",
        response.status,
      );
    }

    return json.data;
  }
}

/** Convenience factory, mirrors the shape of the official SDK's `createClient`. */
export function createOccultClient(options: OccultClientOptions): OccultClient {
  return new OccultClient(options);
}
