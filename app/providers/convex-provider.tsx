"use client";

import { useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

/**
 * Convex ↔ Vercel env wiring (Kabir-owned).
 *
 * Reads NEXT_PUBLIC_CONVEX_URL baked at build time. During static
 * prerender / local runs without `bunx convex dev`, the URL is absent —
 * we fall back to a placeholder so the landing page still renders and
 * the form reports a clear error instead of crashing the whole tree.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const client = useMemo(() => {
    const url =
      process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
    return new ConvexReactClient(url);
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

/** True when the app was built with a real Convex deployment URL. */
export function isConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}
