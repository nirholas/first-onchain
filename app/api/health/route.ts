import { NextResponse } from "next/server";
import { NETWORK } from "@/lib/constants";
import { sessionSecretReady } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export function GET() {
  const ready = sessionSecretReady();
  return NextResponse.json(
    {
      status: ready ? "ok" : "misconfigured",
      service: "first-onchain",
      network: NETWORK,
      revision: process.env.K_REVISION ?? process.env.CF_VERSION_ID ?? process.env.GIT_SHA ?? "development",
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
