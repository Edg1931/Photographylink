import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompany } from "@/lib/data";
import { getPhotographerRecord } from "@/lib/backend";
import { Container, Badge, Stars } from "@/components/ui";
import { ProtoAction } from "@/components/ProtoAction";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ShareProfile } from "@/components/ShareProfile";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getPhotographerRecord(params.slug);
  return {
    title: p ? `${p.name} · ${brand.name}` : "Photographer",
    description: p?.headline,
  };
}

export default async function PhotographerPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getPhotographerRecord(params.slug);
  if (!p) notFound();

  const hero = p.cover || p.portfolio[0]?.src;

  return (
    <div>
      {/* ------------------------------------------------------------- Hero */}
      <section className="grain relative h-[72vh] min-h-[540px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={`Work by ${p.name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink-950/70 to-transparent" />

        <Container className="absolute inset-x-0 top-4 z-10 flex items-center justify-between">
          <Link
            href="/photographers"
            className="rounded-full bg-ink-900/60 px-4 py-2 text-sm font-medium text-bone/80 ring-1 ring-inset ring-ink-600 backdrop-blur hover:text-bone"
          >
            ← All photographers
          </Link>
          <ShareProfile />
        </Container>

        <Container className="absolute inset-x-0 bottom-0 z-10 pb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.avatar}
              alt={p.name}
              className="h-24 w-24 rounded-2xl object-cover shadow-2xl ring-4 ring-ink-950 sm:h-28 sm:w-28"
            />
            <div className="min-w-0">
              {p.availableNow && (
                <Badge tone="green" className="mb-3">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Available for work
                </Badge>
              )}
              <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
                {p.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-bone/80">{p.headline}</p>
              <p className="mt-2 text-sm text-bone/55">
                {p.location} · works within {p.radiusMiles} mi ·{" "}
                {p.experienceYears} yrs experience
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------- Stats + rate bar */}
      <div className="sticky top-16 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur-xl">
        <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <Stars rating={p.rating} />
              <span className="text-bone/40">({p.reviewCount})</span>
            </span>
            <Stat label="experience" value={`${p.experienceYears} yrs`} />
            <Stat label="jobs" value={p.jobsCompleted.toLocaleString()} />
            <Stat label="on-time" value={`${p.onTimeRate}%`} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-display text-2xl font-semibold text-amber-soft">
                ${p.dayRate}
              </span>
              <span className="text-sm text-bone/50">/day</span>
              <span className="ml-2 text-xs text-bone/40">
                ${p.halfDayRate} half-day
              </span>
            </div>
            <ProtoAction label="Message" confirmed="Message sent" />
          </div>
        </Container>
      </div>

      {/* ---------------------------------------------------------- Body */}
      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr]">
          {/* Main — the work */}
          <div>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-3xl font-semibold">Work</h2>
              <span className="text-sm text-bone/45">
                {p.portfolio.length} photos
              </span>
            </div>
            <PhotoGallery items={p.portfolio} />

            <h2 className="mt-14 font-display text-2xl font-semibold">About</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-bone/75">
              {p.bio}
            </p>

            <h2 className="mt-14 font-display text-2xl font-semibold">
              What companies say
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

          {/* Sidebar — rate, gear, specialties, networks */}
          <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-amber-brand/25 bg-gradient-to-br from-ink-800 to-ink-900">
              <div className="p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold text-amber-soft">
                    ${p.dayRate}
                  </span>
                  <span className="text-bone/50">/ day</span>
                </div>
                <p className="mt-1 text-sm text-bone/55">
                  ${p.halfDayRate} half-day · {p.location}
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <ProtoAction
                    label={`Message ${p.name.split(" ")[0]}`}
                    confirmed="Message sent"
                    className="w-full"
                  />
                  <ProtoAction
                    label="Invite to your bench"
                    confirmed="Invite sent"
                    variant="outline"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Panel title="Specialties">
              <div className="flex flex-wrap gap-2">
                {p.specialties.map((s) => (
                  <Badge key={s} tone="amber">
                    {s}
                  </Badge>
                ))}
              </div>
            </Panel>

            <Panel title="Camera & gear">
              {p.ownsGear.length === 0 ? (
                <p className="text-sm text-bone/45">Not listed yet.</p>
              ) : (
                <ul className="space-y-2">
                  {p.ownsGear.map((g) => (
                    <li
                      key={g}
                      className="flex items-center gap-2.5 text-sm text-bone/80"
                    >
                      <CameraIcon />
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {p.networks.length > 0 && (
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
                          <p className="text-sm font-medium text-bone">{c.name}</p>
                          <p className="text-xs text-bone/50">{c.location}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Panel>
            )}

            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 text-center">
              <p className="text-sm text-bone/60">
                Love this work? Share {p.name.split(" ")[0]}&apos;s profile.
              </p>
              <div className="mt-3 flex justify-center">
                <ShareProfile />
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-semibold text-bone">{value}</span>
      <span className="text-bone/40">{label}</span>
    </span>
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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-amber-brand">
      <path d="M3 8.5A1.5 1.5 0 014.5 7h2l1-1.5h5L14 7h2A1.5 1.5 0 0117.5 8.5v7A1.5 1.5 0 0116 17H4.5A1.5 1.5 0 013 15.5v-7z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10.25" cy="11.5" r="2.75" stroke="currentColor" strokeWidth="1.4" />
    </svg>
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
