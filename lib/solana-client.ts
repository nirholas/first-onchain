import { createClient, devnet, lamports, mainnet } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { token2022Program } from "@solana-program/token-2022";
import { NETWORK } from "./constants";

export function createFirstClient() {
  const isMainnet = NETWORK === "mainnet-beta";
  const chain = isMainnet ? "solana:mainnet" : "solana:devnet";
  const fallbackUrl = isMainnet
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";
  const rawUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || fallbackUrl;
  const rpcUrl = isMainnet ? mainnet(rawUrl) : devnet(rawUrl);

  return createClient()
    .use(walletSigner({ chain, storage: typeof window === "undefined" ? null : localStorage }))
    .use(
      solanaRpc({
        rpcUrl,
        transactionConfig: {
          version: 1,
          // V1 defaults both resource limits to zero. The planner simulates the
          // operation and writes explicit safe limits into transactionConfig.
          estimateResourceLimits: true,
          priorityFeeLamports: lamports(5_000n)
        }
      })
    )
    .use(token2022Program());
}

export type FirstClient = ReturnType<typeof createFirstClient>;
