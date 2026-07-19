"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Job, Photographer, Company, Specialty } from "@/lib/data";
import { Badge, Button } from "@/components/ui";
import { clsx } from "@/lib/clsx";

interface ClaimEvent {
  at: number;
  jobId: string;
  photographerSlug: string;
  outcome: "won" | "lost";
  reason?: string;
}

interface Props {
  photographers: Photographer[];
  companies: Company[];
  specialties: Specialty[];
}

const statusTone = {
  open: "amber",
  claimed: "blue",
  scheduled: "blue",
  delivered: "green",
} as const;

export function JobQueueBoard({ photographers, companies, specialties }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [log, setLog] = useState<ClaimEvent[]>([]);
  const [actingAs, setActingAs] = useState(photographers[0]?.slug ?? "");
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const byId = (slug: string) => photographers.find((p) => p.slug === slug);
  const companyById = (slug: string) =>
    companies.find((c) => c.slug === slug);

  const refresh = useCallback(async () => {
    const [j, l] = await Promise.all([
      fetch("/api/jobs", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/claim-log", { cache: "no-store" }).then((r) => r.json()),
    ]);
    setJobs(j.jobs);
    setLog(l.log);
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const flash = useCallback((msg: string, tone: "ok" | "err") => {
    setToast({ msg, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const claim = useCallback(
    async (jobId: string, photographerSlug: string) => {
      setPending((p) => ({ ...p, [jobId]: true }));
      try {
        const res = await fetch(`/api/jobs/${jobId}/claim`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ photographerSlug }),
        });
        const data = await res.json();
        if (data.ok) {
          flash(`${byId(photographerSlug)?.name} claimed the job ✓`, "ok");
        } else if (data.reason === "already_claimed") {
          flash("Too late — another shooter already claimed it", "err");
        } else if (data.reason === "reserved") {
          flash("That job is a direct offer reserved for another photographer", "err");
        } else {
          flash("Could not claim that job", "err");
        }
      } finally {
        setPending((p) => ({ ...p, [jobId]: false }));
        refresh();
      }
    },
    [byId, flash, refresh],
  );

  // Fire N concurrent claims at the same job from different photographers.
  const simulateRace = useCallback(
    async (jobId: string) => {
      setPending((p) => ({ ...p, [jobId]: true }));
      const racers = photographers.slice(0, 5).map((p) => p.slug);
      const results = await Promise.all(
        racers.map((slug) =>
          fetch(`/api/jobs/${jobId}/claim`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ photographerSlug: slug }),
          })
            .then((r) => r.json())
            .then((d) => ({ slug, ok: !!d.ok })),
        ),
      );
      const winners = results.filter((r) => r.ok);
      const winner = winners[0] ? byId(winners[0].slug)?.name : "—";
      flash(
        `${racers.length} shooters raced · exactly ${winners.length} won (${winner})`,
        winners.length === 1 ? "ok" : "err",
      );
      setPending((p) => ({ ...p, [jobId]: false }));
      refresh();
    },
    [photographers, byId, flash, refresh],
  );

  const advance = useCallback(
    async (jobId: string) => {
      await fetch(`/api/jobs/${jobId}/advance`, { method: "POST" });
      refresh();
    },
    [refresh],
  );

  const assign = useCallback(
    async (jobId: string, photographerSlug: string) => {
      setPending((p) => ({ ...p, [jobId]: true }));
      try {
        const res = await fetch(`/api/jobs/${jobId}/assign`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ photographerSlug }),
        });
        if (res.ok) {
          flash(`Offered directly to ${byId(photographerSlug)?.name}`, "ok");
        } else {
          flash("Could not offer that job", "err");
        }
      } finally {
        setPending((p) => ({ ...p, [jobId]: false }));
        refresh();
      }
    },
    [byId, flash, refresh],
  );

  const decline = useCallback(
    async (jobId: string, photographerSlug: string) => {
      setPending((p) => ({ ...p, [jobId]: true }));
      try {
        await fetch(`/api/jobs/${jobId}/decline`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ photographerSlug }),
        });
        flash("Offer declined — released back to the bench", "ok");
      } finally {
        setPending((p) => ({ ...p, [jobId]: false }));
        refresh();
      }
    },
    [flash, refresh],
  );

  const reset = useCallback(async () => {
    await fetch("/api/reset", { method: "POST" });
    flash("Demo reset to seed data", "ok");
    refresh();
  }, [flash, refresh]);

  const columns = [
    { key: "open", title: "Open — claimable", match: (s: string) => s === "open", hint: "First qualified pro to claim wins" },
    { key: "progress", title: "In progress", match: (s: string) => s === "claimed" || s === "scheduled", hint: "Claimed & scheduled" },
    { key: "delivered", title: "Delivered", match: (s: string) => s === "delivered", hint: "Shot & delivered" },
  ];

  const openJobs = jobs.filter((j) => j.status === "open");
  const inProgress = jobs.filter(
    (j) => j.status === "claimed" || j.status === "scheduled",
  );
  const delivered = jobs.filter((j) => j.status === "delivered");
  const openPayout = openJobs.reduce((sum, j) => sum + j.payout, 0);

  const stats = [
    { label: "Open to claim", value: String(openJobs.length), accent: true },
    { label: "Payout available", value: `$${openPayout.toLocaleString()}` },
    { label: "In progress", value: String(inProgress.length) },
    { label: "Delivered", value: String(delivered.length) },
  ];

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-ink-700 bg-ink-900 px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-wide text-bone/40">
              {s.label}
            </p>
            <p
              className={clsx(
                "mt-0.5 font-display text-2xl font-semibold",
                s.accent ? "text-amber-soft" : "text-bone",
              )}
            >
              {loaded ? s.value : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-3 text-sm text-bone/70">
          <span className="text-bone/50">Acting as</span>
          <div className="flex items-center gap-2 rounded-full bg-ink-800 py-1 pl-1 pr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={byId(actingAs)?.avatar}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
            <select
              value={actingAs}
              onChange={(e) => setActingAs(e.target.value)}
              className="bg-transparent text-sm font-medium text-bone focus:outline-none"
            >
              {photographers.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-ink-800">
                  {p.name} · ★{p.rating}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="flex items-center gap-2">
          <NewJobDialog
            companies={companies}
            specialties={specialties}
            photographers={photographers}
            onCreated={(msg) => {
              flash(msg, "ok");
              refresh();
            }}
          />
          <Button variant="ghost" className="text-sm" onClick={reset}>
            Reset demo
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {columns.map((col) => {
          const list = jobs.filter((j) => col.match(j.status));
          return (
            <div key={col.key}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-bone">{col.title}</h2>
                  <p className="text-xs text-bone/45">{col.hint}</p>
                </div>
                <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-medium text-bone/60">
                  {list.length}
                </span>
              </div>

              <div className="space-y-4">
                {!loaded ? (
                  <SkeletonCard />
                ) : list.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-ink-700 p-6 text-center text-sm text-bone/40">
                    Nothing here right now.
                  </p>
                ) : (
                  list.map((job) => {
                    const company = companyById(job.companySlug);
                    const claimer = job.claimedBySlug
                      ? byId(job.claimedBySlug)
                      : undefined;
                    const isPending = pending[job.id];
                    return (
                      <div
                        key={job.id}
                        className={clsx(
                          "reveal relative overflow-hidden rounded-2xl border bg-ink-900 p-5 transition-colors",
                          job.status === "open"
                            ? "border-ink-700 hover:border-amber-brand/40"
                            : "border-ink-700",
                        )}
                      >
                        {job.status === "open" && (
                          <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-brand to-transparent" />
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-ink-950"
                              style={{ background: company?.accent }}
                            >
                              {company?.logoMark}
                            </span>
                            <div>
                              <Link
                                href={`/companies/${job.companySlug}`}
                                className="text-xs text-bone/55 hover:text-amber-soft"
                              >
                                {company?.name}
                              </Link>
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-sm font-semibold leading-tight text-bone hover:text-amber-soft"
                              >
                                {job.title}
                              </Link>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge
                              tone={statusTone[job.status]}
                              className="capitalize"
                            >
                              {job.status}
                            </Badge>
                            {job.status === "open" && job.assignedToSlug && (
                              <Badge tone="blue">Direct offer</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <Meta label="Payout" value={`$${job.payout}`} accent />
                          <Meta label="When" value={job.shootAt} />
                          <Meta label="Where" value={job.neighborhood} />
                        </div>
                        <p className="mt-3 text-xs text-bone/55">
                          <span className="rounded bg-ink-800 px-1.5 py-0.5 text-bone/70">
                            {job.type}
                          </span>{" "}
                          {job.deliverables}
                        </p>

                        <div className="mt-4 border-t border-ink-700 pt-3">
                          {job.status === "open" ? (
                            <OpenJobActions
                              job={job}
                              actingAs={actingAs}
                              photographers={photographers}
                              isPending={!!isPending}
                              onClaim={() => claim(job.id, actingAs)}
                              onRace={() => simulateRace(job.id)}
                              onAssign={(slug) => assign(job.id, slug)}
                              onDecline={(slug) => decline(job.id, slug)}
                            />
                          ) : claimer ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={claimer.avatar}
                                  alt=""
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                                <span className="text-xs text-bone/60">
                                  {job.status === "delivered"
                                    ? "Delivered by "
                                    : "Claimed by "}
                                  <Link
                                    href={`/photographers/${claimer.slug}`}
                                    className="font-medium text-bone hover:text-amber-soft"
                                  >
                                    {claimer.name}
                                  </Link>
                                </span>
                              </div>
                              {job.status !== "delivered" && (
                                <button
                                  onClick={() => advance(job.id)}
                                  className="rounded-full bg-ink-800 px-2.5 py-1 text-[11px] font-medium text-bone/60 hover:text-bone"
                                >
                                  {job.status === "claimed"
                                    ? "Mark scheduled"
                                    : "Mark delivered"}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity log */}
      <div className="mt-10 rounded-2xl border border-ink-700 bg-ink-900 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-bone">
            <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
            Claim activity
          </h3>
          <span className="text-xs text-bone/40">
            Every attempt — wins and losses — as the server saw them
          </span>
        </div>
        <div className="mt-4 space-y-1.5">
          {log.length === 0 ? (
            <p className="text-sm text-bone/40">
              No claims yet. Claim a job or run a race simulation above.
            </p>
          ) : (
            log.map((e, i) => {
              const p = byId(e.photographerSlug);
              const declined = e.reason === "declined";
              const label = e.outcome === "won" ? "won" : declined ? "declined" : "lost";
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm odd:bg-ink-950/40"
                >
                  <span
                    className={clsx(
                      "w-14 shrink-0 text-[11px] font-semibold uppercase",
                      e.outcome === "won"
                        ? "text-emerald-400"
                        : declined
                          ? "text-sky-300"
                          : "text-bone/35",
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-bone/70">
                    {p?.name ?? e.photographerSlug}
                  </span>
                  <span className="text-bone/35">
                    {e.outcome === "won"
                      ? `claimed ${e.jobId}`
                      : declined
                        ? `released ${e.jobId} back to the bench`
                        : `missed ${e.jobId}${e.reason ? ` (${e.reason})` : ""}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-2xl ring-1 ring-inset backdrop-blur",
            toast.tone === "ok"
              ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
              : "bg-rose-500/15 text-rose-200 ring-rose-500/30",
          )}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function OpenJobActions({
  job,
  actingAs,
  photographers,
  isPending,
  onClaim,
  onRace,
  onAssign,
  onDecline,
}: {
  job: Job;
  actingAs: string;
  photographers: Photographer[];
  isPending: boolean;
  onClaim: () => void;
  onRace: () => void;
  onAssign: (slug: string) => void;
  onDecline: (slug: string) => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [pick, setPick] = useState(photographers[0]?.slug ?? "");
  const byId = (slug: string) => photographers.find((p) => p.slug === slug);

  // --- Direct offer to a specific photographer ---
  if (job.assignedToSlug) {
    const offered = byId(job.assignedToSlug);
    const forMe = job.assignedToSlug === actingAs;
    if (forMe) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 px-2.5 py-1.5 text-xs text-sky-200">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-sky-400" />
            Offered directly to you
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 py-2" disabled={isPending} onClick={onClaim}>
              {isPending ? "…" : "Accept offer →"}
            </Button>
            <button
              disabled={isPending}
              onClick={() => onDecline(actingAs)}
              className="rounded-full px-3 py-2 text-sm font-medium text-bone/55 ring-1 ring-inset ring-ink-600 hover:text-rose-200 hover:ring-rose-500/40 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-bone/55">
        {offered && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offered.avatar}
            alt=""
            className="h-6 w-6 rounded-full object-cover opacity-80"
          />
        )}
        <span>
          Reserved for{" "}
          <span className="font-medium text-bone/80">{offered?.name}</span> —
          only they can accept
        </span>
      </div>
    );
  }

  // --- Open to the whole bench ---
  return (
    <div className="flex flex-col gap-2">
      <Button className="w-full py-2" disabled={isPending} onClick={onClaim}>
        {isPending
          ? "Claiming…"
          : `Claim as ${byId(actingAs)?.name?.split(" ")[0]} →`}
      </Button>

      {assignOpen ? (
        <div className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-950 p-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs text-bone focus:outline-none"
          >
            {photographers.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-ink-800">
                {p.name} · ★{p.rating}
              </option>
            ))}
          </select>
          <button
            disabled={isPending}
            onClick={() => {
              onAssign(pick);
              setAssignOpen(false);
            }}
            className="shrink-0 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/30 disabled:opacity-50"
          >
            Offer
          </button>
          <button
            onClick={() => setAssignOpen(false)}
            className="shrink-0 text-xs text-bone/40 hover:text-bone/70"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            disabled={isPending}
            onClick={onRace}
            className="text-xs font-medium text-bone/50 underline-offset-2 hover:text-amber-soft hover:underline disabled:opacity-50"
          >
            ⚡ Simulate 5 racing
          </button>
          <button
            onClick={() => setAssignOpen(true)}
            className="text-xs font-medium text-bone/50 hover:text-sky-300"
          >
            Assign to a shooter →
          </button>
        </div>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-bone/40">{label}</p>
      <p className={clsx("mt-0.5 font-medium", accent ? "text-amber-soft" : "text-bone/85")}>
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="h-9 w-2/3 rounded bg-ink-800" />
      <div className="mt-4 h-3 w-full rounded bg-ink-800" />
      <div className="mt-2 h-3 w-1/2 rounded bg-ink-800" />
    </div>
  );
}

// ---- New job dialog ---------------------------------------------------------

function NewJobDialog({
  companies,
  specialties,
  photographers,
  onCreated,
}: {
  companies: Company[];
  specialties: Specialty[];
  photographers: Photographer[];
  onCreated: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    companySlug: companies[0]?.slug ?? "",
    title: "",
    type: specialties[0] ?? "Real Estate",
    neighborhood: "",
    payout: 220,
    shootAt: "",
    deliverables: "",
    equipment: "byo",
    urgency: "standard",
    assignedToSlug: "",
  });

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const target = photographers.find((p) => p.slug === form.assignedToSlug);
        onCreated(
          target
            ? `Posted as a direct offer to ${target.name}`
            : "Job posted to the queue — the bench is notified",
        );
        setOpen(false);
        setForm((f) => ({
          ...f,
          title: "",
          neighborhood: "",
          deliverables: "",
          assignedToSlug: "",
        }));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button className="py-2 text-sm" onClick={() => setOpen(true)}>
        + Post a job
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-ink-700 bg-ink-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold">
              Post a job to the queue
            </h3>
            <p className="mt-1 text-sm text-bone/55">
              It lands in the Open column and your whole bench can claim it.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Company" full>
                <select
                  value={form.companySlug}
                  onChange={(e) => setForm({ ...form, companySlug: e.target.value })}
                  className="input"
                >
                  {companies.map((c) => (
                    <option key={c.slug} value={c.slug} className="bg-ink-800">
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title" full>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="3-bed listing, full package"
                  className="input"
                />
              </Field>
              <Field label="Type">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as Specialty })
                  }
                  className="input"
                >
                  {specialties.map((s) => (
                    <option key={s} value={s} className="bg-ink-800">
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Neighborhood">
                <input
                  value={form.neighborhood}
                  onChange={(e) =>
                    setForm({ ...form, neighborhood: e.target.value })
                  }
                  placeholder="Cedar Park"
                  className="input"
                />
              </Field>
              <Field label="Payout ($)">
                <input
                  type="number"
                  value={form.payout}
                  onChange={(e) =>
                    setForm({ ...form, payout: Number(e.target.value) })
                  }
                  className="input"
                />
              </Field>
              <Field label="When">
                <input
                  value={form.shootAt}
                  onChange={(e) => setForm({ ...form, shootAt: e.target.value })}
                  placeholder="Tomorrow · 10:00 AM"
                  className="input"
                />
              </Field>
              <Field label="Deliverables" full>
                <input
                  value={form.deliverables}
                  onChange={(e) =>
                    setForm({ ...form, deliverables: e.target.value })
                  }
                  placeholder="30 HDR stills + 6 twilight"
                  className="input"
                />
              </Field>
              <Field label="Assign directly to (optional)" full>
                <select
                  value={form.assignedToSlug}
                  onChange={(e) =>
                    setForm({ ...form, assignedToSlug: e.target.value })
                  }
                  className="input"
                >
                  <option value="" className="bg-ink-800">
                    Open to the whole bench (queue)
                  </option>
                  {photographers.map((p) => (
                    <option key={p.slug} value={p.slug} className="bg-ink-800">
                      Offer directly to {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm text-bone/60 hover:text-bone"
              >
                Cancel
              </button>
              <Button onClick={submit} disabled={busy || !form.title}>
                {busy ? "Posting…" : "Post to queue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={clsx("block", full && "sm:col-span-2")}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
