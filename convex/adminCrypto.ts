// ---------------------------------------------------------------------------
// Admin auth crypto — pure TypeScript, zero dependencies, zero Web-API
// globals (`atob`/`btoa`/`TextEncoder`/`TextDecoder` are NOT available in
// the Convex query/mutation runtime — a previous version used them and
// crashed every session check on deployment with a generic "Server Error"
// while all local tests passed).
//
// Imported from THREE runtimes, so it must stay free of Node/Convex-only
// APIs (`node:crypto`, `convex/server`):
//   - Next.js login/setup API routes (Node)
//   - `middleware.ts` (edge)
//   - Convex `adminUsers.ts` / `adminAuth.ts` (isolate)
//
// Provides: SHA-256, HMAC-SHA256, stretched password hashing (salt +
// iterated SHA-256), random salts, and signed session tokens.
// ---------------------------------------------------------------------------

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function utf8Encode(input: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let cp = input.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < input.length) {
      const lo = input.charCodeAt(i + 1);
      if (lo >= 0xdc00 && lo <= 0xdfff) {
        cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
        i++;
      }
    }
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(
        0xe0 | (cp >> 12),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return new Uint8Array(bytes);
}

function utf8Decode(bytes: Uint8Array): string {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 < 0x80) {
      out += String.fromCharCode(b0);
      i++;
    } else if ((b0 & 0xe0) === 0xc0 && i + 1 < bytes.length) {
      out += String.fromCharCode(
        ((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f),
      );
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0 && i + 2 < bytes.length) {
      out += String.fromCharCode(
        ((b0 & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else if ((b0 & 0xf8) === 0xf0 && i + 3 < bytes.length) {
      const cp =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      const v = cp - 0x10000;
      out += String.fromCharCode(0xd800 + (v >> 10), 0xdc00 + (v & 0x3ff));
      i += 4;
    } else {
      // Invalid sequence — skip one byte rather than throwing (fail-closed
      // callers treat the token as invalid).
      i++;
    }
  }
  return out;
}

const B64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function b64UrlEncodeBytes(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    s += i + 1 < bytes.length ? B64[(n >> 6) & 63] : "";
    s += i + 2 < bytes.length ? B64[n & 63] : "";
  }
  return s;
}

function b64UrlDecodeToBytes(input: string): Uint8Array | null {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  if (s.length % 4 === 1) return null;
  const quadLen = s.length + ((4 - (s.length % 4)) % 4);
  const out: number[] = [];
  for (let i = 0; i < quadLen; i += 4) {
    const c0 = B64.indexOf(s[i] ?? "=");
    const c1 = B64.indexOf(s[i + 1] ?? "=");
    const c2 = s[i + 2] === undefined || s[i + 2] === "=" ? 64 : B64.indexOf(s[i + 2]);
    const c3 = s[i + 3] === undefined || s[i + 3] === "=" ? 64 : B64.indexOf(s[i + 3]);
    if (c0 < 0 || c1 < 0 || c2 < 0 || c3 < 0) return null;
    const n = (c0 << 18) | (c1 << 12) | ((c2 & 63) << 6) | (c3 & 63);
    out.push((n >> 16) & 0xff);
    if (c2 !== 64) out.push((n >> 8) & 0xff);
    if (c3 !== 64) out.push(n & 0xff);
  }
  return new Uint8Array(out);
}

function utf8Bytes(input: string): Uint8Array {
  return utf8Encode(input);
}

function sha256Bytes(data: Uint8Array): Uint8Array {
  const ml = data.length;
  const bitLenHi = Math.floor((ml * 8) / 0x100000000);
  const bitLenLo = (ml * 8) >>> 0;
  const paddedLen = (((ml + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[ml] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, bitLenHi);
  view.setUint32(paddedLen - 4, bitLenLo);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array<number>(64);
  for (let off = 0; off < paddedLen; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(off + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + s1 + ch + K[i] + w[i]) | 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0);
  outView.setUint32(4, h1);
  outView.setUint32(8, h2);
  outView.setUint32(12, h3);
  outView.setUint32(16, h4);
  outView.setUint32(20, h5);
  outView.setUint32(24, h6);
  outView.setUint32(28, h7);
  return out;
}

const HEX = "0123456789abcdef";

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += HEX[(b >> 4) & 0xf] + HEX[b & 0xf];
  return out;
}

/** SHA-256 hex digest (test vector: "abc" → ba7816bf…). */
export function sha256Hex(input: string): string {
  return toHex(sha256Bytes(utf8Bytes(input)));
}

/** HMAC-SHA-256 hex (keys longer than a block are hashed first). */
export function hmacSha256Hex(key: string, message: string): string {
  let keyBytes = utf8Bytes(key);
  if (keyBytes.length > 64) keyBytes = sha256Bytes(keyBytes);
  const padded = new Uint8Array(64);
  padded.set(keyBytes);
  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = padded[i] ^ 0x36;
    opad[i] = padded[i] ^ 0x5c;
  }
  const msgBytes = utf8Bytes(message);
  const inner = new Uint8Array(64 + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, 64);
  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad);
  outer.set(innerHash, 64);
  return toHex(sha256Bytes(outer));
}

/** Length-constant string compare (avoid early-exit timing signal). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const PASSWORD_ITERATIONS = 30000;

export function randomHex(numBytes: number): string {
  const bytes = new Uint8Array(numBytes);
  const g = globalThis.crypto as
    | { getRandomValues?: (arr: Uint8Array) => void }
    | undefined;
  if (g?.getRandomValues) {
    g.getRandomValues(bytes);
  } else {
    // Fallback only on runtimes without WebCrypto (dev) — never prod.
    for (let i = 0; i < numBytes; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return toHex(bytes);
}

export type PasswordRecord = {
  salt: string;
  hash: string;
  iterations: number;
};

/** Stretched hash: SHA-256(salt + password), then iterated re-hashing. */
export function hashPassword(
  password: string,
  salt?: string,
  iterations: number = PASSWORD_ITERATIONS,
): PasswordRecord {
  const s = salt ?? randomHex(16);
  let current = toHex(sha256Bytes(utf8Bytes(`${s}:${password}`)));
  for (let i = 1; i < iterations; i++) {
    current = sha256Hex(`${s}:${current}`);
  }
  return { salt: s, hash: current, iterations };
}

export function verifyPassword(
  password: string,
  record: PasswordRecord,
): boolean {
  const recomputed = hashPassword(password, record.salt, record.iterations);
  return timingSafeEqualStr(recomputed.hash, record.hash);
}

// --- session tokens ----------------------------------------------------------

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function b64UrlEncode(input: string): string {
  return b64UrlEncodeBytes(utf8Encode(input));
}

function b64UrlDecode(input: string): string | null {
  const bytes = b64UrlDecodeToBytes(input);
  return bytes === null ? null : utf8Decode(bytes);
}

/** Mint `emailB64.expiryHex.hmac` — verified by middleware + Convex. */
export function signSession(
  email: string,
  expiresAtMs: number,
  secret: string,
): string {
  const payload = `${b64UrlEncode(email.toLowerCase())}.${expiresAtMs.toString(16)}`;
  return `${payload}.${hmacSha256Hex(secret, payload)}`;
}

export function verifySession(
  token: string,
  secret: string,
  nowMs: number = Date.now(),
): { email: string; expiresAtMs: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [emailB64, expiryHex, sig] = parts;
  const expected = hmacSha256Hex(secret, `${emailB64}.${expiryHex}`);
  if (!timingSafeEqualStr(sig, expected)) return null;
  const expiresAtMs = parseInt(expiryHex, 16);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) return null;
  const emailB64Decoded = b64UrlDecode(emailB64);
  if (emailB64Decoded === null) return null;
  try {
    const email = emailB64Decoded.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { email, expiresAtMs };
  } catch {
    return null;
  }
}

/** Session HMAC secret — set `ADMIN_SESSION_SECRET` in every runtime. */
export function resolveSessionSecret(configured?: string): string {
  const value = (configured ?? "").trim();
  if (value) return value;
  // Dev-only insecure fallback so the mock account works out of the box.
  // Any production deployment MUST set ADMIN_SESSION_SECRET.
  return "dev-only-insecure-session-secret";
}
