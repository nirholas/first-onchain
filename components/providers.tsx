"use client";

import { createContext, useContext, useMemo } from "react";
import { createFirstClient, type FirstClient } from "@/lib/solana-client";

const SolanaClientContext = createContext<FirstClient | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createFirstClient(), []);
  return <SolanaClientContext.Provider value={client}>{children}</SolanaClientContext.Provider>;
}

export function useSolanaClient() {
  const client = useContext(SolanaClientContext);
  if (!client) throw new Error("useSolanaClient must be used inside Providers");
  return client;
}
