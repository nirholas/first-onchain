import { AccountRole, type TransactionSigner } from "@solana/kit";
import { MAX_MEMO_BYTES, MEMO_PROGRAM_ADDRESS } from "./constants";

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
  owner: TransactionSigner,
  content: string,
  type: InscriptionEnvelope["type"],
  id = crypto.randomUUID()
) {
  // Measure the serialized JSON, not only the source payload: quotes, slashes,
  // and control characters expand when escaped into the envelope.
  const characters = Array.from(content);
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < characters.length || (!characters.length && !chunks.length)) {
    let low = cursor + 1;
    let high = characters.length;
    let best = cursor;
    while (low <= high) {
      const end = Math.floor((low + high) / 2);
      const candidate = characters.slice(cursor, end).join("");
      const probe: InscriptionEnvelope = { protocol: "first/1", id, type, part: 999999, total: 999999, data: candidate };
      if (byteLength(JSON.stringify(probe)) <= MAX_MEMO_BYTES) { best = end; low = end + 1; }
      else high = end - 1;
    }
    if (best === cursor) {
      if (!characters.length) { chunks.push(""); break; }
      throw new Error("A payload character cannot fit inside a v1 inscription envelope");
    }
    chunks.push(characters.slice(cursor, best).join(""));
    cursor = best;
  }
  return chunks.map((data, index) => {
    const envelope: InscriptionEnvelope = { protocol: "first/1", id, type, part: index + 1, total: chunks.length, data };
    return Object.freeze({
      programAddress: MEMO_PROGRAM_ADDRESS,
      accounts: [{ address: owner.address, role: AccountRole.READONLY_SIGNER, signer: owner }],
      data: new TextEncoder().encode(JSON.stringify(envelope))
    });
  });
}

export function normalizeJson(value: string) {
  return JSON.stringify(JSON.parse(value));
}
