"use client";

import { useMemo, useState } from "react";
import { Photographer, Specialty } from "@/lib/data";
import { PhotographerCard } from "@/components/PhotographerCard";
import { clsx } from "@/lib/clsx";

type Sort = "rating" | "priceLow" | "priceHigh" | "jobs";

export function PhotographerBrowser({
  photographers,
  specialties,
}: {
  photographers: Photographer[];
  specialties: Specialty[];
}) {
  const [active, setActive] = useState<Specialty | "All">("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");

  const shown = useMemo(() => {
    let list = photographers.filter(
      (p) => active === "All" || p.specialties.includes(active),
    );
    if (onlyAvailable) list = list.filter((p) => p.availableNow);
    const sorters: Record<Sort, (a: Photographer, b: Photographer) => number> = {
      rating: (a, b) => b.rating - a.rating,
      priceLow: (a, b) => a.dayRate - b.dayRate,
      priceHigh: (a, b) => b.dayRate - a.dayRate,
      jobs: (a, b) => b.jobsCompleted - a.jobsCompleted,
    };
    return [...list].sort(sorters[sort]);
  }, [photographers, active, onlyAvailable, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Chip label="All" active={active === "All"} onClick={() => setActive("All")} />
          {specialties.map((s) => (
            <Chip
              key={s}
              label={s}
              active={active === s}
              onClick={() => setActive(s)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-4">
        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ring-1 ring-inset transition-colors",
            onlyAvailable
              ? "bg-emerald-500/12 text-emerald-300 ring-emerald-500/30"
              : "text-bone/60 ring-ink-600 hover:text-bone",
          )}
        >
          <span
            className={clsx(
              "h-1.5 w-1.5 rounded-full",
              onlyAvailable ? "bg-emerald-400 live-dot" : "bg-bone/40",
            )}
          />
          Available now
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-bone/45">{shown.length} results</span>
          <label className="flex items-center gap-2 text-sm text-bone/60">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-bone focus:border-amber-brand/50 focus:outline-none"
            >
              <option value="rating">Top rated</option>
              <option value="priceLow">Rate: low to high</option>
              <option value="priceHigh">Rate: high to low</option>
              <option value="jobs">Most jobs</option>
            </select>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-16 text-center text-bone/50">
          No photographers match those filters yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PhotographerCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-amber-brand text-ink-950"
          : "bg-ink-800 text-bone/65 hover:bg-ink-700 hover:text-bone",
      )}
    >
      {label}
    </button>
  );
}
