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
      commit: process.env.BUILD_COMMIT ?? "development",
      revision: process.env.K_REVISION ?? process.env.BUILD_COMMIT ?? "development",
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
