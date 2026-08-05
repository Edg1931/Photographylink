"use client";

import { useEffect, useState } from "react";
import { Photographer, Specialty, Job, allSpecialties } from "@/lib/data";
import { Button } from "@/components/ui";
import { fileToResizedDataUrl } from "@/lib/resizeImage";
import { money, PAYOUT_DAYS } from "@/lib/economics";
import { clsx } from "@/lib/clsx";

export function PhotographerDashboard({
  account,
  photographer,
}: {
  account: { displayName: string; email: string };
  photographer: Photographer;
}) {
  const [p, setP] = useState<Photographer>(photographer);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Photographer>(k: K, v: Photographer[K]) =>
    setP({ ...p, [k]: v });

  const patch = async (body: Partial<Photographer>) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/photographer", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setP(data.photographer);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = () =>
    patch({
      headline: p.headline,
      bio: p.bio,
      location: p.location,
      radiusMiles: p.radiusMiles,
      dayRate: p.dayRate,
      halfDayRate: p.halfDayRate,
      availableNow: p.availableNow,
      experienceYears: p.experienceYears,
      ownsGear: p.ownsGear,
      specialties: p.specialties,
    });

  const toggleSpecialty = (s: Specialty) => {
    const has = p.specialties.includes(s);
    set("specialties", has ? p.specialties.filter((x) => x !== s) : [...p.specialties, s]);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-ink-700 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.avatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div>
            <p className="text-xs uppercase tracking-widest text-bone/40">
              Photographer profile
            </p>
            <h1 className="font-display text-2xl font-semibold">{p.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button href={`/photographers/${p.slug}`} variant="outline">
            View public profile →
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      {/* Earnings */}
      <div className="mt-8">
        <Earnings name={p.name} slug={p.slug} />
      </div>

      {/* Cover photo (the hero of your public profile) */}
      <div className="mt-6">
        <CoverPicker
          cover={p.cover}
          portfolio={p.portfolio}
          onSet={(src) => { setP({ ...p, cover: src }); patch({ cover: src }); }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: profile */}
        <div className="space-y-4">
          <Panel title="About you">
            <Labeled label="Headline (one line that sells you)">
              <input className="input" value={p.headline} onChange={(e) => set("headline", e.target.value)} />
            </Labeled>
            <Labeled label="Bio">
              <textarea className="input resize-none" rows={4} value={p.bio} onChange={(e) => set("bio", e.target.value)} />
            </Labeled>
            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Location">
                <input className="input" value={p.location} onChange={(e) => set("location", e.target.value)} />
              </Labeled>
              <Labeled label="Travel radius (mi)">
                <input type="number" className="input" value={p.radiusMiles} onChange={(e) => set("radiusMiles", Number(e.target.value))} />
              </Labeled>
              <Labeled label="Day rate ($)">
                <input type="number" className="input" value={p.dayRate} onChange={(e) => set("dayRate", Number(e.target.value))} />
              </Labeled>
              <Labeled label="Half-day rate ($)">
                <input type="number" className="input" value={p.halfDayRate} onChange={(e) => set("halfDayRate", Number(e.target.value))} />
              </Labeled>
              <Labeled label="Years of experience">
                <input type="number" className="input" value={p.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} />
              </Labeled>
              <Labeled label="Available for work?">
                <button
                  onClick={() => set("availableNow", !p.availableNow)}
                  className={clsx(
                    "flex h-[42px] w-full items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                    p.availableNow
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-ink-600 text-bone/60",
                  )}
                >
                  <span className={clsx("h-2 w-2 rounded-full", p.availableNow ? "bg-emerald-400" : "bg-bone/40")} />
                  {p.availableNow ? "Available now" : "Not available"}
                </button>
              </Labeled>
            </div>
          </Panel>

          <Panel title="Your camera & gear (one per line)">
            <textarea
              className="input resize-none"
              rows={4}
              value={p.ownsGear.join("\n")}
              onChange={(e) => set("ownsGear", e.target.value.split("\n").map((g) => g.trim()).filter(Boolean))}
              placeholder={"Sony A7 IV\n16-35mm f/2.8 GM\nDJI Mavic 3\nGodox strobes"}
            />
          </Panel>

          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
            {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
          </div>
        </div>

        {/* Right: specialties */}
        <div className="space-y-4">
          <Panel title="What you shoot">
            <div className="flex flex-wrap gap-2">
              {allSpecialties.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    p.specialties.includes(s) ? "bg-amber-brand text-ink-950" : "bg-ink-800 text-bone/60 hover:bg-ink-700",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-bone/45">
              Companies filter and judge you by these. Save when you change them.
            </p>
          </Panel>
        </div>
      </div>

      {/* Portfolio */}
      <div className="mt-10">
        <PortfolioManager p={p} onChange={(portfolio) => { setP({ ...p, portfolio }); patch({ portfolio }); }} />
      </div>
    </div>
  );
}

function PortfolioManager({
  p,
  onChange,
}: {
  p: Photographer;
  onChange: (portfolio: Photographer["portfolio"]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [pendingSrc, setPendingSrc] = useState("");
  const [label, setLabel] = useState("");
  const [field, setField] = useState<Specialty>(p.specialties[0] ?? "Real Estate");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setPendingSrc(await fileToResizedDataUrl(file));
    } finally {
      setUploading(false);
    }
  };

  const addItem = () => {
    if (!pendingSrc) return;
    onChange([...p.portfolio, { src: pendingSrc, label: label || field, field }]);
    setPendingSrc("");
    setLabel("");
  };

  const removeItem = (i: number) => onChange(p.portfolio.filter((_, idx) => idx !== i));

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Portfolio</h2>
      <p className="mt-1 text-sm text-bone/55">
        Upload examples of your work and tag each by field so companies can see
        the exact kind of shoots you nail.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Uploader */}
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
          {pendingSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pendingSrc} alt="" className="h-44 w-full rounded-lg object-cover" />
          ) : (
            <label className="flex h-44 cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink-600 bg-ink-950 text-sm text-bone/55 hover:border-amber-brand/50">
              {uploading ? "Processing…" : "📷 Tap to upload a photo"}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          )}
          <div className="mt-3 space-y-3">
            <Labeled label="Caption (optional)">
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Twilight exterior" />
            </Labeled>
            <Labeled label="Field">
              <select className="input" value={field} onChange={(e) => setField(e.target.value as Specialty)}>
                {allSpecialties.map((s) => (
                  <option key={s} value={s} className="bg-ink-800">{s}</option>
                ))}
              </select>
            </Labeled>
            <Button className="w-full" onClick={addItem} disabled={!pendingSrc}>
              Add to portfolio
            </Button>
          </div>
        </div>

        {/* Existing */}
        <div>
          {p.portfolio.length === 0 ? (
            <div className="flex h-full min-h-[11rem] items-center justify-center rounded-2xl border border-dashed border-ink-700 text-center text-sm text-bone/45">
              No work uploaded yet. Add your first example on the left.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.portfolio.map((shot, i) => (
                <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.src} alt={shot.label} className="h-full w-full object-cover" />
                  {shot.field && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] text-bone/80">
                      {shot.field}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-xs text-bone opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Earnings({ name, slug }: { name: string; slug: string }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    fetch("/api/jobs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) =>
        setJobs(
          (d.jobs as Job[]).filter(
            (j) => j.claimedByName === name || j.claimedBySlug === slug,
          ),
        ),
      )
      .catch(() => setJobs([]));
  }, [name, slug]);

  const mine = jobs ?? [];
  const total = mine.reduce((s, j) => s + j.payout, 0);
  const delivered = mine.filter((j) => j.status === "delivered");
  const upcoming = mine.filter((j) => j.status !== "delivered");
  const paid = delivered.reduce((s, j) => s + j.payout, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-brand/25 bg-gradient-to-br from-ink-800 to-ink-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-bone/50">
            Earnings — you keep 100%
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-amber-soft">
            {money(total)}
          </p>
          <p className="mt-1 text-sm text-bone/55">
            across {mine.length} shoot{mine.length === 1 ? "" : "s"} · paid in{" "}
            {PAYOUT_DAYS} days after delivery
          </p>
        </div>
        <div className="flex gap-3 text-center">
          <MiniStat label="Upcoming" value={String(upcoming.length)} />
          <MiniStat label="Delivered" value={String(delivered.length)} />
          <MiniStat label="1099 total" value={money(paid)} />
        </div>
      </div>
      {mine.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-ink-700 pt-3">
          {mine.slice(0, 4).map((j) => (
            <div key={j.id} className="flex items-center justify-between text-sm">
              <span className="truncate text-bone/70">{j.title}</span>
              <span className="tabular-nums text-bone/80">{money(j.payout)}</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-bone/40">
        Tracked automatically for taxes. Direct-deposit payouts turn on with the
        payments launch.
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-950 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-bone/40">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-bone">{value}</p>
    </div>
  );
}

function CoverPicker({
  cover,
  portfolio,
  onSet,
}: {
  cover?: string;
  portfolio: Photographer["portfolio"];
  onSet: (src: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onSet(await fileToResizedDataUrl(file, 1600, 0.72));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
      <div className="relative h-44 sm:h-56">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-bone/40">
            No cover photo yet
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-xs uppercase tracking-widest text-bone/60">
            Cover photo
          </p>
          <p className="text-sm font-medium text-bone">
            The big image at the top of your public profile
          </p>
        </div>
        <label className="absolute bottom-3 right-4 cursor-pointer rounded-full bg-amber-brand px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-amber-soft">
          {uploading ? "Uploading…" : "Upload cover"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {portfolio.length > 0 && (
        <div className="p-4">
          <p className="mb-2 text-xs text-bone/45">Or use one of your photos:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {portfolio.map((shot, i) => (
              <button
                key={i}
                onClick={() => onSet(shot.src)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                  cover === shot.src ? "border-amber-brand" : "border-transparent hover:border-ink-500"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-bone/40">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">{label}</span>
      {children}
    </label>
  );
}
