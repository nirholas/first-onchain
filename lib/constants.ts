import { address } from "@solana/kit";

export const MEMO_PROGRAM_ADDRESS = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
export const DEFAULT_RPC = "https://api.devnet.solana.com";
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet";
// Maximum serialized memo instruction data. The remaining v1 packet space is
// reserved for signatures, accounts, instructions and transaction config.
export const MAX_MEMO_BYTES = 3_600;
export const APP_NAME = "First";

export function explorerUrl(signature: string, type: "tx" | "address" = "tx") {
  const cluster = NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
}
