import { NextResponse } from "next/server";
import { logIn } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { ok: false, error: "email and password are required" },
      { status: 400 },
    );
  }
  const result = logIn(body.email, body.password);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, account: result.account });
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
