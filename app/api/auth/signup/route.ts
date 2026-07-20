import { NextResponse } from "next/server";
import { signUp, SignUpInput } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<SignUpInput>;
  if (!body.email || !body.password || !body.role) {
    return NextResponse.json(
      { ok: false, error: "email, password and role are required" },
      { status: 400 },
    );
  }
  const result = await signUp({
    email: body.email,
    password: body.password,
    role: body.role,
    displayName: body.displayName ?? "",
    companyName: body.companyName,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }
  const res = NextResponse.json({
    ok: true,
    account: result.account,
    redirect:
      result.account.role === "company" ? "/dashboard" : "/dashboard",
  });
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
