import Link from "next/link";
import { Container } from "@/components/ui";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-700/70 bg-ink-900">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-brand text-ink-950 font-bold">
                ◎
              </span>
              <span className="text-[17px] font-semibold">
                {brand.wordmark.head}
                <span className="text-amber-brand">{brand.wordmark.tail}</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone/55">
              The network where photography companies build a trained bench and
              working photographers find steady, transparent freelance work.
            </p>
          </div>

          <FooterCol
            title="For photographers"
            links={[
              ["Browse work", "/jobs"],
              ["Find photographers", "/photographers"],
              ["Create your profile", "/signup"],
            ]}
          />
          <FooterCol
            title="For companies"
            links={[
              ["Build your bench", "/how-it-works"],
              ["Post to the queue", "/jobs"],
              ["Hire a studio", "/companies"],
            ]}
          />
          <FooterCol
            title="Platform"
            links={[
              ["How it works", "/how-it-works"],
              ["Sign up", "/signup"],
              ["Log in", "/login"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-700/70 pt-6 text-sm text-bone/45 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {brand.name}. Prototype.
          </p>
          <p className="text-bone/40">
            Built as a working concept · mock data throughout
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-bone/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-bone/65 transition-colors hover:text-amber-soft"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
