# Deployment

First supports Cloudflare Workers and any OCI runtime, including Google Cloud Run. Keep every secret in the provider secret store; never commit `.env.local`, `.dev.vars`, API tokens, RPC credentials, or R2 keys.

## Cloudflare Workers

The project uses the OpenNext adapter because it preserves the existing Next.js application and supports App Router route handlers used by wallet authentication.

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run preview:cloudflare
```

For production, add `SESSION_SECRET` with `npx wrangler secret put SESSION_SECRET`, export the public Solana values before building, then run `npm run deploy:cloudflare`. `NEXT_PUBLIC_*` values are compiled into the browser bundle and cannot be changed after the build. The committed Wrangler configuration enables Workers observability and keeps generated output out of Git.

```bash
export NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
export NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc.example
export NEXT_PUBLIC_APP_URL=https://first.example
npx wrangler secret put SESSION_SECRET
npm run deploy:cloudflare
```

Required production values:

- `SESSION_SECRET`: random 32+ character server-only value.
- `NEXT_PUBLIC_SOLANA_RPC_URL`: rate-limited mainnet RPC with v1 read/send support.
- `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`.
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS origin.

The current deployment uses Workers Static Assets and does not require an R2 bucket or R2 access keys. Add R2 only if a future feature stores objects outside the onchain inscription flow; use a scoped Worker binding rather than shipping S3 credentials to the browser.

## Google Cloud Run

The multi-stage Dockerfile builds Next.js standalone output and runs as an unprivileged user on port 8080.

Build the container with the intended public configuration, push it to Artifact Registry, then deploy that immutable image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta \
  --build-arg NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc.example \
  --build-arg NEXT_PUBLIC_APP_URL=https://first.example \
  -t REGION-docker.pkg.dev/PROJECT/REPOSITORY/first-onchain:GIT_SHA .

gcloud run deploy first-onchain \
  --image REGION-docker.pkg.dev/PROJECT/REPOSITORY/first-onchain:GIT_SHA \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets SESSION_SECRET=first-onchain-session:latest
```

Never pass `SESSION_SECRET` or provider credentials as Docker build arguments. After deployment, check `/api/health`, exercise wallet sign-in, a devnet inscription, v1 explorer decoding, and a disposable fixed-supply mint before enabling mainnet.

## Release gates

1. `npm ci && npm run ci` passes.
2. Production dependency audit has no high or critical findings.
3. Authentication and RPC endpoints are rate-limited at the edge.
4. Logs and alerts cover 5xx responses, authentication spikes, and RPC failure rate.
5. A rollback target remains available during every release.
