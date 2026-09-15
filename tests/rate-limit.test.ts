import { describe, expect, it } from "vitest";
import { checkRateLimit } from "../lib/rate-limit";

describe("auth rate limiting", () => {
  it("blocks requests beyond the window limit and resets", () => {
    const key = `test:${crypto.randomUUID()}`;
    expect(checkRateLimit(key, 2, 1_000, 0).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1_000, 1).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 1_000, 2).allowed).toBe(false);
    expect(checkRateLimit(key, 2, 1_000, 1_001).allowed).toBe(true);
  });
});
