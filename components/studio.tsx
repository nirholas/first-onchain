"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { address, generateKeyPairSigner, nonDivisibleSequentialInstructionPlan, some } from "@solana/kit";
import { AuthorityType, extension, getSetAuthorityInstruction } from "@solana-program/token-2022";
import { Bot, Braces, Coins, Fingerprint, Image as ImageIcon, LoaderCircle, Rocket, ShieldCheck } from "lucide-react";
import { byteLength, createInscriptionInstructions, normalizeJson } from "@/lib/inscribe";
import { explorerUrl, MAX_MEMO_BYTES, NETWORK } from "@/lib/constants";
import { optimizeImageArtifact } from "@/lib/image-artifact";
import { useSolanaClient } from "./providers";

type Tab = "inscribe" | "coin" | "agent" | "vanity";
type Notice = { kind: "success" | "error"; message: string; href?: string } | null;

const tabs = [
  { id: "inscribe" as const, label: "Inscribe", icon: Braces },
  { id: "coin" as const, label: "Launch coin", icon: Coins },
  { id: "agent" as const, label: "Publish agent", icon: Bot },
  { id: "vanity" as const, label: "Vanity address", icon: Fingerprint }
];

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <div className={`status ${notice.kind}`}>{notice.message}{notice.href && <> · <a href={notice.href} target="_blank" rel="noreferrer"><u>View on Explorer</u></a></>}</div>;
}

export function Studio() {
  const [tab, setTab] = useState<Tab>("inscribe");
  return <div className="studio-layout"><aside className="side-tabs">{tabs.map(({id,label,icon:Icon}) => <button key={id} onClick={() => setTab(id)} className={`side-tab ${tab === id ? "active" : ""}`}><Icon size={16}/>{label}</button>)}</aside><div>
    {tab === "inscribe" && <InscribePanel />}{tab === "coin" && <CoinPanel />}{tab === "agent" && <AgentPanel />}{tab === "vanity" && <VanityPanel />}
  </div></div>;
}

function useInscribe() {
  const client = useSolanaClient();
  const connected = useConnectedWallet(client);
  const publish = async (content: string, type: "text" | "json" | "image" | "agent", onProgress?: (done: number, total: number) => void) => {
    if (!connected?.signer) throw new Error("Connect a signing Solana wallet first.");
    if (!connected.supportedTransactionVersions.has(1)) throw new Error("This wallet does not advertise transaction v1 support yet. Update it or choose a v1-ready wallet.");
    const signer = connected.signer;
    const instructions = createInscriptionInstructions(signer, content, type);
    let last = "";
    for (let i = 0; i < instructions.length; i++) {
      const result = await client.sendTransaction(instructions[i]);
      last = String(result.context.signature);
      onProgress?.(i + 1, instructions.length);
    }
    return { signature: last, count: instructions.length };
  };
  return { publish, connected: Boolean(connected?.signer), supportsV1: connected?.supportedTransactionVersions.has(1) ?? false };
}

function InscribePanel() {
  const [type, setType] = useState<"text"|"json"|"image">("text");
  const [content, setContent] = useState(""); const [notice,setNotice]=useState<Notice>(null); const [busy,setBusy]=useState(false); const [progress,setProgress]=useState("");const[optimizing,setOptimizing]=useState(false);
  const { publish, connected, supportsV1 } = useInscribe();
  const bytes = byteLength(content); const chunks = Math.max(1, Math.ceil(bytes / MAX_MEMO_BYTES));
  const chooseImage=async(file?:File)=>{if(!file)return;try{setOptimizing(true);setNotice(null);const artifact=await optimizeImageArtifact(file);setContent(artifact);setNotice({kind:"success",message:`Optimized locally from ${file.size.toLocaleString()} to ${byteLength(artifact).toLocaleString()} encoded bytes.`});}catch(e){setNotice({kind:"error",message:e instanceof Error?e.message:"Image optimization failed"})}finally{setOptimizing(false)}};
  const run = async () => { try { setBusy(true);setNotice(null); let value=content;if(type==="json")value=normalizeJson(content); const result=await publish(value,type,(d,t)=>setProgress(`${d}/${t} transactions confirmed`)); setNotice({kind:"success",message:`Inscribed ${byteLength(value)} bytes across ${result.count} transaction${result.count===1?"":"s"}.`,href:explorerUrl(result.signature)}); } catch(e){setNotice({kind:"error",message:e instanceof Error?e.message:"Inscription failed"});} finally{setBusy(false);} };
  return <section className="panel"><div className="panel-head"><div><h2>Inscribe anything</h2><p>Write a permanent, signed payload through the SPL Memo program. Larger content is safely chunked and linked by one protocol ID.</p></div><ImageIcon size={30}/></div>
    <div className="form-grid"><div className="field"><label>Artifact type</label><select value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="text">Text</option><option value="json">JSON</option><option value="image">Image / data URI</option></select></div><div className="field"><label>Network</label><input value={`${NETWORK} · transaction v1`} disabled/></div>{type==="image"&&<div className="field full"><label>Choose image</label><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={optimizing} onChange={e=>chooseImage(e.target.files?.[0])}/><small>{optimizing?"Optimizing entirely in this browser…":"PNG, JPEG, WebP, or SVG up to 8 MB. Raster images are resized and converted to compact WebP locally."}</small>{content.startsWith("data:image/")&&<img className="artifact-preview" src={content} alt="Local artifact preview"/>}</div>}<div className="field full"><label>Payload</label><textarea rows={11} value={content} onChange={e=>setContent(e.target.value)} placeholder={type === "json" ? '{"first":"hello, solana"}' : type === "image" ? "Choose an image above or paste a data URI." : "I was here."}/><small>{bytes.toLocaleString()} bytes · estimated {chunks} transaction{chunks===1?"":"s"} · 4,096-byte v1 format</small><div className="meter"><i style={{width:`${Math.min(100,bytes/MAX_MEMO_BYTES*100)}%`}}/></div></div></div><NoticeBox notice={notice}/>
    <div className="panel-actions"><small>{busy ? progress : connected && !supportsV1 ? "Wallet update required for v1" : "Transaction v1 · signed by your wallet · no custody"}</small><button className="button" disabled={!content || busy || !connected || !supportsV1} onClick={run}>{busy?<LoaderCircle size={16}/>:<Rocket size={16}/>} {connected ? supportsV1 ? busy?"Publishing…":"Inscribe onchain":"Wallet needs v1":"Connect wallet above"}</button></div>
  </section>;
}

function AgentPanel() {
  const [form,setForm]=useState({name:"",description:"",endpoint:"",capabilities:"research, execute",version:"1.0.0"}); const [notice,setNotice]=useState<Notice>(null);const[busy,setBusy]=useState(false); const {publish,connected}=useInscribe();
  const manifest=useMemo(()=>JSON.stringify({protocol:"first/agent/1",name:form.name,description:form.description,version:form.version,endpoint:form.endpoint,capabilities:form.capabilities.split(",").map(x=>x.trim()).filter(Boolean)},null,2),[form]);
  const run=async()=>{try{setBusy(true);const result=await publish(JSON.stringify(JSON.parse(manifest)),"agent");setNotice({kind:"success",message:`Agent manifest published across ${result.count} transaction${result.count===1?"":"s"}.`,href:explorerUrl(result.signature)});}catch(e){setNotice({kind:"error",message:e instanceof Error?e.message:"Publish failed"});}finally{setBusy(false)}};
  return <section className="panel"><div className="panel-head"><div><h2>Publish an agent</h2><p>Create a portable identity manifest for an AI agent, signed by its owner and discoverable from any Solana indexer.</p></div><Bot size={30}/></div><div className="form-grid">
    <div className="field"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="atlas"/></div><div className="field"><label>Version</label><input value={form.version} onChange={e=>setForm({...form,version:e.target.value})}/></div><div className="field full"><label>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="An autonomous Solana research agent"/></div><div className="field full"><label>HTTPS endpoint</label><input type="url" value={form.endpoint} onChange={e=>setForm({...form,endpoint:e.target.value})} placeholder="https://agent.example.com/.well-known/agent.json"/></div><div className="field full"><label>Capabilities (comma-separated)</label><input value={form.capabilities} onChange={e=>setForm({...form,capabilities:e.target.value})}/></div><div className="field full"><label>Manifest preview</label><textarea rows={10} readOnly value={manifest}/></div></div><NoticeBox notice={notice}/><div className="panel-actions"><small><ShieldCheck size={13}/> Ownership is proven by your signature</small><button className="button" disabled={!connected||!form.name||!form.endpoint||busy} onClick={run}>{busy?"Publishing…":"Publish agent"}</button></div></section>;
}

function CoinPanel() {
  const client=useSolanaClient(); const connected=useConnectedWallet(client); const [form,setForm]=useState({name:"",symbol:"",supply:"1000000",decimals:"6",uri:""});const[revoke,setRevoke]=useState(true);const[notice,setNotice]=useState<Notice>(null);const[busy,setBusy]=useState(false);
  const run=async()=>{try{
    if(!connected?.signer)throw new Error("Connect a signing Solana wallet first.");
    if(!connected.supportedTransactionVersions.has(1))throw new Error("This wallet does not advertise transaction v1 support yet.");
    if(!form.name.trim()||!form.symbol.trim())throw new Error("Name and symbol are required.");
    const decimals=Number(form.decimals);if(!Number.isInteger(decimals)||decimals<0||decimals>9)throw new Error("Decimals must be between 0 and 9.");
    const rawSupply=BigInt(form.supply)*10n**BigInt(decimals);if(rawSupply<=0n)throw new Error("Supply must be positive.");
    setBusy(true);setNotice(null);const signer=connected.signer;const owner=address(connected.account.address);const mint=await generateKeyPairSigner();const symbol=form.symbol.trim().toUpperCase();
    const metadata=extension("TokenMetadata",{updateAuthority:some(owner),mint:mint.address,name:form.name.trim(),symbol,uri:form.uri.trim(),additionalMetadata:new Map<string,string>()});
    const pointer=extension("MetadataPointer",{authority:some(owner),metadataAddress:some(mint.address)});
    const createPlan=await client.token2022.instructions.createMint({payer:signer,newMint:mint,decimals,mintAuthority:signer,extensions:[pointer,metadata]});
    const mintPlan=await client.token2022.instructions.mintToATA({payer:signer,owner,mint:mint.address,mintAuthority:signer,amount:rawSupply,decimals});
    const revokeInstruction=getSetAuthorityInstruction({owned:mint.address,owner:signer,authorityType:AuthorityType.MintTokens,newAuthority:null});
    const plans=revoke?[createPlan,mintPlan,revokeInstruction]:[createPlan,mintPlan];
    await client.sendTransaction(nonDivisibleSequentialInstructionPlan(plans));setNotice({kind:"success",message:`${symbol} launched atomically at ${mint.address}`,href:explorerUrl(mint.address,"address")});
  }catch(e){setNotice({kind:"error",message:e instanceof Error?e.message:"Token launch failed"});}finally{setBusy(false)}};
  return <section className="panel"><div className="panel-head"><div><h2>Launch a coin</h2><p>Create a Token‑2022 mint with native metadata, mint the complete supply to your wallet, and optionally make that supply permanent.</p></div><Coins size={30}/></div><div className="form-grid">
    <div className="field"><label>Token name</label><input maxLength={32} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="My First Coin"/></div><div className="field"><label>Symbol</label><input maxLength={10} value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})} placeholder="FIRST"/></div><div className="field"><label>Total supply</label><input inputMode="numeric" value={form.supply} onChange={e=>setForm({...form,supply:e.target.value.replace(/\D/g,"")})}/></div><div className="field"><label>Decimals</label><input type="number" min="0" max="9" value={form.decimals} onChange={e=>setForm({...form,decimals:e.target.value})}/></div><div className="field full"><label>Metadata URI (optional)</label><input type="url" value={form.uri} onChange={e=>setForm({...form,uri:e.target.value})} placeholder="https://arweave.net/…"/></div><div className="field full"><label><input type="checkbox" checked={revoke} onChange={e=>setRevoke(e.target.checked)} style={{width:"auto",marginRight:8}}/> Revoke mint authority after creation (fixed supply)</label><small>This is irreversible and prevents any future minting.</small></div></div><NoticeBox notice={notice}/><div className="panel-actions"><small>One atomic v1 approval · rent + network fees</small><button className="button" disabled={!connected||!connected.supportedTransactionVersions.has(1)||busy||!form.name||!form.symbol} onClick={run}>{busy?"Launching…":connected&&!connected.supportedTransactionVersions.has(1)?"Wallet needs v1":"Launch token"}</button></div></section>;
}

function VanityPanel(){
  const[prefix,setPrefix]=useState("1st");const[suffix,setSuffix]=useState("");const[caseSensitive,setCaseSensitive]=useState(false);const[running,setRunning]=useState(false);const[attempts,setAttempts]=useState(0);const[result,setResult]=useState<{address:string;secretKey:Uint8Array}|null>(null);const[notice,setNotice]=useState<Notice>(null);
  const worker=useRef<Worker|null>(null);const difficulty=Math.pow(58,prefix.length+suffix.length);
  useEffect(()=>()=>worker.current?.terminate(),[]);
  const run=()=>{if(!/^[1-9A-HJ-NP-Za-km-z]*$/.test(prefix+suffix)){setNotice({kind:"error",message:"Use Base58 characters only (no 0, O, I, or l)."});return}worker.current?.terminate();const next=new Worker("/vanity-worker.js");worker.current=next;setRunning(true);setResult(null);setAttempts(0);setNotice(null);next.onmessage=event=>{if(event.data.type==="progress")setAttempts(event.data.attempts);if(event.data.type==="found"){setAttempts(event.data.attempts);setResult({address:event.data.address,secretKey:new Uint8Array(event.data.secretKey)});setRunning(false);next.terminate();worker.current=null}if(event.data.type==="error"){setNotice({kind:"error",message:event.data.message});setRunning(false);next.terminate();worker.current=null}};next.postMessage({type:"start",prefix,suffix,caseSensitive})};
  const stop=()=>{worker.current?.postMessage({type:"cancel"});worker.current?.terminate();worker.current=null;setRunning(false);setNotice({kind:"error",message:"Search stopped. No key material was retained."})};
  const download=()=>{if(!result)return;const blob=new Blob([JSON.stringify(Array.from(result.secretKey))],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${result.address}.json`;a.click();URL.revokeObjectURL(a.href)};
  return <section className="panel"><div className="panel-head"><div><h2>Vanity address</h2><p>Search for a memorable Solana keypair in an isolated browser worker. Nothing is transmitted or saved by First.</p></div><Fingerprint size={30}/></div><div className="form-grid"><div className="field"><label>Starts with</label><input value={prefix} onChange={e=>setPrefix(e.target.value.slice(0,6))} placeholder="first"/></div><div className="field"><label>Ends with</label><input value={suffix} onChange={e=>setSuffix(e.target.value.slice(0,6))} placeholder="sol"/></div><div className="field full"><label><input style={{width:"auto",marginRight:8}} type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)}/> Case-sensitive</label><small>Estimated search space: {difficulty.toLocaleString()} attempts. Keep combined patterns under 6 characters for a practical browser search.</small></div></div>{running&&<div className="status">Searching off the main thread… {attempts.toLocaleString()} attempts</div>}{result&&<><div className="status success">Match found after {attempts.toLocaleString()} attempts.</div><div className="vanity-result">{result.address}</div></>}<NoticeBox notice={notice}/><div className="panel-actions"><small>Never share the downloaded secret key.</small><div style={{display:"flex",gap:8}}>{result&&<button className="button secondary" onClick={download}>Download keypair</button>}{running?<button className="button" onClick={stop}>Stop search</button>:<button className="button" disabled={!prefix&&!suffix} onClick={run}>Generate locally</button>}</div></div></section>;
}
