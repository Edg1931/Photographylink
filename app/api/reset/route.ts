import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await resetDemo();
  return NextResponse.json({ ok: true });
}
