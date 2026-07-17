import { NextResponse } from "next/server";
import { listJobs, postJob, NewJobInput } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ jobs: listJobs() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<NewJobInput>;
  if (!body.companySlug || !body.title) {
    return NextResponse.json(
      { error: "companySlug and title are required" },
      { status: 400 },
    );
  }
  const job = await postJob({
    companySlug: body.companySlug,
    title: body.title,
    type: body.type ?? "Real Estate",
    neighborhood: body.neighborhood ?? "Austin",
    payout: Number(body.payout) || 200,
    durationHours: Number(body.durationHours) || 2,
    shootAt: body.shootAt ?? "Flexible",
    deliverables: body.deliverables ?? "Standard listing gallery",
    equipment: body.equipment ?? "byo",
    urgency: body.urgency ?? "standard",
    assignedToSlug: body.assignedToSlug || undefined,
  });
  return NextResponse.json({ job }, { status: 201 });
}
