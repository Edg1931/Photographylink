"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, Button } from "@/components/ui";
import { brand } from "@/lib/brand";
import { clsx } from "@/lib/clsx";

const links = [
  { href: "/photographers", label: "Find photographers" },
  { href: "/companies/lumen-estates", label: "For companies" },
  { href: "/jobs", label: "Job queue" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-brand text-ink-950">
            <ApertureMark />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            {brand.wordmark.head}
            <span className="text-amber-brand">{brand.wordmark.tail}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-bone/70 transition-colors hover:bg-ink-700 hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/photographers"
            className="hidden text-sm font-medium text-bone/70 hover:text-bone sm:block"
          >
            Log in
          </Link>
          <Button href="/how-it-works" className="hidden px-4 py-2 sm:inline-flex">
            Get started
          </Button>
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-bone/80 hover:bg-ink-700 md:hidden"
          >
            <Burger open={open} />
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={clsx(
          "overflow-hidden border-ink-700/70 bg-ink-950/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          open ? "max-h-96 border-t" : "max-h-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-bone/80 hover:bg-ink-800"
            >
              {l.label}
            </Link>
          ))}
          <Button
            href="/how-it-works"
            className="mt-2 w-full"
          >
            Get started
          </Button>
        </Container>
      </div>
    </header>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d={open ? "M5 5l10 10M15 5L5 15" : "M3 6h14M3 10h14M3 14h14"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ApertureMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3l4.5 7.8M21 12h-9M16.5 20.2L12 12.4M3 12l7.8-4.5M7.5 20.2L12 12.4M12 21l-4.5-7.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
