/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/*.js",
  "!./**/*.test.ts",
]);

const VALID = {
  name: "Ahmed Khan",
  email: "ahmed@test.com",
  company: "Test LLC",
  phone: "+971 50 123 4567",
  category: "Textiles & Garments",
  message: "Need 500 thobes delivered to Dubai, please quote.",
};

function makeTest() {
  return convexTest(schema, modules);
}

describe("inquiries.submit hardening (P0-1 + P1-1)", () => {
  test("valid payload succeeds and stores a reviewable lead", async () => {
    const t = makeTest();
    const { id } = await t.mutation(api.inquiries.submit, { ...VALID });
    expect(id).toBeDefined();
    const stored = await t.query(internal.inquiries.getInternal, { id: id! });
    expect(stored).toMatchObject({
      name: "Ahmed Khan",
      email: "ahmed@test.com",
      category: "Textiles & Garments",
      status: "new",
      emailStatus: "pending",
    });
  });

  test("invalid email is rejected", async () => {
    const t = makeTest();
    await expect(
      t.mutation(api.inquiries.submit, { ...VALID, email: "not-an-email" }),
    ).rejects.toThrow("Please provide a valid email address.");
  });

  test("non-enum category is rejected (no more free-form strings)", async () => {
    const t = makeTest();
    await expect(
      t.mutation(api.inquiries.submit, { ...VALID, category: "hacked" }),
    ).rejects.toThrow("Please choose a valid category.");
  });

  test("over-length input throws instead of being silently truncated", async () => {
    const t = makeTest();
    await expect(
      t.mutation(api.inquiries.submit, { ...VALID, name: "x".repeat(101) }),
    ).rejects.toThrow();
    const page = await t.query(internal.inquiries.listInternal, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(page.page).toHaveLength(0);
  });

  test("honeypot-filled submit silently succeeds WITHOUT insert or mail", async () => {
    const t = makeTest();
    const result = await t.mutation(api.inquiries.submit, {
      ...VALID,
      email: "bot@example.com",
      website: "http://spam.com",
    });
    // No id — but no error either, so the bot sees "success".
    expect(result.id).toBeUndefined();
    const page = await t.query(internal.inquiries.listInternal, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(page.page).toHaveLength(0);
  });

  test("6th rapid submit from one email is rate-limited", async () => {
    const t = makeTest();
    for (let i = 0; i < 5; i++) {
      await t.mutation(api.inquiries.submit, {
        ...VALID,
        email: "throttle@test.com",
        message: `throttle test message ${i} — long enough to validate`,
      });
    }
    await expect(
      t.mutation(api.inquiries.submit, {
        ...VALID,
        email: "throttle@test.com",
        message: "throttle test message 5 — long enough to validate",
      }),
    ).rejects.toThrow("Too many requests");
  });
});

describe("cms public reads are empty-DB safe", () => {
  test("getSiteSettings returns the live-copy fallback, never throws", async () => {
    const t = makeTest();
    const settings = await t.query(api.cms.getSiteSettings, {});
    expect(settings.siteName).toBe("UAE Trade Gateway");
    expect(settings.contact.email).toBeDefined();
    expect(settings.hero.assurances).toHaveLength(3);
  });

  test("product/service lists return [] on an empty DB", async () => {
    const t = makeTest();
    expect(await t.query(api.cms.listPublishedProducts, {})).toEqual([]);
    expect(await t.query(api.cms.listPublishedServices, {})).toEqual([]);
    expect(await t.query(api.cms.getSections, {})).toEqual([]);
  });
});

describe("seed is idempotent", () => {
  test("first run seeds 1/6/6/4, second run skips", async () => {
    const t = makeTest();
    const first = await t.mutation(internal.seed.seedCms, {});
    expect(first).toMatchObject({
      skipped: false,
      siteSettings: 1,
      sections: 6,
      products: 6,
      services: 4,
    });
    const products = await t.query(api.cms.listPublishedProducts, {});
    expect(products).toHaveLength(6);
    expect(products.map((p) => p.slug)).toContain("textiles-garments");

    const second = await t.mutation(internal.seed.seedCms, {});
    expect(second.skipped).toBe(true);
    expect(await t.query(api.cms.listPublishedProducts, {})).toHaveLength(6);
  });
});

describe("admin gate is fail-closed", () => {
  test("anonymous inquiriesAdmin.list is rejected", async () => {
    const t = makeTest();
    await expect(
      t.query(api.inquiriesAdmin.list, {
        paginationOpts: { numItems: 5, cursor: null },
      }),
    ).rejects.toThrow("Sign in required.");
  });

  test("anonymous cms admin mutation is rejected", async () => {
    const t = makeTest();
    await expect(
      t.mutation(api.cms.createProduct, {
        title: "HACKED",
        description: "nope, long enough message here",
        items: ["x"],
        alt: "x",
        sortOrder: 99,
        isPublished: true,
      }),
    ).rejects.toThrow("Sign in required.");
  });

  test("anonymous media save is rejected", async () => {
    const t = makeTest();
    await expect(
      t.mutation(api.media.save, {
        url: "https://example.ufs.sh/f/abc",
        alt: "x",
        usedBy: "test",
      }),
    ).rejects.toThrow("Sign in required.");
  });
});
