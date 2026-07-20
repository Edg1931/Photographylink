import Link from "next/link";
import { Container, SectionLabel, Badge, Stars, Button } from "@/components/ui";
import { listCompanies } from "@/lib/backend";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Photography companies · ${brand.name}`,
};

export default function CompaniesDirectory() {
  const companies = listCompanies();

  return (
    <>
      <section className="border-b border-ink-700/60 bg-ink-900/40 py-14">
        <Container>
          <SectionLabel>Hire a studio</SectionLabel>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Find a photography company for your shoot.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bone/65">
            Browse studios by market and specialty. Open a micro-site to see
            their work, services, and pricing — then send an inquiry and
            they&apos;ll reach out.
          </p>
        </Container>
      </section>

      <section className="py-10 lg:py-14">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <div
                key={c.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-all duration-300 hover:-translate-y-1 hover:border-amber-brand/40"
              >
                <Link href={`/companies/${c.slug}`} className="relative block">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.cover}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold text-ink-950"
                        style={{ background: c.accent }}
                      >
                        {c.logoMark}
                      </span>
                      <div>
                        <p className="font-semibold leading-tight text-bone">
                          {c.name}
                        </p>
                        <p className="text-xs text-bone/65">{c.location}</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm text-bone/70">{c.tagline}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.specialties.slice(0, 3).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-3">
                    {c.reviewCount > 0 ? (
                      <Stars rating={c.rating} />
                    ) : (
                      <span className="text-xs text-bone/40">New studio</span>
                    )}
                    <span className="text-sm text-bone/70">
                      from{" "}
                      <span className="font-semibold text-bone">
                        ${c.baseDayRate}
                      </span>
                    </span>
                  </div>
                  <Button
                    href={`/companies/${c.slug}`}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    View & inquire →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
