import { NextResponse } from "next/server";
import { listClaimLog } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ log: listClaimLog() });
}
