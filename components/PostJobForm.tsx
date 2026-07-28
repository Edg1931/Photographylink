"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { allSpecialties, Member } from "@/lib/data";
import { clsx } from "@/lib/clsx";

export function PostJobForm({
  companySlug,
  members,
  onPosted,
}: {
  companySlug: string;
  members: Member[];
  onPosted?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [posted, setPosted] = useState<string | null>(null);
  const [target, setTarget] = useState<string>(""); // "" = whole bench
  const [form, setForm] = useState({
    title: "",
    type: allSpecialties[0],
    neighborhood: "",
    payout: 200,
    durationHours: 2,
    date: "",
    time: "10:00",
    deliverables: "",
    equipment: "byo",
    urgency: "standard",
  });

  const submit = async () => {
    setBusy(true);
    setPosted(null);
    try {
      const iso = form.date ? `${form.date}T${form.time || "10:00"}:00` : "";
      const shootAt = iso
        ? new Date(iso).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Flexible";
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companySlug,
          title: form.title,
          type: form.type,
          neighborhood: form.neighborhood,
          payout: form.payout,
          durationHours: form.durationHours,
          shootAt,
          date: iso || undefined,
          deliverables: form.deliverables,
          equipment: form.equipment,
          urgency: form.urgency,
          assignedToSlug: target || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosted(data.job.id);
        setForm({ ...form, title: "", neighborhood: "", deliverables: "" });
        onPosted?.();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Who gets it */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-bone/45">
          Who should get this shoot?
        </p>
        <div className="flex flex-wrap gap-2">
          <TargetChip active={target === ""} onClick={() => setTarget("")} label="📣 Whole bench" />
          {members.map((m) => (
            <TargetChip
              key={m.id}
              active={target === m.id}
              onClick={() => setTarget(m.id)}
              label={m.name}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-bone/45">
          {target === ""
            ? "Everyone on your bench is notified — the first to claim it gets it."
            : "Offered directly to one person — only they can accept."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <L label="What's the shoot?" full>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="3-bed listing, full package" />
        </L>
        <L label="Date">
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </L>
        <L label="Time">
          <input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </L>
        <L label="Type">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
            {allSpecialties.map((s) => (
              <option key={s} value={s} className="bg-ink-800">{s}</option>
            ))}
          </select>
        </L>
        <L label="Neighborhood">
          <input className="input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Cedar Park" />
        </L>
        <L label="Pay ($)">
          <input type="number" className="input" value={form.payout} onChange={(e) => setForm({ ...form, payout: Number(e.target.value) })} />
        </L>
        <L label="Hours">
          <input type="number" className="input" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })} />
        </L>
        <L label="Deliverables" full>
          <input className="input" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} placeholder="30 HDR stills + 6 twilight" />
        </L>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={busy || !form.title}>
          {busy ? "Broadcasting…" : target ? "Send offer →" : "Broadcast to bench →"}
        </Button>
        {posted && (
          <span className="text-sm text-emerald-300">
            Sent ✓{" "}
            <Link href={`/jobs/${posted}`} className="underline hover:text-emerald-200">
              view it
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}

function TargetChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-amber-brand text-ink-950" : "bg-ink-800 text-bone/65 hover:bg-ink-700",
      )}
    >
      {label}
    </button>
  );
}

function L({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={full ? "block sm:col-span-2" : "block"}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
