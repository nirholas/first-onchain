import { describe, expect, it } from "vitest";
import { checkRateLimit, clientIdentifier } from "../lib/rate-limit";

describe("auth rate limiting", () => {
  it("blocks requests beyond the window limit and resets", () => {
    const key = `test:${crypto.randomUUID()}`;
    expect(checkRateLimit(key, 2, 1_000, 0).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1_000, 1).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1_000, 2).allowed).toBe(false);
    expect(checkRateLimit(key, 2, 1_000, 1_001).allowed).toBe(true);
  });
  it("prefers the trusted Cloudflare address", () => expect(clientIdentifier(new Headers({ "cf-connecting-ip": "203.0.113.8", "x-forwarded-for": "spoofed" }))).toBe("203.0.113.8"));
  it("ignores a user-supplied prefix in a Google forwarding chain", () => expect(clientIdentifier(new Headers({ "x-forwarded-for": "spoofed, 203.0.113.9, 198.51.100.1" }))).toBe("203.0.113.9"));
});
