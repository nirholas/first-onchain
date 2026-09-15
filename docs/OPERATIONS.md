# Production operations

## Release gate

Run from a clean checkout with Node 22:

```bash
npm ci
npm run ci
```

This runs ESLint with zero warnings, TypeScript, unit tests, a production Next.js build, and a high-severity production dependency audit. Deploy an immutable commit SHA only after it passes.

## Health and synthetic checks

Probe `/api/health` every minute and alert after three consecutive failures. Also exercise `/`, `/studio`, `/docs`, `/explore`, and `/api/auth/session`. Monitor latency, 4xx/5xx rate, auth `429` volume, instance restarts, and Solana RPC failures.

The health endpoint proves application readiness, including production session-secret configuration, but not RPC health. Use a separate synthetic `getHealth` request against the configured Solana provider.

## Rate limiting

The application includes bounded per-instance auth throttling. Because serverless instances do not share memory, configure distributed limits at Cloudflare or the load balancer for `/api/auth/nonce` and `/api/auth/verify`. Never trust client-supplied forwarding headers unless the platform overwrites them.

## Secrets

- Store `SESSION_SECRET` only in Secret Manager or Wrangler secrets.
- Scope deployment credentials to one project/account and rotate them regularly.
- Never place RPC secrets in a `NEXT_PUBLIC_*` value; those values are shipped to browsers.
- Treat any token pasted into chat, an issue, logs, or a terminal transcript as compromised.

## Rollout and rollback

1. Deploy to a new immutable Cloud Run revision or Cloudflare Worker version.
2. Probe all synthetic routes and complete a disposable devnet write.
3. Shift traffic only after checks pass.
4. Roll back to the preceding known-good image/version when error rate or wallet completion regresses.
5. Record the incident, affected revisions, chain transactions, and credential rotations.

Onchain writes cannot be rolled back. Never use a production wallet for smoke tests.

## Incident response

For credential exposure, revoke first, replace provider secrets, deploy, invalidate sessions by rotating `SESSION_SECRET` when appropriate, and review audit logs. For an RPC incident, disable mainnet actions in the UI or redeploy against a verified provider; do not silently switch networks.
