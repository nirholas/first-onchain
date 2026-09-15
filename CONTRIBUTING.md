# Contributing

Use Node 22 and start from a clean branch.

```bash
npm ci
npm run check
```

Keep wallet signing client-side, preserve devnet as the default, add tests for protocol or validation changes, and document every public behavior. Protocol-breaking changes must use a new identifier instead of changing `first/1` semantics.

Before opening a pull request, run `npm run ci`, describe the user-visible effect and security implications, and include screenshots for interface changes. Do not commit credentials, wallet secrets, build output, or generated keypairs. Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md).
