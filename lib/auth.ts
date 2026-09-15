import { SignJWT, jwtVerify } from "jose";

const ISSUER = "first-onchain";
const AUDIENCE = "first-onchain-web";

function secret() {
  const value = process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "development-only-secret-change-in-production" : "");
  if (value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}

export const authMessage = (address: string, nonce: string, domain = "localhost:3000") => `${domain} wants you to sign in with your Solana account:\n${address}\n\nSign in to First. This request will not trigger a blockchain transaction or cost any gas.\n\nURI: ${domain}\nNonce: ${nonce}`;

export async function issueSession(address: string) {
  return new SignJWT({ address }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuer(ISSUER).setAudience(AUDIENCE).setIssuedAt().setExpirationTime("7d").sign(secret());
}

export async function readSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] });
    return typeof payload.address === "string" ? payload.address : null;
  } catch {
    return null;
  }
}
