import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { z } from "zod";
import { authMessage, issueSession } from "@/lib/auth";

const bodySchema = z.object({ address: z.string().min(32).max(50), signature: z.string().min(40).max(128) });
export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json()); const nonce = request.cookies.get("first_nonce")?.value;
    if (!nonce) return NextResponse.json({ error: "Nonce expired" }, { status: 401 });
    const key = new PublicKey(body.address); const message = new TextEncoder().encode(authMessage(body.address, nonce));
    if (!nacl.sign.detached.verify(message, bs58.decode(body.signature), key.toBytes())) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    const response = NextResponse.json({ address: body.address });
    response.cookies.set("first_session", await issueSession(body.address), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    response.cookies.delete("first_nonce"); return response;
  } catch { return NextResponse.json({ error: "Invalid sign-in request" }, { status: 400 }); }
}
