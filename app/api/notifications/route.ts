import { NextResponse } from "next/server";
import { listNotifications, markNotificationsRead } from "@/lib/backend";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const account = await currentAccount();
  if (!account || account.role !== "company" || !account.companySlug) {
    return NextResponse.json({ notifications: [] });
  }
  return NextResponse.json({ notifications: listNotifications(account.companySlug) });
}

// Mark all as read.
export async function POST() {
  const account = await currentAccount();
  if (account?.role === "company" && account.companySlug) {
    markNotificationsRead(account.companySlug);
  }
  return NextResponse.json({ ok: true });
}
