import Link from "next/link";
import { Job, getCompany, getPhotographer } from "@/lib/data";
import { Badge, Button, Avatar } from "@/components/ui";

const statusTone = {
  open: "amber",
  claimed: "blue",
  scheduled: "blue",
  delivered: "green",
} as const;

const urgencyLabel = {
  rush: { tone: "red" as const, label: "Rush" },
  flexible: { tone: "green" as const, label: "Flexible" },
  standard: null,
};

export function JobCard({ job }: { job: Job }) {
  const company = getCompany(job.companySlug);
  const claimer = job.claimedBySlug
    ? getPhotographer(job.claimedBySlug)
    : undefined;
  const urgency = urgencyLabel[job.urgency];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-ink-600">
      {job.status === "open" && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-brand to-transparent" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-ink-950"
            style={{ background: company?.accent ?? "#e8a94b" }}
          >
            {company?.logoMark}
          </span>
          <div>
            <Link
              href={`/companies/${job.companySlug}`}
              className="text-xs font-medium text-bone/60 hover:text-amber-soft"
            >
              {company?.name}
            </Link>
            <Link
              href={`/jobs/${job.id}`}
              className="text-[15px] font-semibold leading-tight text-bone hover:text-amber-soft"
            >
              {job.title}
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={statusTone[job.status]} className="capitalize">
            {job.status}
          </Badge>
          {urgency && <Badge tone={urgency.tone}>{urgency.label}</Badge>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <Field label="Payout">
          <span className="font-semibold text-amber-soft">${job.payout}</span>
        </Field>
        <Field label="When">{job.shootAt}</Field>
        <Field label="Where">{job.neighborhood}</Field>
        <Field label="Length">{job.durationHours} hr</Field>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-bone/55">
        <span className="rounded bg-ink-800 px-2 py-1 text-bone/70">
          {job.type}
        </span>
        <span>{job.deliverables}</span>
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-4">
        {job.status === "open" ? (
          <>
            <span className="text-xs text-bone/45">
              Posted {job.postedAgo} ·{" "}
              <span className="text-bone/70">
                {job.equipment === "byo"
                  ? "Bring your kit"
                  : job.equipment === "provided"
                    ? "Gear provided"
                    : "Gear optional"}
              </span>
            </span>
            <Button href={`/jobs/${job.id}`} className="px-4 py-2">
              View job →
            </Button>
          </>
        ) : claimer ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={claimer.avatar} alt={claimer.name} size={28} />
              <span className="text-xs text-bone/60">
                {job.status === "delivered" ? "Delivered by" : "Claimed by"}{" "}
                <Link
                  href={`/photographers/${claimer.slug}`}
                  className="font-medium text-bone hover:text-amber-soft"
                >
                  {claimer.name}
                </Link>
              </span>
            </div>
            <span className="text-xs text-bone/40">{job.postedAgo}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-bone/40">
        {label}
      </p>
      <p className="mt-0.5 text-bone/85">{children}</p>
    </div>
  );
}
