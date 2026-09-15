import { describe, expect, it } from "vitest";
import { sessionSecretReady } from "../lib/runtime-config";

describe("runtime configuration", () => {
  it("allows the development fallback", () => expect(sessionSecretReady({ NODE_ENV: "development" })).toBe(true));
  it("requires a strong production session secret", () => {
    expect(sessionSecretReady({ NODE_ENV: "production", SESSION_SECRET: "too-short" })).toBe(false);
    expect(sessionSecretReady({ NODE_ENV: "production", SESSION_SECRET: "x".repeat(32) })).toBe(true);
  });
});
