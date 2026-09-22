"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";

/**
 * `/admin/setup` — first-run admin account creation.
 *
 * Usable ONLY while no staff account exists (the Convex mutation rejects
 * otherwise, and this page redirects to login once setup closes). Creates
 * the account, signs in immediately, and lands on `/admin`.
 */
export default function AdminSetupPage() {
  const router = useRouter();
  const configured = isConvexConfigured();
  const needed = useQuery(
    api.adminUsers.setupNeeded,
    configured ? {} : "skip",
  );
  const [email, setEmail] = useState(
    process.env.NODE_ENV !== "production" ? "admin@example.com" : "",
  );
  const [password, setPassword] = useState(
    process.env.NODE_ENV !== "production" ? "admin123" : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Redirect after render — navigating during render triggers React's
  // "Cannot update a component while rendering" error.
  useEffect(() => {
    if (needed === false) router.replace("/admin/login");
  }, [needed, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Setup failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Setup failed. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return <p className="text-sm text-slate-600">Backend not configured.</p>;
  }
  if (needed === undefined) {
    return <p className="text-sm text-slate-600">Checking setup status…</p>;
  }
  if (needed === false) {
    return <p className="text-sm text-slate-600">Setup is closed — sign in.</p>;
  }

  const inputClasses =
    "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Set up the admin account</h1>
      <p className="mt-1 text-sm text-slate-600">
        First run only — this creates the CMS staff login. Use a strong
        password; you can change it later at{" "}
        <span className="font-mono">/admin/account</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="setup-email"
            className="mb-1.5 block text-sm font-semibold text-navy-950"
          >
            Admin email
          </label>
          <input
            id="setup-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
            className={inputClasses}
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="setup-password"
            className="mb-1.5 block text-sm font-semibold text-navy-950"
          >
            Password (min 8 characters)
          </label>
          <input
            id="setup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            className={inputClasses}
            placeholder="••••••••"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {busy ? "Creating…" : "Create admin account"}
        </button>
      </form>
    </div>
  );
}
