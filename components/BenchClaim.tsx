"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Job } from "@/lib/data";
import { Container } from "@/components/ui";
import { PAYOUT_DAYS } from "@/lib/economics";
import { clsx } from "@/lib/clsx";

export function BenchClaim({
  companySlug,
  companyName,
  accent,
  logoMark,
  member,
}: {
  companySlug: string;
  companyName: string;
  accent: string;
  logoMark: string;
  member: { id: string; name: string; avatar: string };
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);

  const refresh = useCallback(async () => {
    const data = await fetch("/api/jobs", { cache: "no-store" }).then((r) => r.json());
    setJobs((data.jobs as Job[]).filter((j) => j.companySlug === companySlug));
    setLoaded(true);
  }, [companySlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const available = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.status === "open" &&
          (!j.assignedToSlug || j.assignedToSlug === member.id),
      ),
    [jobs, member.id],
  );
  const mine = useMemo(
    () =>
      jobs
        .filter((j) => j.claimedBySlug === member.id && j.status !== "delivered")
        .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1)),
    [jobs, member.id],
  );

  const claim = async (jobId: string) => {
    setBusy(jobId);
    try {
      const res = await fetch(`/api/bench/${companySlug}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memberId: member.id, jobId }),
      });
      const data = await res.json();
      if (data.ok) setToast({ msg: "You got it! Added to your shoots below.", tone: "ok" });
      else if (data.reason === "reserved")
        setToast({ msg: "That one was offered to someone else.", tone: "err" });
      else setToast({ msg: "Someone else claimed it first.", tone: "err" });
    } finally {
      setBusy(null);
      refresh();
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <Container className="max-w-2xl py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-ink-950"
          style={{ background: accent }}
        >
          {logoMark}
        </span>
        <div>
          <p className="text-sm text-bone/55">{companyName}</p>
          <h1 className="font-display text-2xl font-semibold">
            Hi {member.name.split(" ")[0]} 👋
          </h1>
        </div>
      </div>
      <p className="mt-3 text-bone/65">
        Here are shoots you can claim. Tap <strong className="text-bone">Claim</strong> and
        it&apos;s yours — then add it to your phone&apos;s calendar.
      </p>

      {/* Available */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-bone/45">
        Available now
      </h2>
      <div className="mt-3 space-y-3">
        {!loaded ? (
          <div className="h-24 animate-pulse rounded-2xl bg-ink-900" />
        ) : available.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 p-8 text-center text-bone/45">
            Nothing to claim right now. Check back when {companyName} broadcasts a shoot.
          </div>
        ) : (
          available.map((j) => (
            <div key={j.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-bone">{j.title}</h3>
                  <p className="mt-1 text-sm text-bone/60">
                    {j.shootAt} · {j.neighborhood}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-semibold text-amber-soft">${j.payout}</span>
              </div>
              <p className="mt-2 text-sm text-bone/55">{j.deliverables}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip>{j.type}</Chip>
                <Chip>{j.durationHours} hr</Chip>
                <Chip>
                  {j.equipment === "byo"
                    ? "Bring your kit"
                    : j.equipment === "provided"
                      ? "Gear provided"
                      : "Gear optional"}
                </Chip>
                <Chip accent>💵 Pays in {PAYOUT_DAYS} days</Chip>
              </div>
              {j.assignedToSlug === member.id && (
                <p className="mt-2 text-xs font-medium text-sky-300">
                  ⭐ Offered directly to you
                </p>
              )}
              <button
                onClick={() => claim(j.id)}
                disabled={busy === j.id}
                className="mt-4 w-full rounded-full bg-amber-brand py-3 text-base font-semibold text-ink-950 transition-colors hover:bg-amber-soft disabled:opacity-60"
              >
                {busy === j.id ? "Claiming…" : "Claim this shoot"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Mine */}
      {mine.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-bone/45">
            Your upcoming shoots
          </h2>
          <div className="mt-3 space-y-3">
            {mine.map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                <div>
                  <h3 className="font-semibold text-bone">{j.title}</h3>
                  <p className="text-sm text-bone/60">{j.shootAt} · {j.neighborhood}</p>
                </div>
                <a
                  href={`/api/calendar/${j.id}`}
                  className="shrink-0 rounded-full bg-ink-800 px-4 py-2 text-sm font-medium text-bone hover:bg-ink-700"
                >
                  + Add to calendar
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && (
        <div
          className={clsx(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-2xl ring-1 ring-inset",
            toast.tone === "ok"
              ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
              : "bg-rose-500/15 text-rose-200 ring-rose-500/30",
          )}
        >
          {toast.msg}
        </div>
      )}
    </Container>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={
        accent
          ? "rounded-full bg-amber-brand/12 px-2.5 py-1 text-xs font-medium text-amber-soft ring-1 ring-inset ring-amber-brand/25"
          : "rounded-full bg-ink-800 px-2.5 py-1 text-xs font-medium text-bone/60"
      }
    >
      {children}
    </span>
  );
}
