"use client";
import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Search } from "lucide-react";
import { MEMO_PROGRAM_ID, explorerUrl } from "@/lib/constants";

type Decoded={signature:string;slot:number;payload:string}|null;
export function ExplorerSearch(){const{connection}=useConnection();const[sig,setSig]=useState("");const[result,setResult]=useState<Decoded>(null);const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 const run=async()=>{try{setBusy(true);setError("");setResult(null);const tx=await connection.getParsedTransaction(sig.trim(),{maxSupportedTransactionVersion:0,commitment:"confirmed"});if(!tx)throw new Error("Transaction not found on the selected network.");const instruction=tx.transaction.message.instructions.find(i=>"programId" in i&&i.programId.equals(MEMO_PROGRAM_ID));if(!instruction||!("data" in instruction))throw new Error("No First-compatible memo instruction found.");const bytes=(await import("bs58")).default.decode(instruction.data);setResult({signature:sig.trim(),slot:tx.slot,payload:new TextDecoder().decode(bytes)});}catch(e){setError(e instanceof Error?e.message:"Lookup failed")}finally{setBusy(false)}};
 return <><div className="panel" style={{marginBottom:40}}><div className="field"><label>Transaction signature</label><div style={{display:"flex",gap:10}}><input value={sig} onChange={e=>setSig(e.target.value)} placeholder="Paste a Solana transaction signature"/><button className="button" disabled={!sig||busy} onClick={run}><Search size={15}/>{busy?"Reading…":"Decode"}</button></div></div>{error&&<div className="status error">{error}</div>}{result&&<div className="status success"><b>Slot {result.slot.toLocaleString()}</b><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{result.payload}</pre><a href={explorerUrl(result.signature)} target="_blank" rel="noreferrer"><u>Open raw transaction</u></a></div>}</div></>}
