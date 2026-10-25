import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({
    app: "kuvoro-core-web",
    status: "ok",
    revision: process.env.KUVORO_REVISION ?? "unknown",
  }, {headers: {"Cache-Control": "no-store"}});
}
