import Link from "next/link";
import { Container, SectionLabel, Badge } from "@/components/ui";
import { listInquiries, listCompanies } from "@/lib/backend";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Platform inbox · ${brand.name}` };

// The platform-side (admin) view of every inquiry across all companies.
// In production this would sit behind an admin role; for the demo it's open.
export default async function InboxPage() {
  const [inquiries, companies] = await Promise.all([
    listInquiries(),
    listCompanies(),
  ]);
  const companyBySlug = new Map(companies.map((c) => [c.slug, c]));

  return (
    <Container className="py-12 lg:py-16">
      <SectionLabel>Platform inbox</SectionLabel>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Every inquiry, as we see them
          </h1>
          <p className="mt-2 max-w-2xl text-bone/60">
            When a visitor inquires on any company&apos;s micro-site, it lands
            here (platform) and in that company&apos;s dashboard. This is the
            &quot;we&apos;re notified and the company&apos;s notified&quot; loop.
          </p>
        </div>
        <Badge tone="amber" className="text-sm">
          {inquiries.length} total
        </Badge>
      </div>

      <div className="mt-8 space-y-3">
        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 p-12 text-center text-bone/45">
            No inquiries yet. Open a{" "}
            <Link href="/companies" className="text-amber-soft hover:underline">
              company micro-site
            </Link>{" "}
            and hit “Inquire / Hire” to see one appear here.
          </div>
        ) : (
          inquiries.map((q) => {
            const company = companyBySlug.get(q.companySlug);
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-ink-700 bg-ink-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-bone">{q.name}</p>
                    <a
                      href={`mailto:${q.email}`}
                      className="text-sm text-amber-soft hover:underline"
                    >
                      {q.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="amber">{q.projectType}</Badge>
                    {company && (
                      <Link
                        href={`/companies/${company.slug}`}
                        className="rounded-full bg-ink-800 px-3 py-1 text-xs text-bone/70 hover:text-bone"
                      >
                        → {company.name}
                      </Link>
                    )}
                  </div>
                </div>
                {q.message && (
                  <p className="mt-3 text-sm text-bone/70">{q.message}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </Container>
  );
}
