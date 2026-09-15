import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { MAX_MEMO_BYTES, MEMO_PROGRAM_ID } from "./constants";

export type InscriptionEnvelope = {
  protocol: "first/1";
  id: string;
  type: "text" | "json" | "image" | "agent";
  part: number;
  total: number;
  data: string;
};

export function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function chunkUtf8(value: string, maxBytes: number): string[] {
  if (maxBytes < 1) throw new Error("Chunk size must be positive");
  const chunks: string[] = [];
  let current = "";
  for (const character of value) {
    if (byteLength(current + character) > maxBytes) {
      if (!current) throw new Error("Character exceeds chunk size");
      chunks.push(current);
      current = character;
    } else current += character;
  }
  if (current || !chunks.length) chunks.push(current);
  return chunks;
}

export function createInscriptionInstructions(
  owner: PublicKey,
  content: string,
  type: InscriptionEnvelope["type"],
  id = crypto.randomUUID()
) {
  // Keep envelope + UTF-8 payload comfortably below legacy transaction packet limits.
  const chunks = chunkUtf8(content, MAX_MEMO_BYTES);
  return chunks.map((data, index) => {
    const envelope: InscriptionEnvelope = { protocol: "first/1", id, type, part: index + 1, total: chunks.length, data };
    return new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: owner, isSigner: true, isWritable: false }],
      data: Buffer.from(JSON.stringify(envelope), "utf8")
    });
  });
}

export function normalizeJson(value: string) {
  return JSON.stringify(JSON.parse(value));
}
