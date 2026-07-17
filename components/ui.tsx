import Link from "next/link";
import { clsx } from "@/lib/clsx";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-8xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={clsx("inline-flex items-center gap-1", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      <span className="text-amber-brand text-sm leading-none">
        {"★★★★★".slice(0, Math.floor(rounded))}
        {rounded % 1 ? "" : ""}
      </span>
      <span className="text-bone/70 text-sm font-medium tabular-nums">
        {rating.toFixed(2)}
      </span>
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "green" | "blue" | "red";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-700 text-bone/75 ring-ink-600",
    amber: "bg-amber-brand/12 text-amber-soft ring-amber-brand/25",
    green: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25",
    blue: "bg-sky-500/12 text-sky-300 ring-sky-500/25",
    red: "bg-rose-500/12 text-rose-300 ring-rose-500/25",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/60 disabled:cursor-not-allowed disabled:opacity-60";
  const variants: Record<string, string> = {
    primary:
      "bg-amber-brand text-ink-950 hover:bg-amber-soft hover:shadow-[0_8px_30px_-8px_rgba(232,169,75,0.6)]",
    ghost: "text-bone/80 hover:text-bone hover:bg-ink-700",
    outline:
      "text-bone ring-1 ring-inset ring-ink-600 hover:ring-amber-brand/50 hover:text-amber-soft",
  };
  const cls = clsx(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type ?? "button"}
      className={cls}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-brand">
      <span className="h-px w-6 bg-amber-brand/60" />
      {children}
    </span>
  );
}

export function Avatar({
  src,
  alt,
  size = 48,
  ring,
}: {
  src: string;
  alt: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={clsx(
        "rounded-full object-cover",
        ring && "ring-2 ring-ink-950 outline outline-1 outline-ink-600",
      )}
      style={{ width: size, height: size }}
    />
  );
}
