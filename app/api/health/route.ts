import { NextResponse } from "next/server";
import { NETWORK } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "first-onchain",
      network: NETWORK,
      revision: process.env.K_REVISION ?? process.env.CF_VERSION_ID ?? process.env.GIT_SHA ?? "development",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
