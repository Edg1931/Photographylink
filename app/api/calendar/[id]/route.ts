import { listJobs } from "@/lib/store";
import { getCompany } from "@/lib/backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Returns an .ics file for a job so it drops straight onto Google/Apple/Outlook
// calendars — the simple bridge to "it's on her calendar and mine".
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const jobs = await listJobs();
  const job = jobs.find((j) => j.id === params.id);
  if (!job) return new Response("Not found", { status: 404 });

  const company = await getCompany(job.companySlug);
  const startIso = job.date || "2026-07-29T10:00:00";
  // Interpret the stored wall-clock time as-is (floating), independent of server TZ.
  const start = new Date(`${startIso}Z`);
  const end = new Date(start.getTime() + (job.durationHours || 2) * 3600 * 1000);

  const fmt = (d: Date) =>
    [
      d.getUTCFullYear(),
      pad(d.getUTCMonth() + 1),
      pad(d.getUTCDate()),
      "T",
      pad(d.getUTCHours()),
      pad(d.getUTCMinutes()),
      "00",
    ].join("");

  const esc = (s: string) =>
    (s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  const summary = `${job.title}${company ? ` · ${company.name}` : ""}`;
  const desc = [
    job.deliverables,
    job.claimedByName ? `Photographer: ${job.claimedByName}` : "",
    `Payout: $${job.payout}`,
  ]
    .filter(Boolean)
    .join(" — ");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Callsheet//Shoot//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${job.id}@callsheet`,
    `DTSTAMP:${fmt(start)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(desc)}`,
    `LOCATION:${esc(`${job.address}, ${job.neighborhood}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${job.id}.ics"`,
    },
  });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
