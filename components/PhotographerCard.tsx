import Link from "next/link";
import { Photographer } from "@/lib/data";
import { Badge, Stars, Avatar } from "@/components/ui";

export function PhotographerCard({ p }: { p: Photographer }) {
  return (
    <Link
      href={`/photographers/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-all duration-300 hover:-translate-y-1 hover:border-amber-brand/40 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.portfolio[0]?.src}
          alt={`Work by ${p.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
        {p.availableNow && (
          <div className="absolute left-3 top-3">
            <Badge tone="green">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Available now
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <Avatar src={p.avatar} alt={p.name} size={44} ring />
          <div>
            <p className="text-sm font-semibold leading-tight text-bone">
              {p.name}
            </p>
            <p className="text-xs text-bone/70">{p.location}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm leading-snug text-bone/80">
          {p.headline}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.specialties.slice(0, 3).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-3">
          <div className="flex items-center gap-3">
            <Stars rating={p.rating} />
            <span className="text-xs text-bone/45">({p.reviewCount})</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-bone">
              ${p.dayRate}
            </span>
            <span className="text-xs text-bone/45">/day</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
