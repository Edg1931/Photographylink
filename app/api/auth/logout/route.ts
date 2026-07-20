import { NextResponse } from "next/server";
import { logOut } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) logOut(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
