import { PublicKey } from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
export const DEFAULT_RPC = "https://api.devnet.solana.com";
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet";
export const MAX_MEMO_BYTES = 720;
export const APP_NAME = "First";

export function explorerUrl(signature: string, type: "tx" | "address" = "tx") {
  const cluster = NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
}
