import { describe, expect, it } from "vitest";
import { issueSession, readSession } from "../lib/auth";
import { authMessage } from "../lib/auth-message";

describe("wallet authentication", () => {
  it("binds the challenge to the deployment domain", () => {
    const message = authMessage("wallet", "nonce", "first.example", "https://first.example");
    expect(message).toContain("first.example wants you to sign in");
    expect(message).toContain("URI: https://first.example");
    expect(message).toContain("Nonce: nonce");
  });

  it("round-trips an authenticated session", async () => {
    const token = await issueSession("wallet-address");
    await expect(readSession(token)).resolves.toBe("wallet-address");
    await expect(readSession(`${token}tampered`)).resolves.toBeNull();
  });
});
