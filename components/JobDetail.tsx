"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Job, Photographer, Company } from "@/lib/data";
import { Container, Badge, Button, Avatar } from "@/components/ui";
import { clsx } from "@/lib/clsx";

const statusTone = {
  open: "amber",
  claimed: "blue",
  scheduled: "blue",
  delivered: "green",
} as const;

export function JobDetail({
  id,
  photographers,
  companies,
}: {
  id: string;
  photographers: Photographer[];
  companies: Company[];
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [actingAs, setActingAs] = useState(photographers[0]?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ msg: string; tone: "ok" | "err" } | null>(
    null,
  );

  const byId = (slug?: string) =>
    slug ? photographers.find((p) => p.slug === slug) : undefined;
  const companyById = (slug: string) => companies.find((c) => c.slug === slug);

  const refresh = useCallback(async () => {
    const data = await fetch("/api/jobs", { cache: "no-store" }).then((r) =>
      r.json(),
    );
    setJob(data.jobs.find((j: Job) => j.id === id) ?? null);
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const act = useCallback(
    async (path: string, body: object, okMsg: string) => {
      setBusy(true);
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok !== false) setNote({ msg: okMsg, tone: "ok" });
        else
          setNote({
            msg:
              data.reason === "reserved"
                ? "Reserved for another photographer"
                : data.reason === "already_claimed"
                  ? "Already claimed by someone else"
                  : "Action failed",
            tone: "err",
          });
      } finally {
        setBusy(false);
        refresh();
      }
    },
    [refresh],
  );

  if (loaded && !job) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="font-display text-5xl font-semibold text-amber-brand">
          404
        </p>
        <h1 className="mt-3 font-display text-xl font-semibold">
          That job isn&apos;t in the queue anymore.
        </h1>
        <p className="mt-2 text-bone/55">
          It may have been claimed, delivered, or reset.
        </p>
        <Button href="/jobs" className="mt-6">
          Back to the queue
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="py-16">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-3xl bg-ink-900" />
      </Container>
    );
  }

  const company = companyById(job.companySlug);
  const claimer = byId(job.claimedBySlug);
  const offered = byId(job.assignedToSlug);
  const forMe = job.assignedToSlug === actingAs;

  return (
    <Container className="py-10 lg:py-14">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm text-bone/55 hover:text-amber-soft"
      >
        ← Back to the queue
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main */}
        <div className="overflow-hidden rounded-3xl border border-ink-700 bg-ink-900">
          <div
            className="h-2 w-full"
            style={{ background: company?.accent ?? "#e8a94b" }}
          />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone[job.status]} className="capitalize">
                {job.status}
              </Badge>
              {job.status === "open" && job.assignedToSlug && (
                <Badge tone="blue">Direct offer</Badge>
              )}
              {job.urgency === "rush" && <Badge tone="red">Rush</Badge>}
              {job.urgency === "flexible" && (
                <Badge tone="green">Flexible</Badge>
              )}
              <span className="rounded bg-ink-800 px-2 py-1 text-xs text-bone/70">
                {job.type}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {job.title}
            </h1>

            <Link
              href={`/companies/${job.companySlug}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-bone/60 hover:text-amber-soft"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-ink-950"
                style={{ background: company?.accent }}
              >
                {company?.logoMark}
              </span>
              {company?.name}
            </Link>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Payout" value={`$${job.payout}`} accent />
              <Stat label="When" value={job.shootAt} />
              <Stat label="Length" value={`${job.durationHours} hr`} />
              <Stat
                label="Neighborhood"
                value={job.neighborhood}
              />
            </div>

            <div className="mt-6 space-y-4 border-t border-ink-700 pt-6">
              <Detail label="Deliverables">{job.deliverables}</Detail>
              <Detail label="Location">{job.address}, {job.neighborhood}</Detail>
              <Detail label="Equipment">
                {job.equipment === "byo"
                  ? "Bring your own kit"
                  : job.equipment === "provided"
                    ? "Equipment provided"
                    : "Gear provided or bring your own"}
              </Detail>
              {claimer && (
                <Detail label={job.status === "delivered" ? "Delivered by" : "Claimed by"}>
                  <Link
                    href={`/photographers/${claimer.slug}`}
                    className="inline-flex items-center gap-2 text-bone hover:text-amber-soft"
                  >
                    <Avatar src={claimer.avatar} alt={claimer.name} size={24} />
                    {claimer.name}
                  </Link>
                </Detail>
              )}
            </div>
          </div>
        </div>

        {/* Action rail */}
        <aside className="space-y-4">
          {/* Earnings — what the photographer takes home */}
          <div className="overflow-hidden rounded-2xl border border-amber-brand/25 bg-gradient-to-br from-ink-800 to-ink-900 p-5">
            <p className="text-xs uppercase tracking-widest text-bone/50">
              You earn
            </p>
            <p className="font-display text-4xl font-semibold text-amber-soft">
              ${job.payout}
            </p>
            <div className="mt-3 space-y-1.5 border-t border-ink-700 pt-3 text-sm">
              <Row label="Job payout" value={`$${job.payout}`} />
              <Row label="Platform fee" value="$0" muted />
              <Row label="You keep" value={`$${job.payout}`} strong />
            </div>
            <p className="mt-2 text-xs text-bone/40">
              Photographers keep 100%. Logged automatically for your taxes.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
            <h2 className="text-sm font-semibold text-bone">Take this job</h2>
            <label className="mt-3 block text-xs text-bone/50">
              Acting as
              <div className="mt-1 flex items-center gap-2 rounded-full bg-ink-800 py-1 pl-1 pr-3">
                <Avatar src={byId(actingAs)?.avatar ?? ""} alt="" size={26} />
                <select
                  value={actingAs}
                  onChange={(e) => setActingAs(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-bone focus:outline-none"
                >
                  {photographers.map((p) => (
                    <option key={p.slug} value={p.slug} className="bg-ink-800">
                      {p.name} · ★{p.rating}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="mt-4">
              {job.status !== "open" ? (
                <p className="rounded-xl bg-ink-950 p-3 text-center text-sm text-bone/50">
                  This job is {job.status}.
                </p>
              ) : job.assignedToSlug && !forMe ? (
                <p className="flex items-center gap-2 rounded-xl bg-ink-950 p-3 text-sm text-bone/60">
                  {offered && <Avatar src={offered.avatar} alt="" size={22} />}
                  Reserved for {offered?.name} — only they can accept.
                </p>
              ) : forMe ? (
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200">
                    Offered directly to you
                  </div>
                  <Button
                    disabled={busy}
                    onClick={() =>
                      act(
                        `/api/jobs/${job.id}/claim`,
                        { photographerSlug: actingAs },
                        "Offer accepted ✓",
                      )
                    }
                  >
                    Accept offer →
                  </Button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      act(
                        `/api/jobs/${job.id}/decline`,
                        { photographerSlug: actingAs },
                        "Declined — released to the bench",
                      )
                    }
                    className="rounded-full px-3 py-2 text-sm text-bone/55 ring-1 ring-inset ring-ink-600 hover:text-rose-200 hover:ring-rose-500/40 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={() =>
                    act(
                      `/api/jobs/${job.id}/claim`,
                      { photographerSlug: actingAs },
                      "Job claimed ✓",
                    )
                  }
                >
                  {busy ? "Claiming…" : "Claim this job →"}
                </Button>
              )}
            </div>

            {note && (
              <p
                className={clsx(
                  "mt-3 rounded-lg px-3 py-2 text-xs",
                  note.tone === "ok"
                    ? "bg-emerald-500/10 text-emerald-200"
                    : "bg-rose-500/10 text-rose-200",
                )}
              >
                {note.msg}
              </p>
            )}
          </div>

          {company && (
            <Link
              href={`/companies/${company.slug}`}
              className="block rounded-2xl border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-amber-brand/40"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-bone/40">
                Posted by
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-ink-950"
                  style={{ background: company.accent }}
                >
                  {company.logoMark}
                </span>
                <div>
                  <p className="font-semibold text-bone">{company.name}</p>
                  <p className="text-sm text-bone/55">{company.tagline}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-amber-soft">
                View company micro-site →
              </p>
            </Link>
          )}
        </aside>
      </div>
    </Container>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-bone/40" : "text-bone/60"}>{label}</span>
      <span
        className={clsx(
          strong ? "font-semibold text-bone" : "text-bone/80",
          muted && "text-bone/40",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-950 p-4">
      <p className="text-[11px] uppercase tracking-wide text-bone/40">{label}</p>
      <p
        className={clsx(
          "mt-1 font-display text-xl font-semibold",
          accent ? "text-amber-soft" : "text-bone",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-bone/40">
        {label}
      </span>
      <span className="text-sm text-bone/80">{children}</span>
    </div>
  );
}
