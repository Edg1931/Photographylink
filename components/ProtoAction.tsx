"use client";

import { useState } from "react";
import { buttonClasses, ButtonVariant } from "@/components/ui";

/**
 * A prototype CTA that gives real feedback without a backend: on click it
 * briefly confirms, so nothing on the page feels dead. Used for actions that
 * are meaningful in the product but not yet wired (invite, apply, follow, etc.).
 */
export function ProtoAction({
  label,
  confirmed,
  variant = "primary",
  className,
}: {
  label: string;
  confirmed: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      className={buttonClasses(variant, className)}
      disabled={done}
      onClick={() => {
        setDone(true);
        setTimeout(() => setDone(false), 2600);
      }}
    >
      {done ? `✓ ${confirmed}` : label}
    </button>
  );
}
