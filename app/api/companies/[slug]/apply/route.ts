import { NextResponse } from "next/server";
import { applyToCompany, ApplicationInput } from "@/lib/backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public: a photographer applies to a company's bench. Creates a PENDING member
// the company must approve before the photographer can claim jobs.
export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const body = (await req.json().catch(() => ({}))) as Partial<ApplicationInput>;
  if (!body.name || !body.email) {
    return NextResponse.json(
      { ok: false, error: "name and email are required" },
      { status: 400 },
    );
  }
  const result = await applyToCompany(params.slug, {
    name: body.name,
    email: body.email,
    phone: body.phone,
    gear: body.gear,
    experience: body.experience,
    sampleUrl: body.sampleUrl,
    photographerSlug: body.photographerSlug,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }
  return NextResponse.json({ ok: true, member: result.member }, { status: 201 });
}
