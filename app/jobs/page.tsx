import { Container, SectionLabel, Badge } from "@/components/ui";
import { jobs } from "@/lib/data";
import { JobCard } from "@/components/JobCard";

export const metadata = {
  title: "Job queue · Photographylink",
};

const columns: {
  key: "open" | "claimed" | "delivered";
  title: string;
  match: (s: string) => boolean;
  hint: string;
}[] = [
  {
    key: "open",
    title: "Open — claimable",
    match: (s) => s === "open",
    hint: "First qualified pro to claim gets it",
  },
  {
    key: "claimed",
    title: "In progress",
    match: (s) => s === "claimed" || s === "scheduled",
    hint: "Claimed and scheduled",
  },
  {
    key: "delivered",
    title: "Delivered",
    match: (s) => s === "delivered",
    hint: "Shot, edited, and delivered",
  },
];

export default function JobsPage() {
  return (
    <>
      <section className="border-b border-ink-700/60 bg-ink-900/40 py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Live queue</SectionLabel>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                The job queue
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-bone/65">
                This is the heart of the platform. Companies drop jobs in; their
                trained bench claims them. No bidding, no back-and-forth — the
                first available, qualified shooter takes it.
              </p>
            </div>
            <Badge tone="amber" className="text-sm">
              <span className="live-dot h-2 w-2 rounded-full bg-amber-brand" />
              {jobs.filter((j) => j.status === "open").length} open now
            </Badge>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {columns.map((col) => {
              const list = jobs.filter((j) => col.match(j.status));
              return (
                <div key={col.key}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-bone">{col.title}</h2>
                      <p className="text-xs text-bone/45">{col.hint}</p>
                    </div>
                    <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-medium text-bone/60">
                      {list.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {list.length ? (
                      list.map((j) => <JobCard key={j.id} job={j} />)
                    ) : (
                      <p className="rounded-2xl border border-dashed border-ink-700 p-6 text-center text-sm text-bone/40">
                        Nothing here right now.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
