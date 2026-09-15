const U64_MAX = 18_446_744_073_709_551_615n;

export function tokenAmount(supply: string, decimalsValue: string) {
  if (!/^\d+$/.test(supply)) throw new Error("Supply must be a whole number.");
  const decimals = Number(decimalsValue);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 9) throw new Error("Decimals must be between 0 and 9.");
  const amount = BigInt(supply) * 10n ** BigInt(decimals);
  if (amount <= 0n) throw new Error("Supply must be positive.");
  if (amount > U64_MAX) throw new Error("Supply exceeds the maximum Token-2022 amount for these decimals.");
  return { amount, decimals };
}

export function metadataUri(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("ipfs://") || trimmed.startsWith("ar://")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error("Metadata URI must use https://, ipfs://, or ar://.");
  }
}

export function agentManifest(input: { name: string; version: string; endpoint: string; description: string; capabilities: string }) {
  const name = input.name.trim();
  if (!name || name.length > 64) throw new Error("Agent name must contain 1–64 characters.");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(input.version.trim())) throw new Error("Version must be semantic, for example 1.0.0.");
  let endpoint: URL;
  try { endpoint = new URL(input.endpoint.trim()); } catch { throw new Error("Agent endpoint must be a valid HTTPS URL."); }
  if (endpoint.protocol !== "https:") throw new Error("Agent endpoint must use HTTPS.");
  const capabilities = [...new Set(input.capabilities.split(",").map(value => value.trim()).filter(Boolean))];
  if (capabilities.length > 32 || capabilities.some(value => value.length > 64)) throw new Error("Use at most 32 capabilities of 64 characters each.");
  return {
    protocol: "first/agent/1" as const,
    name,
    description: input.description.trim(),
    version: input.version.trim(),
    endpoint: endpoint.toString(),
    capabilities,
  };
}
