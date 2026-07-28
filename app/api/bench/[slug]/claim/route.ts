import { NextResponse } from "next/server";
import { getMember } from "@/lib/backend";
import { claimJob } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public endpoint used by the member's personal claim link. No login — the
// memberId in the link is the credential (kept simple for non-technical users).
export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const body = (await req.json().catch(() => ({}))) as {
    memberId?: string;
    jobId?: string;
  };
  if (!body.memberId || !body.jobId) {
    return NextResponse.json(
      { ok: false, error: "memberId and jobId are required" },
      { status: 400 },
    );
  }
  const member = await getMember(params.slug, body.memberId);
  if (!member) {
    return NextResponse.json(
      { ok: false, error: "That member is not on this bench" },
      { status: 404 },
    );
  }
  const result = await claimJob(body.jobId, member.id, member.name);
  if (result.ok) return NextResponse.json({ ok: true, job: result.job });
  const status = result.reason === "not_found" ? 404 : 409;
  return NextResponse.json({ ok: false, reason: result.reason }, { status });
}
