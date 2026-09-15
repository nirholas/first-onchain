const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
let cancelled = false;

function base58(bytes) {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8;
      digits[i] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let output = "";
  for (let i = 0; bytes[i] === 0 && i < bytes.length - 1; i++) output += "1";
  for (let i = digits.length - 1; i >= 0; i--) output += ALPHABET[digits[i]];
  return output;
}

async function generate() {
  const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const [publicBytes, privateDer] = await Promise.all([
    crypto.subtle.exportKey("raw", pair.publicKey),
    crypto.subtle.exportKey("pkcs8", pair.privateKey)
  ]);
  const publicKey = new Uint8Array(publicBytes);
  const seed = new Uint8Array(privateDer).slice(-32);
  const secretKey = new Uint8Array(64);
  secretKey.set(seed);
  secretKey.set(publicKey, 32);
  return { address: base58(publicKey), secretKey: Array.from(secretKey) };
}

self.onmessage = async event => {
  if (event.data?.type === "cancel") { cancelled = true; return; }
  if (event.data?.type !== "start") return;
  cancelled = false;
  const { prefix, suffix, caseSensitive } = event.data;
  const targetPrefix = caseSensitive ? prefix : prefix.toLowerCase();
  const targetSuffix = caseSensitive ? suffix : suffix.toLowerCase();
  let attempts = 0;
  try {
    while (!cancelled) {
      const candidate = await generate();
      attempts++;
      const address = caseSensitive ? candidate.address : candidate.address.toLowerCase();
      if (address.startsWith(targetPrefix) && address.endsWith(targetSuffix)) {
        self.postMessage({ type: "found", attempts, ...candidate });
        return;
      }
      if (attempts % 100 === 0) self.postMessage({ type: "progress", attempts });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Vanity worker failed" });
  }
};
