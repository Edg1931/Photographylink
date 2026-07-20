"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Company, Offering, Specialty, allSpecialties } from "@/lib/data";
import { Button, Badge } from "@/components/ui";
import { clsx } from "@/lib/clsx";

interface Inquiry {
  id: string;
  companySlug: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: number;
  read: boolean;
}

type Tab = "site" | "offerings" | "inquiries" | "grow";

export function Dashboard({
  account,
  company,
  inquiries: initialInquiries,
}: {
  account: { displayName: string; email: string };
  company: Company;
  inquiries: Inquiry[];
}) {
  const [tab, setTab] = useState<Tab>("site");
  const [co, setCo] = useState<Company>(company);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const patch = useCallback(
    async (body: Partial<Company>) => {
      setSaving(true);
      setSaved(false);
      try {
        const res = await fetch("/api/company", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setCo(data.company);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const refreshInquiries = useCallback(async () => {
    const data = await fetch("/api/inquiries", { cache: "no-store" }).then((r) =>
      r.json(),
    );
    setInquiries(data.inquiries);
  }, []);

  useEffect(() => {
    const t = setInterval(refreshInquiries, 8000);
    return () => clearInterval(t);
  }, [refreshInquiries]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "site", label: "Micro-site" },
    { key: "offerings", label: "Services & pricing" },
    { key: "inquiries", label: "Inquiries", badge: inquiries.length },
    { key: "grow", label: "Grow" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-ink-700 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-ink-950"
            style={{ background: co.accent }}
          >
            {co.logoMark}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{co.name}</h1>
            <p className="text-sm text-bone/55">
              Signed in as {account.displayName} · {account.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button href={`/companies/${co.slug}`} variant="outline">
            View public site →
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-amber-brand text-ink-950"
                : "bg-ink-800 text-bone/65 hover:bg-ink-700 hover:text-bone",
            )}
          >
            {t.label}
            {t.badge ? (
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[11px]",
                  tab === t.key ? "bg-ink-950/20" : "bg-ink-950",
                )}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "site" && (
          <SiteEditor co={co} setCo={setCo} onSave={patch} saving={saving} saved={saved} />
        )}
        {tab === "offerings" && (
          <OfferingsEditor co={co} onSave={patch} saving={saving} saved={saved} />
        )}
        {tab === "inquiries" && (
          <Inquiries inquiries={inquiries} onRefresh={refreshInquiries} />
        )}
        {tab === "grow" && <Grow slug={co.slug} />}
      </div>
    </div>
  );
}

// ---- Micro-site editor ------------------------------------------------------

function SiteEditor({
  co,
  setCo,
  onSave,
  saving,
  saved,
}: {
  co: Company;
  setCo: (c: Company) => void;
  onSave: (b: Partial<Company>) => void;
  saving: boolean;
  saved: boolean;
}) {
  const set = <K extends keyof Company>(k: K, v: Company[K]) =>
    setCo({ ...co, [k]: v });

  const toggleSpecialty = (s: Specialty) => {
    const has = co.specialties.includes(s);
    set(
      "specialties",
      has ? co.specialties.filter((x) => x !== s) : [...co.specialties, s],
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <Panel title="Story">
          <Labeled label="Tagline">
            <input
              className="input"
              value={co.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Labeled>
          <Labeled label="About">
            <textarea
              className="input resize-none"
              rows={4}
              value={co.about}
              onChange={(e) => set("about", e.target.value)}
            />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Location">
              <input
                className="input"
                value={co.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Labeled>
            <Labeled label="Base day rate ($)">
              <input
                type="number"
                className="input"
                value={co.baseDayRate}
                onChange={(e) => set("baseDayRate", Number(e.target.value))}
              />
            </Labeled>
          </div>
          <Labeled label="Markets (comma separated)">
            <input
              className="input"
              value={co.markets.join(", ")}
              onChange={(e) =>
                set(
                  "markets",
                  e.target.value.split(",").map((m) => m.trim()).filter(Boolean),
                )
              }
            />
          </Labeled>
        </Panel>

        <Panel title="Equipment policy">
          <Labeled label="Policy">
            <select
              className="input"
              value={co.equipmentPolicy}
              onChange={(e) =>
                set("equipmentPolicy", e.target.value as Company["equipmentPolicy"])
              }
            >
              <option value="either" className="bg-ink-800">Provided or BYO</option>
              <option value="provided" className="bg-ink-800">We provide gear</option>
              <option value="byo" className="bg-ink-800">Bring your own kit</option>
            </select>
          </Labeled>
          <Labeled label="Notes">
            <textarea
              className="input resize-none"
              rows={2}
              value={co.equipmentNotes}
              onChange={(e) => set("equipmentNotes", e.target.value)}
            />
          </Labeled>
        </Panel>

        <Panel title="Perks (one per line)">
          <textarea
            className="input resize-none"
            rows={4}
            value={co.perks.join("\n")}
            onChange={(e) =>
              set("perks", e.target.value.split("\n").map((p) => p.trim()).filter(Boolean))
            }
          />
        </Panel>

        <div className="flex items-center gap-3">
          <Button
            onClick={() =>
              onSave({
                tagline: co.tagline,
                about: co.about,
                location: co.location,
                baseDayRate: co.baseDayRate,
                markets: co.markets,
                equipmentPolicy: co.equipmentPolicy,
                equipmentNotes: co.equipmentNotes,
                perks: co.perks,
                accent: co.accent,
                specialties: co.specialties,
              })
            }
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
        </div>
      </div>

      {/* Right: brand + specialties + preview */}
      <div className="space-y-4">
        <Panel title="Brand accent">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a}
                onClick={() => set("accent", a)}
                className={clsx(
                  "h-9 w-9 rounded-full ring-2 transition-transform hover:scale-110",
                  co.accent.toLowerCase() === a.toLowerCase()
                    ? "ring-bone"
                    : "ring-transparent",
                )}
                style={{ background: a }}
                aria-label={a}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-bone/45">
            Your accent colors your micro-site header, pricing, and buttons.
          </p>
        </Panel>

        <Panel title="Specialties">
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  co.specialties.includes(s)
                    ? "bg-amber-brand text-ink-950"
                    : "bg-ink-800 text-bone/60 hover:bg-ink-700",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Panel>

        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
          <p className="text-xs text-bone/45">
            Changes save to your live micro-site. Open{" "}
            <Link
              href={`/companies/${co.slug}`}
              className="text-amber-soft hover:underline"
            >
              your public page
            </Link>{" "}
            in a new tab to see them.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Offerings editor -------------------------------------------------------

function OfferingsEditor({
  co,
  onSave,
  saving,
  saved,
}: {
  co: Company;
  onSave: (b: Partial<Company>) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [items, setItems] = useState<Offering[]>(co.offerings);

  const update = (i: number, patch: Partial<Offering>) =>
    setItems(items.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () =>
    setItems([
      ...items,
      { title: "New service", price: 150, unit: "per shoot", blurb: "" },
    ]);

  return (
    <div className="max-w-3xl space-y-4">
      {items.map((o, i) => (
        <div
          key={i}
          className="rounded-2xl border border-ink-700 bg-ink-900 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <Labeled label="Service">
              <input
                className="input"
                value={o.title}
                onChange={(e) => update(i, { title: e.target.value })}
              />
            </Labeled>
            <Labeled label="Price ($)">
              <input
                type="number"
                className="input"
                value={o.price}
                onChange={(e) => update(i, { price: Number(e.target.value) })}
              />
            </Labeled>
            <Labeled label="Unit">
              <input
                className="input"
                value={o.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
              />
            </Labeled>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <Labeled label="Blurb" className="flex-1">
              <input
                className="input"
                value={o.blurb}
                onChange={(e) => update(i, { blurb: e.target.value })}
              />
            </Labeled>
            <button
              onClick={() => remove(i)}
              className="mb-1 rounded-full px-3 py-2 text-xs text-bone/50 ring-1 ring-inset ring-ink-600 hover:text-rose-200 hover:ring-rose-500/40"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={add}>
          + Add service
        </Button>
        <Button onClick={() => onSave({ offerings: items })} disabled={saving}>
          {saving ? "Saving…" : "Save services"}
        </Button>
        {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
      </div>
    </div>
  );
}

// ---- Inquiries --------------------------------------------------------------

function Inquiries({
  inquiries,
  onRefresh,
}: {
  inquiries: Inquiry[];
  onRefresh: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-bone/55">
          Inquiries sent from your micro-site. You and our team are both
          notified.
        </p>
        <Button variant="ghost" className="text-sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-bone/40">
          No inquiries yet. Share your micro-site link to start getting leads.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-ink-700 bg-ink-900 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-bone">{q.name}</p>
                  <a
                    href={`mailto:${q.email}`}
                    className="text-sm text-amber-soft hover:underline"
                  >
                    {q.email}
                  </a>
                </div>
                <Badge tone="amber">{q.projectType}</Badge>
              </div>
              {q.message && (
                <p className="mt-3 text-sm text-bone/70">{q.message}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Button href={`mailto:${q.email}`} className="py-1.5 text-xs">
                  Reply →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Grow -------------------------------------------------------------------

function Grow({ slug }: { slug: string }) {
  const cards = [
    {
      title: "Post a job to the queue",
      body: "Drop overflow, vacation, or multi-shooter jobs into the queue and your bench claims them.",
      href: "/jobs",
      cta: "Open the queue →",
    },
    {
      title: "Find photographers",
      body: "Browse qualified shooters by specialty and rate, and invite them to your bench.",
      href: "/photographers",
      cta: "Browse photographers →",
    },
    {
      title: "Share your micro-site",
      body: "Send clients straight to your page to see your work and inquire.",
      href: `/companies/${slug}`,
      cta: "View your site →",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-5"
        >
          <h3 className="font-semibold text-bone">{c.title}</h3>
          <p className="mt-2 flex-1 text-sm text-bone/60">{c.body}</p>
          <Link
            href={c.href}
            className="mt-4 text-sm font-medium text-amber-soft hover:text-amber-brand"
          >
            {c.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}

// ---- Bits -------------------------------------------------------------------

const ACCENTS = [
  "#e8a94b",
  "#7c9cf5",
  "#e06c75",
  "#5ec8a0",
  "#c98bdb",
  "#d98b5f",
  "#8bb8d9",
];

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-bone/40">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Labeled({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">
        {label}
      </span>
      {children}
    </label>
  );
}
