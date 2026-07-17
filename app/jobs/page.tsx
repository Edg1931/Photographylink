import { Container, SectionLabel, Badge } from "@/components/ui";
import { photographers, companies, allSpecialties } from "@/lib/data";
import { JobQueueBoard } from "@/components/JobQueueBoard";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Job queue · ${brand.name}`,
};

export default function JobsPage() {
  return (
    <>
      <section className="border-b border-ink-700/60 bg-ink-900/40 py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <SectionLabel>Live queue · real claim engine</SectionLabel>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                The job queue
              </h1>
              <p className="mt-4 text-lg text-bone/65">
                This board is backed by a real server. Open a job to the whole
                bench, or{" "}
                <span className="text-sky-300">offer it directly</span> to one
                photographer when a client requests them. Claims are{" "}
                <strong className="text-bone">atomic</strong> — hit{" "}
                <span className="text-amber-soft">“simulate 5 racing”</span> and
                exactly one wins every time. The activity log confirms it.
              </p>
            </div>
            <Badge tone="amber" className="text-sm">
              <span className="live-dot h-2 w-2 rounded-full bg-amber-brand" />
              First-to-claim wins
            </Badge>
          </div>

          {/* How atomic claiming works */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-xl border border-ink-700 bg-ink-950 p-4"
              >
                <span className="text-xs font-semibold text-amber-brand">
                  0{i + 1}
                </span>
                <p className="mt-1 text-sm font-medium text-bone">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-bone/55">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <JobQueueBoard
            photographers={photographers}
            companies={companies}
            specialties={allSpecialties}
          />
        </Container>
      </section>
    </>
  );
}

const STEPS = [
  {
    title: "A job hits the queue",
    body: "A company posts it; every trained photographer on the bench can see and claim it instantly.",
  },
  {
    title: "The claim is serialized",
    body: "A server-side mutex processes claims one at a time — the same guarantee a database gives with a conditional update.",
  },
  {
    title: "Exactly one winner",
    body: "The first claim flips the job to ‘claimed’. Every later claim on that job is rejected, no double-booking.",
  },
];
