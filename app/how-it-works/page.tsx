import { Container, SectionLabel, Button, Badge } from "@/components/ui";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `How it works · ${brand.name}`,
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="grain relative overflow-hidden border-b border-ink-700/60 py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-brand/10 blur-[110px]" />
        <Container className="relative">
          <SectionLabel>How it works</SectionLabel>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Two sides, one network, zero cold-hiring.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-bone/65">
            {brand.name} is a marketplace with a twist: instead of one-off
            gigs, companies build a lasting bench and dispatch work through a
            queue. Here&apos;s how each side moves.
          </p>
        </Container>
      </section>

      {/* Companies */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="flex items-center gap-3">
            <Badge tone="amber">For photography companies</Badge>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold">
            Build a bench you can count on
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {COMPANY_STEPS.map((s, i) => (
              <Step key={s.title} n={i + 1} {...s} />
            ))}
          </div>
        </Container>
      </section>

      {/* Photographers */}
      <section className="border-y border-ink-700/60 bg-ink-900/40 py-16 lg:py-20">
        <Container>
          <div className="flex items-center gap-3">
            <Badge tone="blue">For photographers</Badge>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold">
            Find steady work without the hustle
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {SHOOTER_STEPS.map((s, i) => (
              <Step key={s.title} n={i + 1} tone="blue" {...s} />
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing sketch */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-4 font-display text-3xl font-semibold">
              Free to join. We grow when you do.
            </h2>
            <p className="mt-4 text-bone/65">
              A working sketch of the model — photographers keep their full rate;
              companies pay only for the tools that help them scale.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border p-7 ${
                  p.featured
                    ? "border-amber-brand/40 bg-amber-brand/5"
                    : "border-ink-700 bg-ink-900"
                }`}
              >
                {p.featured && (
                  <Badge tone="amber" className="mb-3">
                    Most popular
                  </Badge>
                )}
                <h3 className="font-semibold text-bone">{p.name}</h3>
                <p className="mt-2">
                  <span className="font-display text-3xl font-semibold">
                    {p.price}
                  </span>
                  <span className="text-bone/50">{p.per}</span>
                </p>
                <p className="mt-1 text-sm text-bone/55">{p.who}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-bone/75"
                    >
                      <span className="text-amber-brand">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.featured ? "primary" : "outline"}
                  className="mt-6 w-full"
                  href="/signup"
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-8">
        <Container>
          <div className="grain relative overflow-hidden rounded-3xl border border-amber-brand/20 bg-gradient-to-br from-ink-800 to-ink-900 px-8 py-14 text-center">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold">
              Ready to stop re-hiring and start scaling?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/photographers" className="px-6 py-3 text-base">
                Explore the marketplace
              </Button>
              <Button
                href="/jobs"
                variant="outline"
                className="px-6 py-3 text-base"
              >
                See the queue
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Step({
  n,
  title,
  body,
  tone = "amber",
}: {
  n: number;
  title: string;
  body: string;
  tone?: "amber" | "blue";
}) {
  return (
    <div className="relative rounded-2xl border border-ink-700 bg-ink-900 p-6">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-semibold ${
          tone === "amber"
            ? "bg-amber-brand/15 text-amber-soft"
            : "bg-sky-500/15 text-sky-300"
        }`}
      >
        {n}
      </span>
      <h3 className="mt-4 font-semibold text-bone">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-bone/60">{body}</p>
    </div>
  );
}

const COMPANY_STEPS = [
  {
    title: "Publish your profile",
    body: "Get a branded micro-site showcasing your work, your markets, and the rates + equipment policy you offer shooters.",
  },
  {
    title: "Recruit your bench",
    body: "Invite photographers or accept applicants. Onboard them to your style guide once — they stay trained.",
  },
  {
    title: "Post jobs to the queue",
    body: "Overflow, vacations, multi-shooter days — drop the job in and your whole bench is notified instantly.",
  },
  {
    title: "First qualified pro claims it",
    body: "No bidding, no chasing. The job is covered by someone who already knows how you deliver.",
  },
];

const SHOOTER_STEPS = [
  {
    title: "Build your portfolio",
    body: "A gallery site that shows your best frames, specialties, gear, and the rate + radius you'll work for.",
  },
  {
    title: "Join company networks",
    body: "Apply to companies whose rates and style fit you. Get trained once, then you're on the bench.",
  },
  {
    title: "Claim jobs that fit",
    body: "See queued jobs from every company you shoot for. Claim the ones that match your schedule.",
  },
  {
    title: "Grow your rating",
    body: "On-time arrivals and quality reviews build a reputation that follows you everywhere you shoot.",
  },
];

const PLANS = [
  {
    name: "Photographer",
    price: "$0",
    per: "/forever",
    who: "For freelance shooters",
    featured: false,
    cta: "Create profile",
    features: [
      "Portfolio micro-site",
      "Join unlimited networks",
      "Claim jobs from the queue",
      "Keep 100% of your rate",
      "Portable rating & reviews",
    ],
  },
  {
    name: "Studio",
    price: "$79",
    per: "/mo",
    who: "For growing companies",
    featured: true,
    cta: "Start free trial",
    features: [
      "Branded company micro-site",
      "Bench of up to 15 shooters",
      "Unlimited queued jobs",
      "Ratings & on-time tracking",
      "Scheduling & client comms tools",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    per: "",
    who: "For multi-market operators",
    featured: false,
    cta: "Talk to us",
    features: [
      "Unlimited bench & markets",
      "White-label micro-sites",
      "Team roles & permissions",
      "API + payouts integration",
      "Priority support",
    ],
  },
];
