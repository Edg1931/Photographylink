import { NextResponse } from "next/server";
import { updateCompany, CompanyPatch } from "@/lib/backend";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const account = currentAccount();
  if (!account || account.role !== "company" || !account.companySlug) {
    return NextResponse.json(
      { ok: false, error: "Not signed in as a company" },
      { status: 401 },
    );
  }
  const patch = (await req.json().catch(() => ({}))) as CompanyPatch;
  const company = updateCompany(account.companySlug, patch);
  if (!company) {
    return NextResponse.json(
      { ok: false, error: "Company not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, company });
}
