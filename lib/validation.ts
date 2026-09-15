const U64_MAX = 18_446_744_073_709_551_615n;

export function tokenAmount(supply: string, decimalsValue: string) {
  if (!/^\d+$/.test(supply)) throw new Error("Supply must be a whole number.");
  if (supply.length > 20) throw new Error("Supply exceeds the maximum Token-2022 amount.");
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
  if (trimmed.length > 2_048) throw new Error("Metadata URI must be 2,048 characters or fewer.");
  try {
    const url = new URL(trimmed);
    if (!["https:", "ipfs:", "ar:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
    return url.toString();
  } catch {
    throw new Error("Metadata URI must use https://, ipfs://, or ar://.");
  }
}

export function agentManifest(input: { name: string; version: string; endpoint: string; description: string; capabilities: string }) {
  const name = input.name.trim();
  if (!name || name.length > 64) throw new Error("Agent name must contain 1–64 characters.");
  const version = input.version.trim();
  if (version.length > 64 || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+(?:[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.test(version)) throw new Error("Version must be semantic, for example 1.0.0.");
  let endpoint: URL;
  try { endpoint = new URL(input.endpoint.trim()); } catch { throw new Error("Agent endpoint must be a valid HTTPS URL."); }
  if (endpoint.protocol !== "https:" || !endpoint.hostname || endpoint.username || endpoint.password || endpoint.toString().length > 2_048) throw new Error("Agent endpoint must use HTTPS without embedded credentials.");
  const description = input.description.trim();
  if (description.length > 1_024) throw new Error("Agent description must be 1,024 characters or fewer.");
  const capabilities = [...new Set(input.capabilities.split(",").map(value => value.trim()).filter(Boolean))];
  if (capabilities.length > 32 || capabilities.some(value => value.length > 64)) throw new Error("Use at most 32 capabilities of 64 characters each.");
  return {
    protocol: "first/agent/1" as const,
    name,
    description,
    version,
    endpoint: endpoint.toString(),
    capabilities,
  };
}
