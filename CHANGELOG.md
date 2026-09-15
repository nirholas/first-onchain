# Changelog

All notable changes are recorded here. The project follows semantic versioning from the first tagged stable release.

## 1.0.1 — 2026-09-15

### Added

- Exact-origin wallet authentication with bounded per-instance throttling.
- Token `u64` range, metadata URI, semantic version, and HTTPS agent validation.
- Strict First-envelope transaction decoding and 15-second RPC timeouts.
- Exact envelope-aware multipart estimates.
- Health endpoint, reproducible dependency pins, unified CI gate, and production operations documentation.
- Immutable Cloud Build configuration with explicit browser build-time settings and revision reporting.
- Complete npm package metadata and bundled protocol, API, security, and operations documentation.

### Security

- Split browser-safe sign-in message construction from server session signing code.
- Bound rate-limit keys and storage, reject pathological creation inputs, and fail production health checks when the session secret is unsafe.
- Handle vanity-worker failures and cap combined search patterns before expensive local generation begins.
- Documented distributed rate limiting, secret handling, immutable rollouts, and incident response.

## 1.0.0 — 2026-09-15

- Initial public studio with Solana transaction-v1 inscriptions, Token-2022 launches, agent manifests, browser-only vanity generation, wallet authentication, explorer, Cloudflare Workers deployment, and Cloud Run deployment.
