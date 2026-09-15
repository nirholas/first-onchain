import { describe, expect, it } from "vitest";
import { byteLength, chunkUtf8, normalizeJson } from "../lib/inscribe";
describe("inscription encoding",()=>{
  it("counts UTF-8 bytes",()=>expect(byteLength("hi 👋")).toBe(7));
  it("chunks without breaking multi-byte characters",()=>{const chunks=chunkUtf8("a👋b",4);expect(chunks).toEqual(["a","👋","b"]);expect(chunks.join("")).toBe("a👋b")});
  it("normalizes JSON",()=>expect(normalizeJson('{ "a": 1 }')).toBe('{"a":1}'));
  it("rejects invalid chunk sizes",()=>expect(()=>chunkUtf8("a",0)).toThrow());
});
