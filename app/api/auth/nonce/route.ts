import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const nonce = crypto.randomUUID();
  const response = NextResponse.json({ nonce });
  response.cookies.set("first_nonce", nonce, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 300 });
  return response;
}
