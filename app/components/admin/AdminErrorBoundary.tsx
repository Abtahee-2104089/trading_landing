"use client";

import { Component } from "react";
import type { ReactNode } from "react";

/**
 * Catches Convex auth errors (UNAUTHORIZED from `requireAdmin`) and renders
 * a "Sign in required" panel instead of crashing. Until Kabir wires real
 * login, every admin query shows this for anonymous visitors.
 */
export default class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { message: null };
  }

  static getDerivedStateFromError(error: unknown): { message: string | null } {
    const text =
      error instanceof Error ? error.message : String(error ?? "");
    const isAuth =
      /UNAUTHORIZED|Sign in required|Not authenticated|auth/i.test(text);
    return {
      message: isAuth
        ? "Sign in required — staff login is not wired yet. Ask Kabir for CMS access."
        : "Something went wrong loading this panel. Please try again.",
    };
  }

  componentDidCatch(): void {
    // No-op: the fallback panel below is the UX.
  }

  render(): ReactNode {
    if (this.state.message) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-gold-500/40 bg-gold-300/15 p-6 text-sm text-navy-900"
        >
          <p className="font-semibold">Restricted area</p>
          <p className="mt-1">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
