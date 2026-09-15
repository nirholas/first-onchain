# First

The onchain creation studio for Solana. First lets anyone inscribe text, JSON, SVG and small media; publish a portable agent manifest; generate a vanity keypair locally; and launch a Token-2022 coin with native metadata.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Solana](https://img.shields.io/badge/Solana-Token--2022-111) ![License](https://img.shields.io/badge/license-Apache--2.0-cbff62)

## Live

- [Cloudflare Workers](https://first-onchain.ninabrekkerese.workers.dev) — global edge deployment
- [Google Cloud Run](https://first-onchain-93741856042.us-central1.run.app) — containerized production deployment

## Why

People keep making cultural “firsts” onchain. The hard part should be deciding what deserves permanence—not assembling instructions, estimating packet space, or trusting a custodial launcher. First turns those primitives into a clean, inspectable workflow.

## What works

- Permanent, signer-attributed SPL Memo inscriptions using the open `first/1` envelope
- Solana v1 transactions with a 4,096-byte ceiling and simulated resource limits
- UTF-8-safe 3,600-byte multipart chunking for content larger than one transaction
- Text, normalized JSON, data URI / compact SVG, and agent-manifest flows
- Local-only PNG, JPEG, WebP, and SVG optimization with an exact payload preview
- Token-2022 mint creation with Metadata Pointer and native Token Metadata
- Fixed-supply option that revokes mint authority after initial issuance
- Isolated Web Worker vanity generation, local-only key material, stop control, and explicit JSON download
- Wallet Standard connection and nonce-based Ed25519 wallet authentication
- Onchain transaction decoder, responsive SaaS UI, Three.js hero, protocol docs
- Devnet by default so a fresh clone is safe to explore

## Run locally

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Use a disposable devnet wallet and request devnet SOL from a faucet.

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Recommended | Solana JSON-RPC endpoint. Defaults to public devnet. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes for mainnet | `devnet` or `mainnet-beta`. |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical deployed URL for metadata. |
| `SESSION_SECRET` | Production | Random string of at least 32 characters for session JWTs. |

## Protocol

Every inscription is a JSON envelope in the instruction data of the public SPL Memo program:

```json
{"protocol":"first/1","id":"uuid","type":"text","part":1,"total":1,"data":"I was here."}
```

Indexers group by `id`, require parts `1...total`, preserve order, and verify the same signer on each memo instruction. Readers must pass `maxSupportedTransactionVersion: 1`. See the in-app `/docs` page for the full protocol and security model.

## Production checklist

1. Use a dedicated, rate-limited RPC provider rather than the public endpoint.
2. Generate a strong `SESSION_SECRET`, deploy over HTTPS, and add edge rate limiting to `/api/auth/*`.
3. Run the complete `npm run ci` release gate.
4. Complete an end-to-end devnet inscription and mint before switching the network variable.
5. Add monitoring, a CSP appropriate to your wallet support matrix, and jurisdiction-specific token disclosures.
6. Independently review transactions and dependencies before handling assets of material value.

## Documentation

- [Architecture and trust boundaries](docs/ARCHITECTURE.md)
- [Inscription protocol specification](docs/PROTOCOL.md)
- [HTTP API reference](docs/API.md)
- [Cloudflare and Cloud Run deployment](docs/DEPLOYMENT.md)
- [Production operations and incident response](docs/OPERATIONS.md)
- [Security policy](SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Important limitations

- A token launch does not create liquidity, a market, or any expectation of value.
- Agent manifests are discovery documents, not deployed executable Solana programs.
- Memo inscriptions are permanent transaction history but are not a high-volume file storage system.
- Vanity generation is intentionally browser-only; long patterns become exponentially expensive.

## Contributing

Issues and pull requests are welcome. Protocol changes must remain backward-compatible or introduce a new protocol identifier. Please read [SECURITY.md](SECURITY.md) before reporting a vulnerability.

## License

Apache-2.0 © First contributors
