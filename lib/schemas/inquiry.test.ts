import { describe, expect, test } from "vitest";
import {
  INQUIRY_CATEGORIES,
  categorySlug,
  inquirySchema,
  matchCategorySlug,
} from "./inquiry";

const BASE = {
  name: "Ahmed Khan",
  email: "Ahmed@Example.COM",
  category: "Textiles & Garments" as const,
  message: "Need 500 thobes delivered to Dubai, please quote.",
};

describe("inquirySchema (shared zod contract, P1-1)", () => {
  test("valid payload parses with normalized email + defaulted optionals", () => {
    const parsed = inquirySchema.parse({ ...BASE });
    expect(parsed.email).toBe("ahmed@example.com");
    expect(parsed.company).toBe("");
    expect(parsed.phone).toBe("");
  });

  test("company/phone are optional", () => {
    const parsed = inquirySchema.parse({
      ...BASE,
      company: "Test LLC",
      phone: "+971 50 123 4567",
    });
    expect(parsed.company).toBe("Test LLC");
  });

  test("bad phone is rejected", () => {
    expect(() =>
      inquirySchema.parse({ ...BASE, phone: "abc" }),
    ).toThrow("Please provide a valid phone number.");
  });

  test("non-enum category is rejected", () => {
    expect(() =>
      inquirySchema.parse({ ...BASE, category: "hacked" }),
    ).toThrow();
  });

  test("honeypot must stay empty", () => {
    expect(() =>
      inquirySchema.parse({ ...BASE, website: "http://spam.com" }),
    ).toThrow();
    expect(inquirySchema.parse({ ...BASE, website: "" }).website).toBe("");
  });

  test("short message / short name are rejected", () => {
    expect(() => inquirySchema.parse({ ...BASE, message: "hi" })).toThrow(
      "min 10 characters",
    );
    expect(() => inquirySchema.parse({ ...BASE, name: "A" })).toThrow();
  });
});

describe("category slugs (P1-2 preselect links)", () => {
  test("every category round-trips through its slug", () => {
    for (const category of INQUIRY_CATEGORIES) {
      expect(matchCategorySlug(categorySlug(category))).toBe(category);
    }
  });

  test("unknown slug matches nothing", () => {
    expect(matchCategorySlug("hacked")).toBeNull();
  });
});
