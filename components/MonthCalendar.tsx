"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Job } from "@/lib/data";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthCalendar({ appointments }: { appointments: Job[] }) {
  const first = appointments.find((a) => a.date)?.date;
  const initial = first ? new Date(first) : new Date();
  const [cursor, setCursor] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const byDay = useMemo(() => {
    const m = new Map<string, Job[]>();
    for (const a of appointments) {
      if (!a.date) continue;
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      m.set(key, [...(m.get(key) ?? []), a]);
    }
    return m;
  }, [appointments]);

  const startWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (delta: number) => {
    const m = cursor.month + delta;
    setCursor({
      year: cursor.year + Math.floor(m / 12),
      month: ((m % 12) + 12) % 12,
    });
  };

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          {MONTHS[cursor.month]} {cursor.year}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} className="rounded-lg bg-ink-800 px-3 py-1.5 text-sm text-bone/70 hover:text-bone" aria-label="Previous month">←</button>
          <button onClick={() => shift(1)} className="rounded-lg bg-ink-800 px-3 py-1.5 text-sm text-bone/70 hover:text-bone" aria-label="Next month">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-bone/40">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-1">{d.slice(0, 1)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const key = day ? `${cursor.year}-${cursor.month}-${day}` : "";
          const items = day ? byDay.get(key) ?? [] : [];
          return (
            <div
              key={i}
              className={`min-h-[4.5rem] rounded-lg border p-1 ${
                day ? "border-ink-700 bg-ink-950" : "border-transparent"
              }`}
            >
              {day && (
                <>
                  <div className="mb-1 text-right text-[11px] text-bone/40">{day}</div>
                  <div className="space-y-0.5">
                    {items.slice(0, 3).map((a) => (
                      <Link
                        key={a.id}
                        href={`/jobs/${a.id}`}
                        title={`${a.title}${a.claimedByName ? ` · ${a.claimedByName}` : ""}`}
                        className="block truncate rounded bg-amber-brand/15 px-1 py-0.5 text-[10px] leading-tight text-amber-soft hover:bg-amber-brand/25"
                      >
                        {new Date(a.date!).toLocaleTimeString(undefined, { hour: "numeric" })} {a.claimedByName?.split(" ")[0] ?? a.title}
                      </Link>
                    ))}
                    {items.length > 3 && (
                      <p className="px-1 text-[10px] text-bone/40">+{items.length - 3} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
