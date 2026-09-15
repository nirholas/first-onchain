"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { authMessage } from "@/lib/auth";

export function AuthButton(){
  const {publicKey,signMessage}=useWallet();const[session,setSession]=useState<string|null>(null);const[busy,setBusy]=useState(false);
  useEffect(()=>{fetch("/api/auth/session").then(r=>r.json()).then(x=>setSession(x.address)).catch(()=>null)},[publicKey]);
  if(!publicKey)return null;
  if(session===publicKey.toBase58())return <button className="button secondary small" onClick={async()=>{await fetch("/api/auth/session",{method:"DELETE"});setSession(null)}}>Signed in ✓</button>;
  return <button className="button secondary small" disabled={busy||!signMessage} onClick={async()=>{try{setBusy(true);const {nonce}=await fetch("/api/auth/nonce").then(r=>r.json());const message=authMessage(publicKey.toBase58(),nonce);const signature=await signMessage!(new TextEncoder().encode(message));const response=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({address:publicKey.toBase58(),signature:bs58.encode(signature)})});if(!response.ok)throw new Error("Sign-in failed");setSession(publicKey.toBase58())}finally{setBusy(false)}}}>{busy?"Signing…":"Sign in"}</button>;
}
