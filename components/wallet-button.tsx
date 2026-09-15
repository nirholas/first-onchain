"use client";

import { useState } from "react";
import { useConnect, useConnectedWallet, useDisconnect, useIsWalletReady, useWallets } from "@solana/kit-plugin-wallet/react";
import { ChevronDown, Wallet } from "lucide-react";
import { useSolanaClient } from "./providers";

function shortAddress(value: string) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function WalletButton() {
  const client = useSolanaClient();
  const wallets = useWallets(client);
  const connected = useConnectedWallet(client);
  const ready = useIsWalletReady(client);
  const connect = useConnect(client);
  const disconnect = useDisconnect(client);
  const [open, setOpen] = useState(false);
  const supportsV1 = connected?.supportedTransactionVersions.has(1) ?? false;

  if (!ready) return <button className="button small" disabled>Finding wallets…</button>;

  return <div className="wallet-menu">
    <button className="button small" onClick={() => setOpen(value => !value)}>
      <Wallet size={15}/>{connected ? shortAddress(connected.account.address) : "Connect wallet"}<ChevronDown size={14}/>
    </button>
    {open && <div className="wallet-popover">
      {connected ? <>
        <div className="wallet-current">
          <strong>{connected.wallet.name}</strong>
          <span className={supportsV1 ? "v1-ready" : "v1-missing"}>{supportsV1 ? "v1 ready" : "v1 unsupported"}</span>
          <code>{connected.account.address}</code>
        </div>
        <button className="wallet-choice" onClick={() => { disconnect.dispatch(); setOpen(false); }}>Disconnect</button>
      </> : wallets.length ? wallets.map(wallet => <button className="wallet-choice" key={wallet.name} disabled={connect.isRunning} onClick={() => { connect.dispatch(wallet); setOpen(false); }}>
        {wallet.icon && <img src={wallet.icon} alt=""/>}<span>{wallet.name}</span>
      </button>) : <p className="wallet-empty">No Wallet Standard wallet detected.</p>}
    </div>}
  </div>;
}
