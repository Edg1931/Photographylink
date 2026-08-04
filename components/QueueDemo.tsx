"use client";

import { useEffect, useState } from "react";

interface Shooter {
  name: string;
  avatar: string;
  rating: number;
  distance: string;
}

const SHOOTERS: Shooter[] = [
  { name: "Maya O.", avatar: "https://i.pravatar.cc/80?img=47", rating: 4.97, distance: "3 mi" },
  { name: "Diego N.", avatar: "https://i.pravatar.cc/80?img=12", rating: 4.9, distance: "7 mi" },
  { name: "Priya R.", avatar: "https://i.pravatar.cc/80?img=45", rating: 4.85, distance: "11 mi" },
];

/**
 * A looping visual of a job hitting the queue and the first available bench
 * photographer claiming it. Pure client-side theatre — no real data.
 */
export function QueueDemo() {
  // phase 0: posted, 1: notifying bench, 2: claimed
  const [phase, setPhase] = useState(0);
  const [claimer, setClaimer] = useState(0);

  useEffect(() => {
    const seq = [
      { to: 1, delay: 1400 },
      { to: 2, delay: 1600 },
      { to: 0, delay: 2600 },
    ];
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const step = seq[i % seq.length];
      timer = setTimeout(() => {
        setPhase(step.to);
        if (step.to === 2) setClaimer((c) => (c + 1) % SHOOTERS.length);
        i++;
        tick();
      }, step.delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative rounded-3xl border border-ink-700 bg-ink-950 p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-bone/55">
          <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
          Lumen Estates · your bench
        </div>
        <span className="text-xs text-bone/35">Austin, TX</span>
      </div>

      {/* The job */}
      <div className="mt-4 rounded-2xl border border-amber-brand/25 bg-ink-900 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-amber-brand/15 px-2 py-0.5 text-[11px] font-medium text-amber-soft">
            New job
          </span>
          <span className="text-sm font-semibold text-amber-soft">$220</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-bone">
          3-bed ranch · full listing package
        </p>
        <p className="mt-1 text-xs text-bone/55">
          Tomorrow 10:00 AM · Dripping Springs · 35 stills + twilight
        </p>
      </div>

      {/* Connector */}
      <div className="flex justify-center py-2">
        <div
          className={`h-6 w-px transition-colors duration-500 ${
            phase >= 1 ? "bg-amber-brand/60" : "bg-ink-600"
          }`}
        />
      </div>

      {/* The bench */}
      <p className="mb-2 text-[11px] uppercase tracking-widest text-bone/40">
        {phase === 2 ? "Claimed by" : "Notifying trained bench"}
      </p>
      <div className="space-y-2">
        {SHOOTERS.map((s, i) => {
          const isClaimer = phase === 2 && i === claimer;
          const dimmed = phase === 2 && i !== claimer;
          return (
            <div
              key={s.name}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-all duration-500 ${
                isClaimer
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : dimmed
                    ? "border-ink-700 bg-ink-900 opacity-40"
                    : "border-ink-700 bg-ink-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  {phase === 1 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-brand ring-2 ring-ink-950 live-dot" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-bone">{s.name}</p>
                  <p className="text-[11px] text-bone/50">
                    ★ {s.rating} · {s.distance} away
                  </p>
                </div>
              </div>
              {isClaimer ? (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  ✓ Claimed
                </span>
              ) : phase === 1 ? (
                <span className="rounded-full bg-amber-brand/15 px-2.5 py-1 text-[11px] font-medium text-amber-soft">
                  Notified
                </span>
              ) : (
                <span className="text-[11px] text-bone/35">Available</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
