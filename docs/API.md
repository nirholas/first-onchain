# HTTP API

All responses are JSON. Authentication responses use `Cache-Control: no-store`.

## `GET /api/health`

Returns service readiness metadata. A healthy response has status `200` and `{ "status": "ok" }`. Production returns `503` with `{ "status": "misconfigured" }` when `SESSION_SECRET` is missing or shorter than 32 characters. This endpoint does not test the external Solana RPC.

## `GET /api/auth/nonce`

Creates a short-lived browser sign-in challenge and sets the five-minute `first_nonce` HTTP-only, Secure-in-production, SameSite=Strict cookie.

- `200`: `{ "nonce": "UUID" }`
- `429`: request limit exceeded; honor `Retry-After`

## `POST /api/auth/verify`

Requires a same-origin browser request, the nonce cookie, and JSON:

```json
{ "address": "BASE58_SOLANA_ADDRESS", "signature": "BASE58_ED25519_SIGNATURE" }
```

On success it clears the nonce and sets a seven-day `first_session` HTTP-only cookie. Expected failures use `400`, `401`, `403`, or `429`; callers must not infer whether an address belongs to a particular person.

## `GET /api/auth/session`

Returns `{ "address": null }` for anonymous or invalid sessions and the signed-in address otherwise.

## `DELETE /api/auth/session`

Clears the current session cookie and returns `{ "ok": true }`.

These endpoints prove wallet control only. They do not authorize transactions, custody funds, or grant server-side access to a private key.
