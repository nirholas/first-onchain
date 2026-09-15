import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { const token=request.cookies.get("first_session")?.value; return NextResponse.json({ address: token ? await readSession(token) : null }); }
export async function DELETE() { const response=NextResponse.json({ok:true});response.cookies.delete("first_session");return response; }
