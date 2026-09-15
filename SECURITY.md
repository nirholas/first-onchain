# Security policy

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository and include impact, reproduction steps, and a minimal proof of concept.

First never needs a seed phrase or private key. The vanity tool creates a keypair in browser memory and only exports it on explicit user action. If any hosted copy asks users to paste a secret key, treat it as malicious.

## Supported version

Security fixes target the latest release on `main`. Older commits and third-party forks are unsupported.

## Scope

Reports about wallet authentication, transaction construction, protocol parsing, key generation, secret exposure, dependency compromise, or the official deployments are in scope. Spam, social engineering, denial-of-service traffic, issues requiring a compromised user device, and vulnerabilities in Solana or wallet software without a First-specific impact are out of scope.

## Response process

Maintainers will acknowledge a complete report, reproduce it privately, prepare a tested fix, rotate affected secrets, and publish a coordinated advisory when appropriate. Do not access other users' data, submit mainnet transactions, or retain secrets while testing.

## Deployment expectations

Official deployments use HTTPS, HTTP-only SameSite cookies, exact-origin signature challenges, security headers, provider secret stores, and client-side wallet signing. Per-instance application throttling is not a replacement for distributed edge rate limiting. Operators are responsible for their RPC provider, monitoring, legal disclosures, and timely dependency upgrades.
