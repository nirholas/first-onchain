import { NextRequest, NextResponse } from "next/server";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { z } from "zod";
import { authMessage, issueSession } from "@/lib/auth";

const bodySchema = z.object({ address: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/), signature: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/) });
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "Origin mismatch" }, { status: 403 });
    const body = bodySchema.parse(await request.json()); const nonce = request.cookies.get("first_nonce")?.value;
    if (!nonce) return NextResponse.json({ error: "Nonce expired" }, { status: 401 });
    const publicKey = bs58.decode(body.address); const message = new TextEncoder().encode(authMessage(body.address, nonce, request.nextUrl.host));
    const signature = bs58.decode(body.signature);
    if (publicKey.byteLength !== nacl.sign.publicKeyLength || signature.byteLength !== nacl.sign.signatureLength || !nacl.sign.detached.verify(message, signature, publicKey)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    const response = NextResponse.json({ address: body.address });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set("first_session", await issueSession(body.address), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800, priority: "high" });
    response.cookies.delete("first_nonce"); return response;
  } catch { return NextResponse.json({ error: "Invalid sign-in request" }, { status: 400 }); }
}
