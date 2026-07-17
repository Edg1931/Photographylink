import { NextResponse } from "next/server";
import { claimJob } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    photographerSlug?: string;
  };
  const photographerSlug = body.photographerSlug;
  if (!photographerSlug) {
    return NextResponse.json(
      { error: "photographerSlug is required" },
      { status: 400 },
    );
  }

  const result = await claimJob(params.id, photographerSlug);

  if (result.ok) {
    return NextResponse.json({ ok: true, job: result.job });
  }
  const status = result.reason === "not_found" ? 404 : 409;
  return NextResponse.json(
    { ok: false, reason: result.reason, job: result.job },
    { status },
  );
}
