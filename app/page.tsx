import Link from "next/link";
import { ArrowRight, Bot, Braces, Coins, Fingerprint } from "lucide-react";
import { Orb } from "@/components/orb";

const features = [
  { icon: Braces, tag: "Memo protocol", title: "Inscribe anything", body: "Text, JSON, SVG, and small media written directly into signed Solana transactions." },
  { icon: Coins, tag: "Token-2022", title: "Launch a coin", body: "Create supply, decimals, authorities, and native onchain metadata without a custody layer." },
  { icon: Bot, tag: "first/agent", title: "Publish an agent", body: "Give autonomous software a permanent identity, capabilities manifest, and verifiable owner." },
  { icon: Fingerprint, tag: "Local compute", title: "Find your address", body: "Generate vanity Solana keypairs entirely inside your browser. Your secret never leaves the device." }
];

export default function Home() {
  return <main>
    <section className="hero"><div className="shell hero-grid">
      <div><span className="eyebrow"><i /> The onchain creation studio</span><h1>Be the<br />first.</h1><p>Inscribe ideas. Launch coins. Publish agents. Create permanent artifacts on Solana—with no CLI, no custody, and no mystery.</p>
        <div className="hero-actions"><Link href="/studio" className="button">Create onchain <ArrowRight size={16} /></Link><Link href="/docs" className="button secondary">Read the protocol</Link></div>
        <div className="proof"><span><strong>100%</strong>non-custodial</span><span><strong>~400ms</strong>block time</span><span><strong>Open</strong>protocol</span></div>
      </div>
      <div className="orb-wrap"><Orb /><div className="float-card fc-1"><strong>first/agent</strong>manifest verified ✓</div><div className="float-card fc-2"><strong>720 bytes</strong>ready to inscribe</div></div>
    </div></section>
    <div className="ticker"><div><span><b>1</b> Text onchain</span><span><b>1</b> Agent onchain</span><span><b>1</b> Coin onchain</span><span><b>1</b> Image onchain</span><span><b>1</b> Address with your name</span><span><b>1</b> Forever yours</span></div></div>
    <section className="section"><div className="shell"><div className="section-head"><h2>One studio.<br />Many firsts.</h2><p>The shortest path from an idea to a signed, inspectable Solana artifact. Every action is built locally and approved in your wallet.</p></div><div className="cards">{features.map(({icon: Icon, tag, title, body}) => <article className="feature-card" key={title}><div><span className="icon"><Icon size={20}/></span></div><div><small>{tag}</small><h3>{title}</h3><p>{body}</p></div></article>)}</div></div></section>
    <section className="section"><div className="shell steps"><div><span className="eyebrow"><i /> Transparent by design</span><h2 style={{marginTop:24}}>Your wallet.<br />Your signature.<br />Your first.</h2></div><div className="step-list"><div className="step"><span>01</span><div><h3>Compose</h3><p>Choose a primitive and preview exactly what will be written.</p></div></div><div className="step"><span>02</span><div><h3>Simulate</h3><p>We estimate bytes, rent, and transactions before anything is signed.</p></div></div><div className="step"><span>03</span><div><h3>Sign</h3><p>Your connected Solana wallet remains the only authority.</p></div></div><div className="step"><span>04</span><div><h3>Prove</h3><p>Receive a permanent explorer URL and shareable artifact receipt.</p></div></div></div></div></section>
    <section className="section"><div className="shell steps"><div className="terminal"><div className="terminal-head"><i/><i/><i/></div><p><span className="dim">$</span> first inscribe ./manifest.json</p><p><span className="blue">→</span> Encoding first/1 envelope</p><p><span className="blue">→</span> Payload: 684 bytes · 1 transaction</p><p><span className="blue">→</span> Wallet: 14B2…b6Ni</p><p><span className="green">✓</span> Confirmed in slot 427,993,821</p><p className="dim">https://explorer.solana.com/tx/4pQ…x7m</p><br/><p><span className="green">Permanent. Portable. Yours.</span></p></div><div><span className="eyebrow"><i /> Built in public</span><h2 style={{marginTop:24}}>No black<br />boxes.</h2><p style={{color:"var(--muted)",lineHeight:1.7}}>First uses public Solana programs and a tiny open envelope format. There is no backend signer, no private upload bucket, and no platform lock-in. Read the code. Fork it. Build on it.</p><p><a href="https://github.com/nirholas/first-onchain" target="_blank" rel="noreferrer" className="button secondary">View source <ArrowRight size={16}/></a></p></div></div></section>
    <section className="cta"><span className="eyebrow"><i /> Mainnet ready</span><h2>What will you put onchain first?</h2><Link href="/studio" className="button">Open the studio <ArrowRight size={16}/></Link></section>
  </main>;
}
