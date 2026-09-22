"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * `/admin/login` — staff sign-in with email + password.
 *
 * Mock account for local testing (created at `/admin/setup` while no
 * account exists): `admin@example.com` / `admin123`. The fields come
 * prefilled in development only — production shows empty fields.
 */
const MOCK_EMAIL = "admin@example.com";
const MOCK_PASSWORD = "admin123";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const isDev = process.env.NODE_ENV !== "production";
  const [email, setEmail] = useState(isDev ? MOCK_EMAIL : "");
  const [password, setPassword] = useState(isDev ? MOCK_PASSWORD : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Sign-in failed.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Sign-in failed. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">CMS sign in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Staff only. No account yet?{" "}
        <a href="/admin/setup" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
          Set up the admin account
        </a>
        .
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-1.5 block text-sm font-semibold text-navy-950"
          >
            Email
          </label>
          <input
            id="admin-email"
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
            htmlFor="admin-password"
            className="mb-1.5 block text-sm font-semibold text-navy-950"
          >
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            className={inputClasses}
            placeholder="••••••••"
          />
        </div>
        {isDev ? (
          <p className="text-xs text-slate-500">
            Dev mock: <span className="font-mono">{MOCK_EMAIL}</span> /{" "}
            <span className="font-mono">{MOCK_PASSWORD}</span> (create it first
            at <span className="font-mono">/admin/setup</span>).
          </p>
        ) : null}
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
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
