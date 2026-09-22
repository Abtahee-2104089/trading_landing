"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { adminAuthArgs } from "@/lib/admin-token";
import {
  Field,
  FormError,
  FormOk,
  PrimaryButton,
  fieldInput,
} from "@/app/components/admin/fields";

/** `/admin/account` — staff identity, password change, team management. */
export default function AdminAccountPage() {
  const configured = isConvexConfigured();
  const me = useQuery(api.adminUsers.me, configured ? adminAuthArgs() : "skip");
  const team = useQuery(
    api.adminUsers.list,
    configured ? adminAuthArgs() : "skip",
  );
  const changePassword = useMutation(api.adminUsers.changePassword);
  const createAdmin = useMutation(api.adminUsers.createAdmin);
  const removeAdmin = useMutation(api.adminUsers.removeAdmin);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamOk, setTeamOk] = useState<string | null>(null);
  const [teamBusy, setTeamBusy] = useState(false);

  if (!configured) {
    return <p className="text-sm text-slate-600">Backend not configured.</p>;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setOk(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await changePassword({
        ...adminAuthArgs(),
        currentPassword,
        newPassword,
      });
      setOk("Password changed — use it on your next sign-in.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Password change failed. Is the current password correct?");
    } finally {
      setBusy(false);
    }
  }

  async function onAddAdmin(event: FormEvent) {
    event.preventDefault();
    setTeamError(null);
    setTeamOk(null);
    if (newAdminPassword.length < 8) {
      setTeamError("New admin password must be at least 8 characters.");
      return;
    }
    setTeamBusy(true);
    try {
      const created = await createAdmin({
        ...adminAuthArgs(),
        email: newEmail,
        password: newAdminPassword,
      });
      setTeamOk(`${created.email} can now sign in at /admin/login.`);
      setNewEmail("");
      setNewAdminPassword("");
    } catch {
      setTeamError("Could not add admin. Check the email and password.");
    } finally {
      setTeamBusy(false);
    }
  }

  async function onRemoveAdmin(email: string) {
    setTeamError(null);
    setTeamOk(null);
    if (!window.confirm(`Remove admin access for ${email}?`)) return;
    try {
      await removeAdmin({ ...adminAuthArgs(), email });
      setTeamOk(`${email} removed.`);
    } catch {
      setTeamError("Could not remove admin.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Admin account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Signed in as{" "}
        <span className="font-semibold text-navy-950">
          {me ? me.email : "…"}
        </span>
        .
      </p>
      <form onSubmit={onSubmit} className="mt-6 max-w-sm space-y-4">
        <Field label="Current password" htmlFor="acct-current">
          <input
            id="acct-current"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={busy}
            className={fieldInput}
          />
        </Field>
        <Field label="New password (min 8 characters)" htmlFor="acct-new">
          <input
            id="acct-new"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={busy}
            className={fieldInput}
          />
        </Field>
        <FormError message={error} />
        <FormOk message={ok} />
        <PrimaryButton disabled={busy}>
          {busy ? "Changing…" : "Change password"}
        </PrimaryButton>
      </form>

      <h2 className="mt-10 text-lg font-bold">Team admins</h2>
      <p className="mt-1 text-sm text-slate-600">
        Anyone here can sign in and manage the CMS. Adding requires your
        current signed-in session (verified against the admin session secret).
      </p>
      {team === undefined ? (
        <p className="mt-3 text-sm text-slate-600">Loading team…</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy-900/10 rounded-2xl border border-navy-900/10 bg-white">
          {team.map((member) => (
            <li
              key={member.email}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span>
                <span className="font-semibold text-navy-950">
                  {member.email}
                </span>{" "}
                {me && member.email === me.email ? (
                  <span className="ml-1 rounded-full bg-teal-700/10 px-2 py-0.5 text-xs font-semibold text-teal-800">
                    you
                  </span>
                ) : null}
              </span>
              {me && member.email !== me.email ? (
                <button
                  type="button"
                  onClick={() => void onRemoveAdmin(member.email)}
                  className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onAddAdmin} className="mt-4 max-w-sm space-y-4">
        <Field label="New admin email" htmlFor="team-email">
          <input
            id="team-email"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={teamBusy}
            className={fieldInput}
            placeholder="teammate@example.com"
          />
        </Field>
        <Field label="New admin password (min 8 characters)" htmlFor="team-password">
          <input
            id="team-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            disabled={teamBusy}
            className={fieldInput}
          />
        </Field>
        <FormError message={teamError} />
        <FormOk message={teamOk} />
        <PrimaryButton disabled={teamBusy}>
          {teamBusy ? "Adding…" : "Add admin"}
        </PrimaryButton>
      </form>
    </div>
  );
}
