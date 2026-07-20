import { NextResponse } from "next/server";
import { createInquiry, listInquiries, NewInquiry } from "@/lib/backend";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Create an inquiry from a company micro-site (public).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<NewInquiry>;
  if (!body.companySlug || !body.name || !body.email) {
    return NextResponse.json(
      { ok: false, error: "companySlug, name and email are required" },
      { status: 400 },
    );
  }
  const inquiry = await createInquiry({
    companySlug: body.companySlug,
    name: body.name,
    email: body.email,
    projectType: body.projectType ?? "General",
    message: body.message ?? "",
  });
  return NextResponse.json({ ok: true, inquiry }, { status: 201 });
}

// List inquiries. Company accounts see their own; the platform inbox (admin
// view) is gated behind ?scope=all for the demo.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const account = await currentAccount();

  if (scope === "all") {
    return NextResponse.json({ inquiries: await listInquiries() });
  }
  if (account?.role === "company" && account.companySlug) {
    return NextResponse.json({
      inquiries: await listInquiries(account.companySlug),
    });
  }
  return NextResponse.json({ inquiries: [] });
}
