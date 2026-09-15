# Architecture

First is a client-first Next.js 16 application. Its server authenticates wallet ownership; it never holds a wallet key or signs an onchain transaction.

## Components

| Component | Responsibility | Trust level |
| --- | --- | --- |
| Browser studio | Compose artifacts, optimize images, build transactions, request wallet signatures | Untrusted client |
| Wallet Standard provider | Select accounts and approve signatures | User-controlled authority |
| Solana RPC | Simulate, submit, and read transactions | External infrastructure; responses must be validated |
| Auth routes | Issue nonces, verify Ed25519 signatures, issue HTTP-only sessions | Trusted application boundary |
| SPL Memo | Persist `first/1` inscription envelopes | Public onchain program |
| Token-2022 | Create mints, native metadata, accounts, supply, and authorities | Public onchain program |
| Vanity worker | Generate Ed25519 keys off the UI thread | Browser-only sensitive boundary |

## Write path

1. The browser validates and normalizes user input.
2. The inscription planner measures the complete serialized envelope and partitions UTF-8 without splitting code points.
3. The Solana client builds transaction-v1 plans and simulates resource limits.
4. The connected wallet displays and signs each transaction.
5. The client submits directly to the configured RPC and links the confirmed signature to Solana Explorer.

Multipart inscriptions are sequential, not atomic across transactions. A rejected or failed later part can leave an incomplete artifact; indexers must only present groups containing every declared part.

## Token path

The token workflow creates a Token-2022 mint with Metadata Pointer and Token Metadata extensions, creates the owner's associated token account, and mints the requested atomic amount. Fixed supply adds an irreversible mint-authority revocation. The input validator rejects amounts above `u64::MAX`.

Token creation does not create a bonding curve, liquidity pool, exchange listing, or expectation of value.

## Authentication path

The server issues a five-minute HTTP-only nonce. The wallet signs an origin-bound message. The verification route checks the exact origin, Base58 key/signature sizes, and detached Ed25519 signature, then returns a seven-day HS256 session cookie. Per-instance throttling is defense in depth; production must also use provider-level distributed rate limiting.

## Deployment model

The same source runs through OpenNext on Cloudflare Workers and through the standalone Next.js server on Cloud Run. `NEXT_PUBLIC_*` values are build-time inputs. `SESSION_SECRET` is runtime-only and belongs in the provider secret store.
