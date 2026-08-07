import { NextResponse } from "next/server";
import { listJobs, postJob, NewJobInput } from "@/lib/store";
import { textBenchAboutJob } from "@/lib/backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ jobs: await listJobs() });
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
    type: body.type ?? "Photos",
    neighborhood: body.neighborhood ?? "Austin",
    payout: Number(body.payout) || 200,
    durationHours: Number(body.durationHours) || 2,
    shootAt: body.shootAt ?? "Flexible",
    deliverables: body.deliverables ?? "Standard listing gallery",
    equipment: body.equipment ?? "byo",
    urgency: body.urgency ?? "standard",
    assignedToSlug: body.assignedToSlug || undefined,
    date: body.date || undefined,
    clientPrice: body.clientPrice ? Number(body.clientPrice) : undefined,
    clientId: body.clientId || undefined,
  });
  // Text the bench (no-op until Twilio is configured).
  void textBenchAboutJob(job.companySlug, job.title, job.assignedToSlug);
  return NextResponse.json({ job }, { status: 201 });
}
