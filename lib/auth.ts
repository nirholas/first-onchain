import { SignJWT, jwtVerify } from "jose";

const ISSUER = "first-onchain";
const AUDIENCE = "first-onchain-web";

function secret() {
  const value = process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "development-only-secret-change-in-production" : "");
  if (value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}

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
