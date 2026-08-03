import { notFound } from "next/navigation";
import Link from "next/link";
import { getPhotographer } from "@/lib/data";
import { getCompany } from "@/lib/backend";
import { listJobs } from "@/lib/store";
import { Container, Badge, Button, Stars, Avatar } from "@/components/ui";
import { JobCard } from "@/components/JobCard";
import { InquireButton } from "@/components/InquireButton";
import { ApplyButton } from "@/components/ApplyButton";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const c = await getCompany(params.slug);
  return { title: c ? `${c.name} · ${brand.name}` : "Company" };
}

const policyCopy = {
  provided: "Equipment provided",
  byo: "Bring your own kit",
  either: "Gear provided or BYO",
};

export default async function CompanyPage({
  params,
}: {
  params: { slug: string };
}) {
  const c = await getCompany(params.slug);
  if (!c) notFound();

  const accent = c.accent;
  const allJobs = await listJobs();
  const jobs = allJobs.filter((j) => j.companySlug === c.slug);
  const openCount = jobs.filter((j) => j.status === "open").length;

  return (
    <>
      {/* Branded hero — this is the "templated micro-site" */}
      <section className="relative">
        <div className="relative h-72 overflow-hidden sm:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.cover} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, #0a0a0b 8%, rgba(10,10,11,0.35) 55%, ${accent}22 100%)`,
            }}
          />
        </div>

        <Container className="relative -mt-24 pb-4">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-bold text-ink-950 shadow-xl"
                style={{ background: accent }}
              >
                {c.logoMark}
              </span>
              <div className="pb-1">
                <h1 className="font-display text-4xl font-semibold sm:text-5xl">
                  {c.name}
                </h1>
                <p className="mt-1 text-lg text-bone/70">{c.tagline}</p>
                <div className="mt-2 flex items-center gap-4">
                  <Stars rating={c.rating} />
                  <span className="text-sm text-bone/45">
                    {c.reviewCount} reviews · {c.shootsPerMonth} shoots/mo
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              <InquireButton companySlug={c.slug} companyName={c.name} />
              <ApplyButton
                companySlug={c.slug}
                companyName={c.name}
                variant="outline"
              />
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-20 pt-10">
        {/* Markets + specialties strip */}
        <div className="flex flex-wrap items-center gap-2 border-y border-ink-700 py-4">
          <span className="text-xs uppercase tracking-widest text-bone/40">
            Markets
          </span>
          {c.markets.map((m) => (
            <Badge key={m}>{m}</Badge>
          ))}
          <span className="ml-4 text-xs uppercase tracking-widest text-bone/40">
            Shoots
          </span>
          {c.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {/* About */}
            <h2 className="font-display text-2xl font-semibold">
              About {c.name.split(" ")[0]}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-bone/70">
              {c.about}
            </p>

            {/* Offerings & pricing */}
            {c.offerings.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl font-semibold">
                  Services & pricing
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {c.offerings.map((o) => (
                    <div
                      key={o.title}
                      className="rounded-2xl border border-ink-700 bg-ink-900 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-bone">{o.title}</h3>
                        <div className="shrink-0 text-right">
                          <span
                            className="font-display text-xl font-semibold"
                            style={{ color: accent }}
                          >
                            ${o.price}
                          </span>
                          <p className="text-[11px] text-bone/45">{o.unit}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-bone/60">{o.blurb}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Working with us — requirements + pay terms */}
            <h2 className="mt-10 font-display text-2xl font-semibold">
              Working with us
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <WorkPanel accent={accent} label="How you get paid" body={c.payTerms} highlight />
              <WorkPanel accent={accent} label="Equipment we expect" body={c.wantsEquipment} />
              <WorkPanel accent={accent} label="Experience we want" body={c.wantsExperience} />
            </div>
            <div className="mt-4">
              <ApplyButton companySlug={c.slug} companyName={c.name} />
            </div>

            {/* Showcase gallery */}
            <h2 className="mt-10 font-display text-2xl font-semibold">
              Our work
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.showcase.map((s, i) => (
                <figure
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-ink-700 ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt={s.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </figure>
              ))}
            </div>

            {/* Open jobs */}
            <div className="mt-10 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                Open jobs
              </h2>
              {openCount > 0 && (
                <Badge tone="amber">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-amber-brand" />
                  {openCount} claimable now
                </Badge>
              )}
            </div>
            <div className="mt-5 space-y-4">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </div>

          {/* Sidebar: the pitch to photographers */}
          <aside className="space-y-6">
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: `${accent}40`, background: `${accent}0d` }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-bone/50">
                What we pay
              </h3>
              <p className="mt-2">
                <span
                  className="font-display text-3xl font-semibold"
                  style={{ color: accent }}
                >
                  ${c.baseDayRate}
                </span>
                <span className="text-bone/55"> base / day</span>
              </p>
              <p className="mt-3 text-sm font-medium text-bone/80">
                {policyCopy[c.equipmentPolicy]}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-bone/55">
                {c.equipmentNotes}
              </p>
            </div>

            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-bone/40">
                Why shooters join
              </h3>
              <ul className="space-y-3">
                {c.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 text-sm text-bone/75"
                  >
                    <span style={{ color: accent }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {/* The bench roster */}
            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <h3 className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-bone/40">
                The bench
                <span className="text-bone/30">{c.bench.length} shooters</span>
              </h3>
              <div className="space-y-2">
                {c.bench.map((slot) => {
                  const p = getPhotographer(slot.photographerSlug);
                  if (!p) return null;
                  return (
                    <Link
                      key={slot.photographerSlug}
                      href={`/photographers/${p.slug}`}
                      className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-950 p-2.5 transition-colors hover:border-ink-600"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={p.avatar} alt={p.name} size={36} />
                        <div>
                          <p className="text-sm font-medium text-bone">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-bone/50">
                            ★ {p.rating} · {p.specialties[0]}
                          </p>
                        </div>
                      </div>
                      {slot.status === "onboarding" ? (
                        <Badge tone="blue">Onboarding</Badge>
                      ) : (
                        <Badge tone="green">Trained</Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-bone/40">
                A rated, style-matched stable — jobs go to whoever claims first.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function WorkPanel({
  accent,
  label,
  body,
  highlight,
}: {
  accent: string;
  label: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={
        highlight
          ? { borderColor: `${accent}40`, background: `${accent}0d` }
          : { borderColor: "#1f1f23", background: "#101012" }
      }
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-bone/50">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-bone/75">
        {body || "—"}
      </p>
    </div>
  );
}
