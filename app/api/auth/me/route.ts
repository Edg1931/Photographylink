import { NextResponse } from "next/server";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const account = await currentAccount();
  return NextResponse.json({ account: account ?? null });
}
