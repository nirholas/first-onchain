# Deployment

First supports Cloudflare Workers and any OCI runtime, including Google Cloud Run. Keep every secret in the provider secret store; never commit `.env.local`, `.dev.vars`, API tokens, RPC credentials, or R2 keys.

## Cloudflare Workers

The project uses the OpenNext adapter because it preserves the existing Next.js application and supports App Router route handlers used by wallet authentication.

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run preview:cloudflare
```

For production, add `SESSION_SECRET` with `npx wrangler secret put SESSION_SECRET`, configure the public Solana values at build time, then run `npm run deploy:cloudflare`. The committed Wrangler configuration enables Workers observability and keeps generated output out of Git.

Required production values:

- `SESSION_SECRET`: random 32+ character server-only value.
- `NEXT_PUBLIC_SOLANA_RPC_URL`: rate-limited mainnet RPC with v1 read/send support.
- `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`.
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS origin.

## Google Cloud Run

The multi-stage Dockerfile builds Next.js standalone output and runs as an unprivileged user on port 8080.

```bash
gcloud run deploy first-onchain \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta \
  --set-secrets SESSION_SECRET=first-onchain-session:latest
```

Set public build-time variables through your build pipeline. Do not pass secrets as Docker build arguments. After deployment, exercise wallet sign-in, a devnet inscription, v1 explorer decoding, and a disposable fixed-supply mint before enabling mainnet.

## Release gates

1. `npm ci && npm run typecheck && npm test && npm run build` passes.
2. Production dependency audit has no high or critical findings.
3. Authentication and RPC endpoints are rate-limited at the edge.
4. Logs and alerts cover 5xx responses, authentication spikes, and RPC failure rate.
5. A rollback target remains available during every release.
