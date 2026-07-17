import { notFound } from "next/navigation";
import Link from "next/link";
import {
  photographers,
  getPhotographer,
  getCompany,
} from "@/lib/data";
import { Container, Badge, Button, Stars } from "@/components/ui";

export function generateStaticParams() {
  return photographers.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPhotographer(params.slug);
  return { title: p ? `${p.name} · Photographylink` : "Photographer" };
}

export default function PhotographerPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = getPhotographer(params.slug);
  if (!p) notFound();

  const stats = [
    { label: "Rating", value: p.rating.toFixed(2), sub: `${p.reviewCount} reviews` },
    { label: "Jobs done", value: p.jobsCompleted.toLocaleString(), sub: "all-time" },
    { label: "On-time", value: `${p.onTimeRate}%`, sub: "arrival rate" },
    { label: "Responds", value: `~${p.responseHours}h`, sub: "avg reply" },
  ];

  return (
    <>
      {/* Cover */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.cover}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </div>

      <Container className="relative -mt-20 pb-20">
        {/* Header card */}
        <div className="relative rounded-3xl border border-ink-700 bg-ink-900/95 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.avatar}
                alt={p.name}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-ink-900 sm:h-28 sm:w-28"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                    {p.name}
                  </h1>
                  {p.availableNow && (
                    <Badge tone="green">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Available
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-bone/60">
                  {p.location} · works within {p.radiusMiles} mi
                </p>
                <div className="mt-2">
                  <Stars rating={p.rating} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="text-right">
                <span className="font-display text-3xl font-semibold text-amber-soft">
                  ${p.dayRate}
                </span>
                <span className="text-bone/50">/day</span>
                <p className="text-sm text-bone/45">
                  ${p.halfDayRate} half-day
                </p>
              </div>
              <div className="flex gap-2">
                <Button>Invite to bench</Button>
                <Button variant="outline">Message</Button>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-bone/80">
            {p.headline}
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-ink-700 bg-ink-950 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-bone/40">
                  {s.label}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {s.value}
                </p>
                <p className="text-xs text-bone/45">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Portfolio */}
          <div>
            <h2 className="font-display text-2xl font-semibold">Portfolio</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {p.portfolio.map((shot, i) => (
                <figure
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-ink-700 ${
                    i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    alt={shot.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink-950/90 to-transparent p-3 text-sm text-bone/90 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    {shot.label}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* About */}
            <h2 className="mt-10 font-display text-2xl font-semibold">About</h2>
            <p className="mt-4 leading-relaxed text-bone/70">{p.bio}</p>

            {/* Reviews */}
            <h2 className="mt-10 font-display text-2xl font-semibold">
              What companies say
            </h2>
            <div className="mt-5 space-y-4">
              {REVIEWS.map((r) => (
                <blockquote
                  key={r.author}
                  className="rounded-2xl border border-ink-700 bg-ink-900 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-bone">
                      {r.author}
                    </span>
                    <span className="text-amber-brand">
                      {"★".repeat(r.stars)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-bone/70">
                    “{r.body}”
                  </p>
                </blockquote>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Panel title="Specialties">
              <div className="flex flex-wrap gap-2">
                {p.specialties.map((s) => (
                  <Badge key={s} tone="amber">
                    {s}
                  </Badge>
                ))}
              </div>
            </Panel>

            <Panel title="Owns & shoots with">
              <ul className="space-y-2">
                {p.ownsGear.map((g) => (
                  <li
                    key={g}
                    className="flex items-center gap-2 text-sm text-bone/75"
                  >
                    <span className="text-amber-brand">▸</span>
                    {g}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Shoots for">
              <div className="space-y-2">
                {p.networks.map((slug) => {
                  const c = getCompany(slug);
                  if (!c) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/companies/${slug}`}
                      className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-950 p-3 transition-colors hover:border-amber-brand/40"
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-ink-950"
                        style={{ background: c.accent }}
                      >
                        {c.logoMark}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-bone">
                          {c.name}
                        </p>
                        <p className="text-xs text-bone/50">{c.location}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Panel>

            <div className="rounded-2xl border border-amber-brand/25 bg-amber-brand/5 p-5">
              <p className="text-sm text-bone/75">
                Want {p.name.split(" ")[0]} on your bench? Invite them to your
                network and they&apos;ll see jobs you post to the queue.
              </p>
              <Button className="mt-4 w-full">Invite to bench</Button>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

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
      {children}
    </div>
  );
}

const REVIEWS = [
  {
    author: "Lumen Estates Media",
    stars: 5,
    body: "Claims fast, never misses a call time, and the edits match our house style out of the box. Exactly what a bench shooter should be.",
  },
  {
    author: "Summit Property Media",
    stars: 5,
    body: "We threw a last-minute twilight add-on into the queue at 4pm and it was shot and delivered by the next morning. Total pro.",
  },
];
