import { redirect } from "next/navigation";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { Dashboard } from "@/components/Dashboard";
import { currentAccount } from "@/lib/session";
import {
  getCompany,
  listInquiries,
  getPhotographerRecord,
  listNotifications,
} from "@/lib/backend";
import { listJobs } from "@/lib/store";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Dashboard · ${brand.name}` };

export default async function DashboardPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");

  // Company owners get the full control center.
  if (account.role === "company" && account.companySlug) {
    const company = await getCompany(account.companySlug);
    if (!company) redirect("/login");
    const [inquiries, allJobs] = await Promise.all([
      listInquiries(account.companySlug),
      listJobs(),
    ]);
    const jobs = allJobs.filter((j) => j.companySlug === company.slug);
    const notifications = listNotifications(company.slug);
    return (
      <Container className="py-10 lg:py-14">
        <Dashboard
          account={{ displayName: account.displayName, email: account.email }}
          company={company}
          inquiries={inquiries}
          jobs={jobs}
          notifications={notifications}
        />
      </Container>
    );
  }

  // Photographer accounts — self-serve profile editor.
  if (account.role === "photographer" && account.photographerSlug) {
    const photographer = await getPhotographerRecord(account.photographerSlug);
    if (photographer) {
      return (
        <Container className="py-10 lg:py-14">
          <PhotographerDashboard
            account={{ displayName: account.displayName, email: account.email }}
            photographer={photographer}
          />
        </Container>
      );
    }
  }

  // Fallback (older accounts without a linked profile).
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-ink-700 bg-ink-900 p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">
          Welcome, {account.displayName}
        </h1>
        <p className="mt-2 text-bone/60">
          Browse open jobs and claim the ones that fit your schedule.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button href="/jobs">Find work in the queue →</Button>
          <Button href="/photographers" variant="outline">
            See photographer profiles
          </Button>
        </div>
        <Link href="/" className="mt-6 block text-sm text-bone/45 hover:text-bone">
          Back to home
        </Link>
      </div>
    </Container>
  );
}
