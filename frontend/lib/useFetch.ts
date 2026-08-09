"use client";

import { useEffect, useState } from "react";
import { ApiError } from "./api";

type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

/** Client-side fetch-on-mount, used consistently across every data-driven section
 * instead of server-side fetching — Next's relative-URL fetch() only reliably works
 * in the browser, not during server rendering, and every section already goes
 * through the same `next.config.ts` rewrite to the backend either way. */
export function useFetch<T>(fetcher: () => Promise<T>): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Failed to load.";
        setState({ status: "error", error: message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
