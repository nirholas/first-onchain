# Changelog

All notable changes are recorded here. The project follows semantic versioning from the first tagged stable release.

## 1.0.1 — 2026-09-15

### Added

- Exact-origin wallet authentication with bounded per-instance throttling.
- Token `u64` range, metadata URI, semantic version, and HTTPS agent validation.
- Strict First-envelope transaction decoding and 15-second RPC timeouts.
- Exact envelope-aware multipart estimates.
- Health endpoint, reproducible dependency pins, unified CI gate, and production operations documentation.

### Security

- Split browser-safe sign-in message construction from server session signing code.
- Documented distributed rate limiting, secret handling, immutable rollouts, and incident response.

## 1.0.0 — 2026-09-15

- Initial public studio with Solana transaction-v1 inscriptions, Token-2022 launches, agent manifests, browser-only vanity generation, wallet authentication, explorer, Cloudflare Workers deployment, and Cloud Run deployment.
