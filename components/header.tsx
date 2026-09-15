"use client";
import Link from "next/link";
import { NETWORK } from "@/lib/constants";
import { AuthButton } from "./auth-button";
import { WalletButton } from "./wallet-button";

export function Header() {
  return <header className="nav"><div className="shell nav-inner">
    <Link className="brand" href="/"><span className="brand-mark" />first</Link>
    <nav className="nav-links"><Link href="/studio">Studio</Link><Link href="/explore">Explore</Link><Link href="/docs">Docs</Link><a href="https://github.com/nirholas/first-onchain" target="_blank" rel="noreferrer">GitHub</a></nav>
    <div className="nav-actions"><span className="network">{NETWORK}</span><AuthButton/><WalletButton /></div>
  </div></header>;
}
