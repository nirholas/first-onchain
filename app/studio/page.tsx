import type { Metadata } from "next";
import { Studio } from "@/components/studio";
export const metadata: Metadata = { title: "Studio", description: "Create permanent Solana inscriptions, tokens, agents, and vanity addresses." };
export default function StudioPage(){return <main><div className="shell"><header className="page-head"><span className="eyebrow"><i/> Creation console</span><h1>Studio</h1><p>Every transaction is assembled in your browser and presented to your wallet for approval. Start on devnet, switch to mainnet when you are ready.</p></header><Studio/></div></main>}
