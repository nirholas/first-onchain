import { describe, expect, it } from "vitest";
import { agentManifest, metadataUri, tokenAmount } from "../lib/validation";

describe("launch validation", () => {
  it("converts display supply to atomic units", () => expect(tokenAmount("1000000", "6")).toEqual({ amount: 1_000_000_000_000n, decimals: 6 }));
  it("rejects amounts outside u64", () => expect(() => tokenAmount("18446744073709551616", "0")).toThrow("maximum"));
  it("rejects pathological supply input before BigInt parsing", () => expect(() => tokenAmount("1".repeat(100_000), "0")).toThrow("maximum"));
  it("accepts permanent metadata protocols", () => {
    expect(metadataUri("ipfs://cid/metadata.json")).toBe("ipfs://cid/metadata.json");
    expect(metadataUri("ar://transaction")).toBe("ar://transaction");
  });
  it("rejects unsafe metadata protocols", () => expect(() => metadataUri("javascript:alert(1)")).toThrow("Metadata URI"));
  it("rejects empty content-addressed URIs and embedded credentials", () => {
    expect(() => metadataUri("ipfs://")).toThrow("Metadata URI");
    expect(() => metadataUri("https://user:pass@example.com/metadata.json")).toThrow("Metadata URI");
  });
});

describe("agent manifest validation", () => {
  it("normalizes HTTPS manifests and capabilities", () => expect(agentManifest({ name: " Atlas ", version: "1.0.0", endpoint: "https://agent.example/manifest", description: " test ", capabilities: "research, research, execute" })).toMatchObject({ name: "Atlas", endpoint: "https://agent.example/manifest", capabilities: ["research", "execute"] }));
  it("rejects insecure endpoints", () => expect(() => agentManifest({ name: "Atlas", version: "1.0.0", endpoint: "http://agent.example", description: "", capabilities: "" })).toThrow("HTTPS"));
  it("accepts complete semantic versions and rejects malformed prereleases", () => {
    expect(agentManifest({ name: "Atlas", version: "1.2.3-beta.1+build.7", endpoint: "https://agent.example", description: "", capabilities: "" }).version).toBe("1.2.3-beta.1+build.7");
    expect(() => agentManifest({ name: "Atlas", version: "1.0.0-beta..1", endpoint: "https://agent.example", description: "", capabilities: "" })).toThrow("semantic");
  });
});
