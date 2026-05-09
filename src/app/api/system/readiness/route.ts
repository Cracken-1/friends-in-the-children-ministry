import { NextResponse } from "next/server";

import { getSystemReadiness } from "@/server/system/readiness";

export async function GET() {
  return NextResponse.json(getSystemReadiness(), {
    status: 200,
    headers: {
      "cache-control": "no-store"
    }
  });
}
