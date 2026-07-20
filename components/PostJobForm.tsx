"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { allSpecialties, Photographer } from "@/lib/data";

export function PostJobForm({
  companySlug,
  bench,
}: {
  companySlug: string;
  bench: Photographer[];
}) {
  const [busy, setBusy] = useState(false);
  const [posted, setPosted] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: allSpecialties[0],
    neighborhood: "",
    payout: 200,
    durationHours: 2,
    shootAt: "",
    deliverables: "",
    equipment: "byo",
    urgency: "standard",
    assignedToSlug: "",
  });

  const submit = async () => {
    setBusy(true);
    setPosted(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companySlug, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosted(data.job.id);
        setForm({ ...form, title: "", neighborhood: "", deliverables: "" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-bone/55">
        Post a shoot to the queue. It appears on your micro-site and your bench
        can claim it — or offer it directly to one photographer.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <L label="Title" full>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="3-bed listing, full package"
          />
        </L>
        <L label="Type">
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
          >
            {allSpecialties.map((s) => (
              <option key={s} value={s} className="bg-ink-800">
                {s}
              </option>
            ))}
          </select>
        </L>
        <L label="Neighborhood">
          <input
            className="input"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            placeholder="Cedar Park"
          />
        </L>
        <L label="Payout ($)">
          <input
            type="number"
            className="input"
            value={form.payout}
            onChange={(e) => setForm({ ...form, payout: Number(e.target.value) })}
          />
        </L>
        <L label="Duration (hrs)">
          <input
            type="number"
            className="input"
            value={form.durationHours}
            onChange={(e) =>
              setForm({ ...form, durationHours: Number(e.target.value) })
            }
          />
        </L>
        <L label="When">
          <input
            className="input"
            value={form.shootAt}
            onChange={(e) => setForm({ ...form, shootAt: e.target.value })}
            placeholder="Tomorrow · 10:00 AM"
          />
        </L>
        <L label="Equipment">
          <select
            className="input"
            value={form.equipment}
            onChange={(e) => setForm({ ...form, equipment: e.target.value })}
          >
            <option value="byo" className="bg-ink-800">Bring your own</option>
            <option value="provided" className="bg-ink-800">We provide gear</option>
            <option value="either" className="bg-ink-800">Either</option>
          </select>
        </L>
        <L label="Deliverables" full>
          <input
            className="input"
            value={form.deliverables}
            onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
            placeholder="30 HDR stills + 6 twilight"
          />
        </L>
        <L label="Assign directly to (optional)" full>
          <select
            className="input"
            value={form.assignedToSlug}
            onChange={(e) => setForm({ ...form, assignedToSlug: e.target.value })}
          >
            <option value="" className="bg-ink-800">
              Open to the whole bench (queue)
            </option>
            {bench.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-ink-800">
                Offer directly to {p.name}
              </option>
            ))}
          </select>
        </L>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={busy || !form.title}>
          {busy ? "Posting…" : "Post to queue"}
        </Button>
        {posted && (
          <span className="text-sm text-emerald-300">
            Posted ✓{" "}
            <Link href={`/jobs/${posted}`} className="underline hover:text-emerald-200">
              view it
            </Link>
          </span>
        )}
      </div>
    </div>
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
