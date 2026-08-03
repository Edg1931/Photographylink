import { Container, SectionLabel } from "@/components/ui";
import { allSpecialties } from "@/lib/data";
import { listPhotographers } from "@/lib/backend";
import { PhotographerBrowser } from "@/components/PhotographerBrowser";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Find photographers · ${brand.name}`,
};

export default async function PhotographersPage() {
  const photographers = await listPhotographers();
  return (
    <>
      <section className="border-b border-ink-700/60 bg-ink-900/40 py-14">
        <Container>
          <SectionLabel>The marketplace</SectionLabel>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Qualified photographers, ready to join your bench.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-bone/65">
            Filter by specialty and availability. Every shooter lists the rate
            and radius they&apos;ll work for, and carries a rating that follows
            them across every company.
          </p>
        </Container>
      </section>

      <section className="py-10 lg:py-14">
        <Container>
          <PhotographerBrowser
            photographers={photographers}
            specialties={allSpecialties}
          />
        </Container>
      </section>
    </>
  );
}
