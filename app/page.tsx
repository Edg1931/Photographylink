import Link from "next/link";
import { Container, Button, Badge, SectionLabel, Stars } from "@/components/ui";
import { PhotographerCard } from "@/components/PhotographerCard";
import { photographers, companies, openJobs } from "@/lib/data";
import { QueueDemo } from "@/components/QueueDemo";
import { Reveal } from "@/components/Reveal";
import { brand } from "@/lib/brand";

export default function HomePage() {
  const featured = photographers.slice(0, 4);
  const lumen = companies[0];
  const open = openJobs();

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="grain relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-amber-brand/10 blur-[120px]" />
          <div className="absolute -right-40 top-40 h-[36rem] w-[36rem] rounded-full bg-sky-500/10 blur-[120px]" />
        </div>

        <Container className="relative grid items-center gap-12 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
          <div className="reveal">
            <Badge tone="amber" className="mb-6">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-amber-brand" />
              {open.length} shoots open right now in Central Texas
            </Badge>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              Build a bench.
              <br />
              <span className="text-amber-brand">Claim the queue.</span>
              <br />
              Never turn down a shoot.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/70">
              {brand.name} connects photography companies with a trained,
              rated bench of freelance shooters. Post a job to your queue — the
              first qualified pro in the area claims it. Consistency without the
              constant re-hiring.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/how-it-works" className="px-6 py-3 text-base">
                I run a photography company
              </Button>
              <Button
                href="/photographers"
                variant="outline"
                className="px-6 py-3 text-base"
              >
                I&apos;m a photographer
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {photographers.slice(0, 5).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.slug}
                    src={p.avatar}
                    alt={p.name}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-ink-950"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="text-sm text-bone/60">
                <span className="font-semibold text-bone">2,400+ shooters</span>{" "}
                across 40 markets · <Stars rating={4.93} className="align-middle" />
              </div>
            </div>
          </div>

          {/* Hero collage */}
          <div className="reveal relative" style={{ animationDelay: "0.1s" }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <HeroTile
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80"
                  className="aspect-[3/4]"
                />
                <HeroTile
                  src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=80"
                  className="aspect-square"
                />
              </div>
              <div className="space-y-3 pt-8">
                <HeroTile
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=700&q=80"
                  className="aspect-square"
                />
                <HeroTile
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80"
                  className="aspect-[3/4]"
                />
              </div>
            </div>
            {/* Floating claim card */}
            <div
              className="reveal absolute -bottom-4 -left-4 w-60 rounded-2xl border border-ink-600 bg-ink-800/95 p-4 shadow-2xl backdrop-blur"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2 text-xs text-bone/60">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Job claimed · 12s ago
              </div>
              <p className="mt-2 text-sm font-semibold">
                Downtown condo + drone
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-bone/55">Rainey District</span>
                <span className="text-sm font-semibold text-amber-soft">
                  $275
                </span>
              </div>
            </div>
          </div>
        </Container>

        {/* Trust marquee */}
        <div className="relative border-y border-ink-700/60 bg-ink-900/50 py-5">
          <div className="flex overflow-hidden">
            <div className="marquee-track flex shrink-0 items-center gap-12 pr-12 text-sm font-medium uppercase tracking-widest text-bone/35">
              {MARQUEE.concat(MARQUEE).map((t, i) => (
                <span key={i} className="flex items-center gap-12">
                  {t}
                  <span className="text-amber-brand/40">◎</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Problem */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              One photographer quits and your whole calendar is at risk.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-bone/65">
              If you run a photography company, you know the trap: you can only
              take as many jobs as your shooters have hours. Someone leaves, and
              you&apos;re back to posting ads, training from scratch, and hoping
              the quality holds. Growth stalls the moment you&apos;re
              capacity-capped.
            </p>
          </div>

          <Reveal className="mt-14 grid gap-5 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-ink-700 bg-ink-900 p-6"
              >
                <div className="text-2xl">{p.icon}</div>
                <h3 className="mt-4 font-semibold text-bone">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bone/60">
                  {p.body}
                </p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------------- The queue (hero) */}
      <section className="relative overflow-hidden border-y border-ink-700/60 bg-ink-900/40 py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionLabel>The core idea</SectionLabel>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              A trained bench that claims from a queue.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-bone/65">
              Instead of one photographer with finite hours, keep a stable of
              vetted shooters who already know your style. Drop a job into the
              queue and the first qualified, available, well-rated pro claims
              it. You scale past any single person&apos;s calendar.
            </p>
            <ul className="mt-8 space-y-4">
              {QUEUE_POINTS.map((q) => (
                <li key={q.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-brand/15 text-xs text-amber-soft">
                    ✓
                  </span>
                  <div>
                    <p className="font-medium text-bone">{q.title}</p>
                    <p className="text-sm text-bone/60">{q.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/jobs" variant="outline">
                See a live queue →
              </Button>
            </div>
          </div>

          <QueueDemo />
        </Container>
      </section>

      {/* --------------------------------------------------- Two-sided value */}
      <section className="py-20 lg:py-28">
        <Container>
          <Reveal className="grid gap-5 lg:grid-cols-2">
            <ValueCard
              tone="amber"
              eyebrow="For companies"
              title="Scale without the hiring treadmill"
              points={[
                "Build a bench of pre-trained, rated photographers",
                "Post overflow, vacation, and multi-shooter jobs to a queue",
                "Advertise your rates & equipment policy up front",
                "A branded micro-site that showcases your work",
              ]}
              href="/how-it-works"
              cta="Build your bench"
            />
            <ValueCard
              tone="blue"
              eyebrow="For photographers"
              title="Steady freelance work, on your terms"
              points={[
                "Set the rate and radius you'll work for",
                "Claim jobs that fit your schedule — no bidding wars",
                "Carry your rating between every company you shoot for",
                "A portfolio site that sells you while you sleep",
              ]}
              href="/photographers"
              cta="Create your profile"
            />
          </Reveal>
        </Container>
      </section>

      {/* -------------------------------------------------- Featured shooters */}
      <section className="py-4 lg:pb-24">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <SectionLabel>Available now</SectionLabel>
              <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                Photographers ready to work
              </h2>
            </div>
            <Link
              href="/photographers"
              className="hidden text-sm font-medium text-amber-soft hover:text-amber-brand sm:block"
            >
              Browse all →
            </Link>
          </div>
          <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <PhotographerCard key={p.slug} p={p} />
            ))}
          </Reveal>
        </Container>
      </section>

      {/* ---------------------------------------------- Company micro-site */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel>Templated micro-sites</SectionLabel>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Every company and shooter gets a site worth sharing.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-bone/65">
                Click any profile and you land on a beautiful, branded page — the
                company&apos;s work, their bench, their rates and equipment
                policy. Photographers get the same: a portfolio that displays
                their best frames, specialties, and reviews. No separate website
                to build or pay for.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={`/companies/${lumen.slug}`}>
                  View a company site →
                </Button>
                <Button href="/photographers/maya-okafor" variant="ghost">
                  View a photographer →
                </Button>
              </div>
            </div>

            <Link
              href={`/companies/${lumen.slug}`}
              className="group relative block overflow-hidden rounded-3xl border border-ink-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lumen.cover}
                alt={lumen.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-ink-950"
                    style={{ background: lumen.accent }}
                  >
                    {lumen.logoMark}
                  </span>
                  <div>
                    <p className="font-semibold text-bone">{lumen.name}</p>
                    <p className="text-sm text-bone/65">{lumen.tagline}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lumen.specialties.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="pb-8">
        <Container>
          <div className="grain relative overflow-hidden rounded-3xl border border-amber-brand/20 bg-gradient-to-br from-ink-800 to-ink-900 px-8 py-16 text-center">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-brand/15 blur-3xl" />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Your next shoot shouldn&apos;t depend on one person showing up.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-bone/65">
              Join the network built for the way photography companies actually
              grow.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/how-it-works" className="px-6 py-3 text-base">
                Get started free
              </Button>
              <Button
                href="/jobs"
                variant="outline"
                className="px-6 py-3 text-base"
              >
                Explore the queue
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function HeroTile({ src, className }: { src: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-ink-700 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Photography sample"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
}

function ValueCard({
  tone,
  eyebrow,
  title,
  points,
  href,
  cta,
}: {
  tone: "amber" | "blue";
  eyebrow: string;
  title: string;
  points: string[];
  href: string;
  cta: string;
}) {
  const glow =
    tone === "amber" ? "from-amber-brand/15" : "from-sky-500/15";
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-ink-700 bg-ink-900 p-8">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`}
      />
      <p
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          tone === "amber" ? "text-amber-brand" : "text-sky-400"
        }`}
      >
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-2xl font-semibold leading-snug">
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {points.map((pt) => (
          <li key={pt} className="flex items-start gap-3 text-sm text-bone/75">
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "amber" ? "bg-amber-brand" : "bg-sky-400"
              }`}
            />
            {pt}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button href={href} variant="outline">
          {cta} →
        </Button>
      </div>
    </div>
  );
}

const MARQUEE = [
  "Real Estate",
  "Twilight",
  "Drone & Aerial",
  "Listing Video",
  "3D Tours",
  "Architecture",
  "Interiors",
];

const PROBLEMS = [
  {
    icon: "🔁",
    title: "Constant re-hiring",
    body: "A shooter leaves and you're back to job ads, interviews, and weeks of training before they're trusted on a client's listing.",
  },
  {
    icon: "📉",
    title: "Inconsistent quality",
    body: "Every new photographer shoots a little differently. Clients notice when the gallery doesn't match what you sold them.",
  },
  {
    icon: "⛔",
    title: "Capacity-capped",
    body: "One photographer, full calendar, no overflow plan. You turn down work — or burn out the person you have.",
  },
];

const QUEUE_POINTS = [
  {
    title: "Post once, cover instantly",
    body: "Vacation, a sick day, or a five-house Saturday — drop it in the queue and it gets claimed.",
  },
  {
    title: "Only your trained shooters see it",
    body: "The bench is vetted and style-matched, so whoever claims it already knows how you deliver.",
  },
  {
    title: "Ratings keep the bar high",
    body: "On-time rate, quality scores, and reviews travel with each photographer across every job.",
  },
];
