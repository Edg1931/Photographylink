"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { serviceTypes, Member } from "@/lib/data";
import { PLATFORM_FEE_PCT, money } from "@/lib/economics";
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
  const [postedCount, setPostedCount] = useState<number | null>(null);
  const [target, setTarget] = useState<string>(""); // "" = whole bench
  const [property, setProperty] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  // Each service is a separate, independently-claimable line item.
  const [services, setServices] = useState(
    serviceTypes.map((s) => ({
      name: s.name,
      blurb: s.blurb,
      pay: s.defaultPay,
      client: s.defaultClient,
      on: s.name === "Photos",
    })),
  );

  const toggle = (name: string) =>
    setServices((list) =>
      list.map((s) => (s.name === name ? { ...s, on: !s.on } : s)),
    );
  const setField = (name: string, field: "pay" | "client", v: number) =>
    setServices((list) =>
      list.map((s) => (s.name === name ? { ...s, [field]: v } : s)),
    );

  const selected = services.filter((s) => s.on);

  const submit = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    setPostedCount(null);
    try {
      const iso = date ? `${date}T${time || "10:00"}:00` : "";
      const shootAt = iso
        ? new Date(iso).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Flexible";
      // One job per selected service.
      const results = await Promise.all(
        selected.map((s) =>
          fetch("/api/jobs", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              companySlug,
              title: `${property || neighborhood || "Shoot"} · ${s.name}`,
              type: s.name,
              neighborhood,
              payout: s.pay,
              durationHours: 1,
              shootAt,
              date: iso || undefined,
              clientPrice: s.client,
              deliverables: s.blurb,
              equipment: "byo",
              urgency: "standard",
              assignedToSlug: target || undefined,
            }),
          }).then((r) => r.ok),
        ),
      );
      setPostedCount(results.filter(Boolean).length);
      setProperty("");
      setNeighborhood("");
      onPosted?.();
    } finally {
      setBusy(false);
    }
  };

  const payTotal = selected.reduce((sum, s) => sum + s.pay, 0);
  const clientTotal = selected.reduce((sum, s) => sum + s.client, 0);
  const fee = Math.round(payTotal * PLATFORM_FEE_PCT * 100) / 100;
  const margin = Math.round((clientTotal - payTotal - fee) * 100) / 100;

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
        <p className="mb-4 text-sm text-bone/60">
          A shoot is broken into the services you actually sell. Pick the ones
          this property needs — each becomes its own claimable job, so different
          photographers can cover photos, drone, Matterport, etc.
        </p>

        {/* Property + timing */}
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Property / address" full>
            <input className="input" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="1420 Wildflower Pass" />
          </L>
          <L label="Neighborhood">
            <input className="input" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Dripping Springs" />
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Date">
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </L>
            <L label="Time">
              <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
            </L>
          </div>
        </div>

        {/* Services */}
        <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-bone/45">
          Services needed
        </p>
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.name}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-2.5 transition-colors",
                s.on ? "border-amber-brand/40 bg-amber-brand/5" : "border-ink-700 bg-ink-950",
              )}
            >
              <button
                onClick={() => toggle(s.name)}
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs",
                  s.on ? "border-amber-brand bg-amber-brand text-ink-950" : "border-ink-600 text-transparent",
                )}
                aria-label={`Toggle ${s.name}`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-bone">{s.name}</p>
                <p className="truncate text-xs text-bone/45">{s.blurb}</p>
              </div>
              <div className="flex items-center gap-3">
                <PriceInput label="Client" value={s.client} disabled={!s.on} onChange={(v) => setField(s.name, "client", v)} />
                <PriceInput label="Pay" value={s.pay} disabled={!s.on} onChange={(v) => setField(s.name, "pay", v)} accent />
              </div>
            </div>
          ))}
        </div>

        {/* Live margin */}
        {selected.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-ink-700 bg-ink-950 p-3 text-center text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-bone/40">Client pays</p>
              <p className="font-semibold text-bone">{money(clientTotal)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-bone/40">Photographers</p>
              <p className="font-semibold text-bone">{money(payTotal)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-bone/40">Your net</p>
              <p className="font-semibold text-emerald-300">{money(margin)}</p>
            </div>
          </div>
        )}

        {/* Who gets it */}
        <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-bone/45">
          Who can claim these?
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip active={target === ""} onClick={() => setTarget("")} label="📣 Whole bench" />
          {members.map((m) => (
            <Chip key={m.id} active={target === m.id} onClick={() => setTarget(m.id)} label={m.name} />
          ))}
        </div>
        <p className="mt-2 text-xs text-bone/45">
          {target === ""
            ? "Everyone on your bench can claim any of these services."
            : "Offered directly to one person — only they can accept."}
        </p>

        {/* Submit */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink-700 pt-4">
          <Button onClick={submit} disabled={busy || selected.length === 0}>
            {busy
              ? "Posting…"
              : `Post ${selected.length} service${selected.length === 1 ? "" : "s"}`}
          </Button>
          {postedCount !== null && (
            <span className="text-sm text-emerald-300">
              Posted {postedCount} shoot{postedCount === 1 ? "" : "s"} ✓{" "}
              <Link href="/jobs" className="underline hover:text-emerald-200">
                view queue
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
  disabled,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <label className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] uppercase tracking-wide text-bone/40">{label}</span>
      <span className="flex items-center gap-0.5">
        <span className="text-xs text-bone/40">$</span>
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={clsx(
            "w-16 rounded-lg border bg-ink-800 px-2 py-1 text-sm disabled:opacity-40 focus:outline-none",
            accent ? "border-amber-brand/40 text-amber-soft" : "border-ink-600 text-bone",
          )}
        />
      </span>
    </label>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

function L({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? "block sm:col-span-2" : "block"}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
