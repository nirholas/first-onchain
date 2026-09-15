import bs58 from "bs58";
import type { InscriptionEnvelope } from "./inscribe";

const TYPES = new Set<InscriptionEnvelope["type"]>(["text", "json", "image", "agent"]);

export function validateTransactionSignature(value: string) {
  const signature = value.trim();
  try {
    if (bs58.decode(signature).byteLength !== 64) throw new Error();
    return signature;
  } catch {
    throw new Error("Enter a valid 64-byte Solana transaction signature.");
  }
}

export function decodeFirstEnvelope(value: string): InscriptionEnvelope {
  let candidate: unknown;
  try { candidate = JSON.parse(value); } catch { throw new Error("The memo is not a JSON First envelope."); }
  if (!candidate || typeof candidate !== "object") throw new Error("The memo is not a First envelope.");
  const item = candidate as Record<string, unknown>;
  if (item.protocol !== "first/1") throw new Error("The memo does not use the first/1 protocol.");
  if (typeof item.id !== "string" || !item.id || item.id.length > 128) throw new Error("The envelope has an invalid artifact ID.");
  if (!TYPES.has(item.type as InscriptionEnvelope["type"])) throw new Error("The envelope has an unsupported artifact type.");
  if (!Number.isSafeInteger(item.part) || !Number.isSafeInteger(item.total) || Number(item.part) < 1 || Number(item.total) < Number(item.part)) throw new Error("The envelope has invalid part metadata.");
  if (typeof item.data !== "string") throw new Error("The envelope payload is invalid.");
  return item as InscriptionEnvelope;
}
