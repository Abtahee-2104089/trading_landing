"use client";

import { useRouter } from "next/navigation";

/** Clears the `admin_token` cookie via the logout route. */
export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
    } catch {
      // Cookie may already be gone — still redirect to login.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
    >
      Sign out
    </button>
  );
}
