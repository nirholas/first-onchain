"use client";
import { useEffect, useState } from "react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import bs58 from "bs58";
import { authMessage } from "@/lib/auth";
import { useSolanaClient } from "./providers";

export function AuthButton(){
  const client=useSolanaClient();const connected=useConnectedWallet(client);const[session,setSession]=useState<string|null>(null);const[busy,setBusy]=useState(false);
  const address=connected?.account.address;
  useEffect(()=>{fetch("/api/auth/session").then(r=>r.json()).then(x=>setSession(x.address)).catch(()=>null)},[address]);
  if(!address)return null;
  if(session===address)return <button className="button secondary small" onClick={async()=>{await fetch("/api/auth/session",{method:"DELETE"});setSession(null)}}>Signed in ✓</button>;
  return <button className="button secondary small" disabled={busy} onClick={async()=>{try{setBusy(true);const {nonce}=await fetch("/api/auth/nonce").then(r=>r.json());const message=authMessage(address,nonce);const signature=await client.wallet.signMessage(new TextEncoder().encode(message));const response=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({address,signature:bs58.encode(signature)})});if(!response.ok)throw new Error("Sign-in failed");setSession(address)}finally{setBusy(false)}}}>{busy?"Signing…":"Sign in"}</button>;
}
