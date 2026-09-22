/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import {
  resolveSessionSecret,
  signSession,
} from "./adminCrypto";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/*.js",
  "!./**/*.test.ts",
]);

function makeTest() {
  return convexTest(schema, modules);
}

/** Staff session minted like `/api/admin-login` does (dev secret in tests). */
function staffSession(email: string): string {
  return signSession(
    email,
    Date.now() + 60_000,
    resolveSessionSecret(undefined),
  );
}

describe("adminUsers team management", () => {
  test("setup is open, then closes after the first account", async () => {
    const t = makeTest();
    expect(await t.query(api.adminUsers.setupNeeded, {})).toBe(true);
    await t.mutation(api.adminUsers.setupFirstAdmin, {
      email: "admin@example.com",
      password: "admin12345",
    });
    expect(await t.query(api.adminUsers.setupNeeded, {})).toBe(false);
    await expect(
      t.mutation(api.adminUsers.setupFirstAdmin, {
        email: "second@example.com",
        password: "admin12345",
      }),
    ).rejects.toThrow("already exists");
  });

  test("anonymous createAdmin is rejected", async () => {
    const t = makeTest();
    await t.mutation(api.adminUsers.setupFirstAdmin, {
      email: "admin@example.com",
      password: "admin12345",
    });
    await expect(
      t.mutation(api.adminUsers.createAdmin, {
        email: "new@example.com",
        password: "newpass123",
      }),
    ).rejects.toThrow("Sign in required.");
  });

  test("signed-in admin can add, list, and remove another admin", async () => {
    const t = makeTest();
    await t.mutation(api.adminUsers.setupFirstAdmin, {
      email: "admin@example.com",
      password: "admin12345",
    });
    const session = staffSession("admin@example.com");

    const created = await t.mutation(api.adminUsers.createAdmin, {
      email: "teammate@example.com",
      password: "teammate123",
      adminSecret: session,
    });
    expect(created.email).toBe("teammate@example.com");

    // Duplicate rejected.
    await expect(
      t.mutation(api.adminUsers.createAdmin, {
        email: "teammate@example.com",
        password: "otherpass123",
        adminSecret: session,
      }),
    ).rejects.toThrow("already exists");

    // New admin can log in.
    const login = await t.mutation(api.adminUsers.login, {
      email: "teammate@example.com",
      password: "teammate123",
    });
    expect(login.ok).toBe(true);

    const team = await t.query(api.adminUsers.list, {
      adminSecret: session,
    });
    expect(team.map((u) => u.email).sort()).toEqual([
      "admin@example.com",
      "teammate@example.com",
    ]);

    // Cannot remove yourself.
    await expect(
      t.mutation(api.adminUsers.removeAdmin, {
        email: "admin@example.com",
        adminSecret: session,
      }),
    ).rejects.toThrow("own account");

    // Removing the other admin works; removed admin can no longer log in.
    await t.mutation(api.adminUsers.removeAdmin, {
      email: "teammate@example.com",
      adminSecret: session,
    });
    const after = await t.mutation(api.adminUsers.login, {
      email: "teammate@example.com",
      password: "teammate123",
    });
    expect(after.ok).toBe(false);
  });

  test("last admin cannot be removed", async () => {
    const t = makeTest();
    await t.mutation(api.adminUsers.setupFirstAdmin, {
      email: "solo@example.com",
      password: "solopass123",
    });
    const session = staffSession("solo@example.com");
    await expect(
      t.mutation(api.adminUsers.removeAdmin, {
        email: "solo@example.com",
        adminSecret: session,
      }),
    ).rejects.toThrow();
  });
});
