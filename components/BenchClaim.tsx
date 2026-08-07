"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Job, Client } from "@/lib/data";
import { Container } from "@/components/ui";
import { PAYOUT_DAYS } from "@/lib/economics";
import { clsx } from "@/lib/clsx";

const propertyOf = (j: Job) => j.title.split(" · ")[0];

export function BenchClaim({
  companySlug,
  companyName,
  accent,
  logoMark,
  clients = [],
  member,
}: {
  companySlug: string;
  companyName: string;
  accent: string;
  logoMark: string;
  clients?: Client[];
  member: { id: string; name: string; avatar: string };
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);

  const clientOf = (id?: string) => clients.find((c) => c.id === id);

  const refresh = useCallback(async () => {
    const data = await fetch("/api/jobs", { cache: "no-store" }).then((r) => r.json());
    setJobs((data.jobs as Job[]).filter((j) => j.companySlug === companySlug));
    setLoaded(true);
  }, [companySlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Group the shoots this member can claim by property.
  const groups = useMemo(() => {
    const available = jobs.filter(
      (j) => j.status === "open" && (!j.assignedToSlug || j.assignedToSlug === member.id),
    );
    const map = new Map<string, Job[]>();
    for (const j of available) {
      const key = `${propertyOf(j)}|${j.date ?? j.shootAt}`;
      map.set(key, [...(map.get(key) ?? []), j]);
    }
    return Array.from(map.values());
  }, [jobs, member.id]);

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
      if (data.ok) setToast({ msg: "You got it! It's on your calendar below.", tone: "ok" });
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
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-ink-950" style={{ background: accent }}>
          {logoMark}
        </span>
        <div>
          <p className="text-sm text-bone/55">{companyName}</p>
          <h1 className="font-display text-2xl font-semibold">Hi {member.name.split(" ")[0]} 👋</h1>
        </div>
      </div>
      <p className="mt-3 text-bone/65">
        Here's work you can claim — each shoot is broken down by service, so you
        see exactly what to do and <strong className="text-bone">exactly what you earn</strong>.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-bone/45">Available now</h2>
      <div className="mt-3 space-y-4">
        {!loaded ? (
          <div className="h-32 animate-pulse rounded-2xl bg-ink-900" />
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 p-8 text-center text-bone/45">
            Nothing to claim right now. Check back when {companyName} sends out a shoot.
          </div>
        ) : (
          groups.map((g, gi) => {
            const first = g[0];
            const client = clientOf(first.clientId);
            const total = g.reduce((s, j) => s + j.payout, 0);
            return (
              <div key={gi} className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
                {/* Property header */}
                <div className="border-b border-ink-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-bone">{propertyOf(first)}</h3>
                      <p className="mt-0.5 text-sm text-bone/55">{first.shootAt} · {first.neighborhood}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wide text-bone/40">Up to</p>
                      <p className="font-display text-xl font-semibold text-amber-soft">${total}</p>
                    </div>
                  </div>
                  {client?.notes && (
                    <p className="mt-2 rounded-lg bg-ink-950 p-2.5 text-xs text-bone/70">
                      <span className="font-medium text-bone/80">{client.name}'s preferences:</span> {client.notes}
                    </p>
                  )}
                  {first.assignedToSlug === member.id && (
                    <p className="mt-2 text-xs font-medium text-sky-300">⭐ Offered directly to you</p>
                  )}
                </div>
                {/* Service line items */}
                <div className="divide-y divide-ink-800">
                  {g.map((j) => (
                    <div key={j.id} className="flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-ink-800 px-2 py-0.5 text-xs font-medium text-bone/80">{j.type}</span>
                          <span className="text-sm font-semibold text-amber-soft">${j.payout}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-bone/50">
                          {j.deliverables} · {j.durationHours} hr ·{" "}
                          {j.equipment === "byo" ? "BYO kit" : j.equipment === "provided" ? "gear provided" : "gear optional"} · pays in {PAYOUT_DAYS}d
                        </p>
                      </div>
                      <button
                        onClick={() => claim(j.id)}
                        disabled={busy === j.id}
                        className="shrink-0 rounded-full bg-amber-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-amber-soft disabled:opacity-60"
                      >
                        {busy === j.id ? "…" : "Claim"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {mine.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-bone/45">Your upcoming shoots</h2>
          <div className="mt-3 space-y-3">
            {mine.map((j) => {
              const client = clientOf(j.clientId);
              return (
                <div key={j.id} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-bone">{j.title}</h3>
                      <p className="text-sm text-bone/60">{j.shootAt} · {j.neighborhood} · ${j.payout}</p>
                    </div>
                    <a href={`/api/calendar/${j.id}`} className="shrink-0 rounded-full bg-ink-800 px-4 py-2 text-sm font-medium text-bone hover:bg-ink-700">
                      + Calendar
                    </a>
                  </div>
                  {client && (
                    <div className="mt-3 border-t border-emerald-500/15 pt-3">
                      {client.notes && <p className="text-xs text-bone/65"><span className="font-medium text-bone/80">{client.name}:</span> {client.notes}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {client.phone && <a href={`tel:${client.phone}`} className="rounded-full bg-ink-900 px-3 py-1.5 text-xs text-bone/75 hover:text-bone">📞 Call {client.name.split(" ")[0]}</a>}
                        {client.phone && <a href={`sms:${client.phone}`} className="rounded-full bg-ink-900 px-3 py-1.5 text-xs text-bone/75 hover:text-bone">💬 Text “running late”</a>}
                        {client.email && <a href={`mailto:${client.email}`} className="rounded-full bg-ink-900 px-3 py-1.5 text-xs text-bone/75 hover:text-bone">✉️ Email</a>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
