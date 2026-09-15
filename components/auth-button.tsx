"use client";
import { useEffect, useState } from "react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import bs58 from "bs58";
import { authMessage } from "@/lib/auth-message";
import { useSolanaClient } from "./providers";

export function AuthButton(){
  const client=useSolanaClient();const connected=useConnectedWallet(client);const[session,setSession]=useState<string|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  const address=connected?.account.address;
  useEffect(()=>{fetch("/api/auth/session").then(r=>r.json()).then(x=>setSession(x.address)).catch(()=>null)},[address]);
  if(!address)return null;
  if(session===address)return <button className="button secondary small" onClick={async()=>{await fetch("/api/auth/session",{method:"DELETE"});setSession(null)}}>Signed in ✓</button>;
  return <div className="auth-control"><button className="button secondary small" title={error||undefined} disabled={busy} onClick={async()=>{try{setBusy(true);setError("");const nonceResponse=await fetch("/api/auth/nonce",{cache:"no-store"});const challenge=await nonceResponse.json();if(!nonceResponse.ok)throw new Error(challenge.error||"Could not start sign-in");const message=authMessage(address,challenge.nonce,window.location.host,window.location.origin);const signature=await client.wallet.signMessage(new TextEncoder().encode(message));const response=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({address,signature:bs58.encode(signature)})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Sign-in failed");setSession(address)}catch(cause){setError(cause instanceof Error?cause.message:"Sign-in failed")}finally{setBusy(false)}}}>{busy?"Signing…":error?"Try sign-in again":"Sign in"}</button>{error&&<span className="sr-only" role="alert">{error}</span>}</div>;
}
