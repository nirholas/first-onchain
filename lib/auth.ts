import { SignJWT, jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || "development-only-secret-change-in-production");
export const authMessage = (address: string, nonce: string) => `first-onchain wants you to sign in with your Solana account:\n${address}\n\nSign in to First. This request will not trigger a blockchain transaction or cost any gas.\n\nNonce: ${nonce}`;
export async function issueSession(address: string) { return new SignJWT({ address }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret()); }
export async function readSession(token: string) { try { const { payload } = await jwtVerify(token, secret()); return typeof payload.address === "string" ? payload.address : null; } catch { return null; } }
