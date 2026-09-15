import { NextResponse } from "next/server";
import { checkRateLimit, clientIdentifier } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const rate = checkRateLimit(`nonce:${clientIdentifier(request.headers)}`, 60, 5 * 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many nonce requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  const nonce = crypto.randomUUID();
  const response = NextResponse.json({ nonce });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set("first_nonce", nonce, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 300, priority: "high" });
  return response;
}
