"use client";

import { useEffect, useState } from "react";

type Item = { src: string; label: string; field?: string };

export function PhotoGallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  // Ordered unique fields for section grouping.
  const fields: string[] = [];
  for (const it of items) {
    const f = it.field ?? "Selected work";
    if (!fields.includes(f)) fields.push(f);
  }

  const flat = items; // lightbox indexes into the same array we render

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % flat.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + flat.length) % flat.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700 p-12 text-center text-bone/45">
        No work uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {fields.map((field) => {
        const group = items
          .map((it, idx) => ({ it, idx }))
          .filter(({ it }) => (it.field ?? "Selected work") === field);
        return (
          <div key={field}>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="font-display text-lg font-semibold text-bone">{field}</h3>
              <span className="h-px flex-1 bg-ink-700" />
              <span className="text-xs text-bone/40">{group.length} photos</span>
            </div>
            <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
              {group.map(({ it, idx }) => (
                <button
                  key={idx}
                  onClick={() => setOpen(idx)}
                  className="group relative block w-full overflow-hidden rounded-xl border border-ink-700"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.src}
                    alt={it.label}
                    loading="lazy"
                    className="w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-1 p-3 text-left text-sm text-bone opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    {it.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Lightbox */}
      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95 p-4 sm:p-10"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink-800/80 text-bone hover:bg-ink-700"
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <button
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink-800/70 text-xl text-bone hover:bg-ink-700 sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => (o === null ? o : (o - 1 + flat.length) % flat.length));
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flat[open].src}
              alt={flat[open].label}
              className="max-h-[82vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="mt-3 flex items-center justify-between text-sm text-bone/70">
              <span>{flat[open].label}</span>
              <span className="text-bone/40">
                {open + 1} / {flat.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink-800/70 text-xl text-bone hover:bg-ink-700 sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => (o === null ? o : (o + 1) % flat.length));
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
