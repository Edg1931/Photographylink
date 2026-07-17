import { NextResponse } from "next/server";
import { advanceJob } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const result = await advanceJob(params.id);
  if (result.ok) return NextResponse.json({ ok: true, job: result.job });
  return NextResponse.json({ ok: false, reason: result.reason }, { status: 404 });
}
