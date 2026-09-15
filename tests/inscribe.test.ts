import { describe, expect, it } from "vitest";
import { generateKeyPairSigner } from "@solana/kit";
import { MAX_MEMO_BYTES } from "../lib/constants";
import { byteLength, chunkUtf8, createInscriptionChunks, createInscriptionInstructions, normalizeJson } from "../lib/inscribe";
describe("inscription encoding",()=>{
  it("counts UTF-8 bytes",()=>expect(byteLength("hi 👋")).toBe(7));
  it("chunks without breaking multi-byte characters",()=>{const chunks=chunkUtf8("a👋b",4);expect(chunks).toEqual(["a","👋","b"]);expect(chunks.join("")).toBe("a👋b")});
  it("normalizes JSON",()=>expect(normalizeJson('{ "a": 1 }')).toBe('{"a":1}'));
  it("rejects invalid chunk sizes",()=>expect(()=>chunkUtf8("a",0)).toThrow());
  it("caps the serialized envelope even when JSON escaping expands content",async()=>{const signer=await generateKeyPairSigner();const instructions=createInscriptionInstructions(signer,'"\\\n'.repeat(3000),"json","test-id");expect(instructions.length).toBeGreaterThan(1);for(const instruction of instructions)expect(instruction.data?.byteLength).toBeLessThanOrEqual(MAX_MEMO_BYTES)});
  it("estimates parts with the same envelope-aware planner used for publishing",async()=>{const content="x".repeat(MAX_MEMO_BYTES);const chunks=createInscriptionChunks(content,"text");const signer=await generateKeyPairSigner();expect(chunks).toHaveLength(createInscriptionInstructions(signer,content,"text").length);expect(chunks.length).toBeGreaterThan(1)});
});
