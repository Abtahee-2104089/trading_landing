import { describe, expect, it } from "vitest";
import {
  hashPassword,
  hmacSha256Hex,
  sha256Hex,
  signSession,
  timingSafeEqualStr,
  verifyPassword,
  verifySession,
} from "./adminCrypto";

describe("adminCrypto", () => {
  it("sha256 matches the FIPS test vector", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("hmac is deterministic and key-sensitive", () => {
    const a = hmacSha256Hex("key", "msg");
    expect(a).toBe(hmacSha256Hex("key", "msg"));
    expect(a).not.toBe(hmacSha256Hex("other", "msg"));
    expect(a).toHaveLength(64);
  });

  it("password round-trips; wrong password fails", () => {
    const record = hashPassword("Admin@123");
    expect(record.salt).toHaveLength(32);
    expect(verifyPassword("Admin@123", record)).toBe(true);
    expect(verifyPassword("admin@123", record)).toBe(false);
    expect(verifyPassword("", record)).toBe(false);
  });

  it("timingSafeEqualStr compares lengths and content", () => {
    expect(timingSafeEqualStr("abc", "abc")).toBe(true);
    expect(timingSafeEqualStr("abc", "abd")).toBe(false);
    expect(timingSafeEqualStr("abc", "abcd")).toBe(false);
  });

  it("session tokens verify, reject tampering and expiry", () => {
    const secret = "test-secret";
    const token = signSession("Admin@Example.com", Date.now() + 60_000, secret);
    const parsed = verifySession(token, secret);
    expect(parsed?.email).toBe("admin@example.com");

    expect(verifySession(token, "wrong-secret")).toBeNull();
    expect(verifySession(`${token}tampered`, secret)).toBeNull();
    const expired = signSession("a@b.co", Date.now() - 1000, secret);
    expect(verifySession(expired, secret)).toBeNull();
    expect(verifySession("not.a.token", secret)).toBeNull();
  });
});
