import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: { default: "First — Put anything on Solana", template: "%s · First" },
  description: "Inscribe media, publish agents, generate vanity addresses, and launch tokens on Solana from one production-ready studio.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://first-onchain.vercel.app"),
  openGraph: { title: "First — Put anything on Solana", description: "Make your first onchain thing real.", type: "website" },
  twitter: { card: "summary_large_image", title: "First — Put anything on Solana", description: "Make your first onchain thing real." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><Header />{children}<Footer /></Providers></body></html>;
}
