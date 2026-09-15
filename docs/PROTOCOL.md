# `first/1` inscription protocol

## Envelope

Each SPL Memo instruction contains one UTF-8 JSON object:

```json
{
  "protocol": "first/1",
  "id": "01997ef0-0000-7000-8000-000000000000",
  "type": "text",
  "part": 1,
  "total": 1,
  "data": "I was here."
}
```

| Field | Requirement |
| --- | --- |
| `protocol` | Exactly `first/1` |
| `id` | Non-empty artifact identifier, identical across every part |
| `type` | `text`, `json`, `image`, or `agent` |
| `part` | One-based safe integer |
| `total` | Safe integer greater than or equal to `part` |
| `data` | UTF-8 string fragment |

The current writer caps complete serialized memo instruction data at 3,600 bytes, retaining space inside Solana's 4,096-byte transaction-v1 limit for signatures, account keys, instructions, and transaction configuration.

## Authorship

The wallet address is included as a read-only signer account on every Memo instruction. Indexers must require the same signer for all parts. Merely naming an address inside `data` does not establish authorship.

## Reassembly

1. Read transactions with `maxSupportedTransactionVersion: 1`.
2. Select instructions for `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`.
3. Parse only valid `first/1` envelopes.
4. Group by artifact `id`, type, and signer.
5. Reject duplicate, missing, out-of-range, or inconsistent parts.
6. Sort numerically by `part` and concatenate `data` without separators.
7. Apply type-specific validation after reassembly.

Consumers must impose their own maximum artifact size and treat JSON, SVG, URLs, and agent endpoints as untrusted input. Never render onchain HTML or SVG without sanitization.

## Artifact types

- `text`: arbitrary UTF-8 text.
- `json`: normalized valid JSON.
- `image`: a data URI, normally compact WebP or SVG. Renderers must validate media types and sanitize SVG.
- `agent`: a `first/agent/1` JSON manifest containing a name, semantic version, HTTPS endpoint, description, and capabilities.

Backward-incompatible changes require a new protocol identifier. Existing `first/1` envelopes are immutable.
