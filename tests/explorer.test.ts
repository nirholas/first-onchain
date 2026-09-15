import { describe, expect, it } from "vitest";
import { decodeFirstEnvelope, validateTransactionSignature } from "../lib/explorer";

describe("First transaction decoding", () => {
  const envelope = { protocol: "first/1", id: "artifact-id", type: "text", part: 1, total: 1, data: "hello" };

  it("accepts a complete protocol envelope", () => expect(decodeFirstEnvelope(JSON.stringify(envelope))).toEqual(envelope));
  it("rejects unrelated memo JSON", () => expect(() => decodeFirstEnvelope('{"hello":"world"}')).toThrow("first/1"));
  it("rejects impossible multipart metadata", () => expect(() => decodeFirstEnvelope(JSON.stringify({ ...envelope, part: 2, total: 1 }))).toThrow("part"));
  it("validates decoded signature length", () => {
    expect(validateTransactionSignature("1".repeat(64))).toBe("1".repeat(64));
    expect(() => validateTransactionSignature("not-a-signature")).toThrow("64-byte");
  });
});
