"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

export function ShareProfile({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    // Use the native share sheet on mobile if available, else copy the link.
    const nav = navigator as Navigator & { share?: (d: { url: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={share}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full bg-ink-900/70 px-4 py-2 text-sm font-medium text-bone ring-1 ring-inset ring-ink-600 backdrop-blur transition-colors hover:ring-amber-brand/50",
        className,
      )}
    >
      {copied ? (
        "Link copied ✓"
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M8.7 13.5l6.6 3.8M15.3 6.7L8.7 10.5M18 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share profile
        </>
      )}
    </button>
  );
}
