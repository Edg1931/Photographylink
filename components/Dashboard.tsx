"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Company,
  Offering,
  Specialty,
  Member,
  Job,
  allSpecialties,
} from "@/lib/data";
import { Button, Badge } from "@/components/ui";
import { PostJobForm } from "@/components/PostJobForm";
import { MonthCalendar } from "@/components/MonthCalendar";
import { economicsFor, money } from "@/lib/economics";
import { clsx } from "@/lib/clsx";

interface Inquiry {
  id: string;
  companySlug: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: number;
  read: boolean;
}

interface Notification {
  id: string;
  type: "application" | "claim" | "inquiry";
  text: string;
  href?: string;
  at: number;
  read: boolean;
}

type Tab =
  | "overview"
  | "schedule"
  | "bench"
  | "broadcast"
  | "books"
  | "leads"
  | "activity"
  | "page";

export function Dashboard({
  account,
  company,
  inquiries: initialInquiries,
  jobs: initialJobs,
  notifications: initialNotifications,
}: {
  account: { displayName: string; email: string };
  company: Company;
  inquiries: Inquiry[];
  jobs: Job[];
  notifications: Notification[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [co, setCo] = useState<Company>(company);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const patch = useCallback(async (body: Partial<Company>) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setCo(data.company);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    const data = await fetch("/api/jobs", { cache: "no-store" }).then((r) => r.json());
    setJobs((data.jobs as Job[]).filter((j) => j.companySlug === co.slug));
  }, [co.slug]);

  const refreshInquiries = useCallback(async () => {
    const data = await fetch("/api/inquiries", { cache: "no-store" }).then((r) => r.json());
    setInquiries(data.inquiries);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json());
    setNotifications(data.notifications);
  }, []);

  const openActivity = useCallback(async () => {
    setTab("activity");
    await fetch("/api/notifications", { method: "POST" }); // mark read
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      refreshInquiries();
      refreshJobs();
      refreshNotifications();
    }, 10000);
    return () => clearInterval(t);
  }, [refreshInquiries, refreshJobs, refreshNotifications]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const appointments = useMemo(
    () =>
      jobs
        .filter((j) => j.date && j.status !== "open")
        .sort((a, b) => (a.date! < b.date! ? -1 : 1)),
    [jobs],
  );
  const openBroadcasts = jobs.filter((j) => j.status === "open");

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "schedule", label: "Schedule", badge: appointments.length },
    { key: "bench", label: "My bench", badge: co.members.length },
    { key: "broadcast", label: "Broadcast a shoot" },
    { key: "books", label: "Books" },
    { key: "leads", label: "Leads", badge: inquiries.length },
    { key: "activity", label: "Activity", badge: unread },
    { key: "page", label: "My public page" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-ink-700 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-ink-950"
            style={{ background: co.accent }}
          >
            {co.logoMark}
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-bone/40">
              Admin dashboard
            </p>
            <h1 className="font-display text-2xl font-semibold">{co.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button href={`/companies/${co.slug}`} variant="outline">
            View public site →
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => (t.key === "activity" ? openActivity() : setTab(t.key))}
            className={clsx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-amber-brand text-ink-950"
                : "bg-ink-800 text-bone/65 hover:bg-ink-700 hover:text-bone",
            )}
          >
            {t.label}
            {t.badge ? (
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[11px]",
                  tab === t.key ? "bg-ink-950/20" : "bg-ink-950",
                )}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && (
          <Overview
            co={co}
            name={account.displayName}
            appointments={appointments}
            openBroadcasts={openBroadcasts}
            inquiries={inquiries}
            go={setTab}
          />
        )}
        {tab === "schedule" && (
          <Schedule
            appointments={appointments}
            openBroadcasts={openBroadcasts}
            onRefresh={refreshJobs}
          />
        )}
        {tab === "bench" && (
          <BenchManager co={co} onChange={setCo} />
        )}
        {tab === "broadcast" && (
          <div>
            <SectionHead
              title="Broadcast a shoot"
              sub="Post a job to your whole bench, or offer it to one person. Whoever claims it gets it on their calendar — and it lands on yours."
            />
            <PostJobForm
              companySlug={co.slug}
              members={co.members.filter((m) => m.status === "active")}
              onPosted={refreshJobs}
            />
          </div>
        )}
        {tab === "leads" && (
          <div>
            <SectionHead
              title="Leads"
              sub="Inquiries from your public page. You and our team are both notified."
            />
            <Inquiries inquiries={inquiries} onRefresh={refreshInquiries} />
          </div>
        )}
        {tab === "books" && <Books jobs={jobs} />}
        {tab === "activity" && (
          <Activity notifications={notifications} onGo={setTab} />
        )}
        {tab === "page" && (
          <div className="space-y-10">
            <div>
              <SectionHead title="Your micro-site" sub="Your public page — what clients and photographers see." />
              <SiteEditor co={co} setCo={setCo} onSave={patch} saving={saving} saved={saved} />
            </div>
            <div>
              <SectionHead title="Services & pricing" sub="The packages shown on your page." />
              <OfferingsEditor co={co} onSave={patch} saving={saving} saved={saved} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Overview ---------------------------------------------------------------

function Overview({
  co,
  name,
  appointments,
  openBroadcasts,
  inquiries,
  go,
}: {
  co: Company;
  name: string;
  appointments: Job[];
  openBroadcasts: Job[];
  inquiries: Inquiry[];
  go: (t: Tab) => void;
}) {
  const stats = [
    { label: "Upcoming shoots", value: appointments.length, tab: "schedule" as Tab },
    { label: "Waiting to be claimed", value: openBroadcasts.length, tab: "schedule" as Tab, accent: true },
    { label: "Photographers on bench", value: co.members.length, tab: "bench" as Tab },
    { label: "New leads", value: inquiries.length, tab: "leads" as Tab },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">
          Welcome back, {name.split(" ")[0]} 👋
        </h2>
        <p className="mt-1 text-bone/60">Here&apos;s what&apos;s happening with {co.name}.</p>
      </div>

      {co.members.some((m) => m.status === "pending") && (
        <button
          onClick={() => go("bench")}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-brand/30 bg-amber-brand/10 p-4 text-left"
        >
          <span className="text-sm text-bone">
            <strong className="text-amber-soft">
              {co.members.filter((m) => m.status === "pending").length} photographer
              {co.members.filter((m) => m.status === "pending").length > 1 ? "s" : ""}
            </strong>{" "}
            applied and are waiting for your approval.
          </span>
          <span className="shrink-0 text-sm font-medium text-amber-soft">Review →</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => go(s.tab)}
            className="rounded-2xl border border-ink-700 bg-ink-900 p-5 text-left transition-colors hover:border-amber-brand/40"
          >
            <p className="font-display text-3xl font-semibold" style={s.accent ? { color: "#f0c078" } : undefined}>
              {s.value}
            </p>
            <p className="mt-1 text-sm text-bone/55">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-bone">Next shoots</h3>
            <button onClick={() => go("schedule")} className="text-sm text-amber-soft hover:text-amber-brand">
              View schedule →
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {appointments.slice(0, 4).map((j) => (
              <AppointmentRow key={j.id} job={j} compact />
            ))}
            {appointments.length === 0 && (
              <p className="text-sm text-bone/45">No shoots scheduled yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-brand/25 bg-amber-brand/5 p-5">
          <h3 className="font-semibold text-bone">Quick actions</h3>
          <div className="mt-4 space-y-2">
            <Button className="w-full justify-start" onClick={() => go("broadcast")}>
              📣 Broadcast a shoot to your bench
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => go("bench")}>
              ➕ Add a photographer
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => go("page")}>
              ✏️ Edit your public page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Schedule ---------------------------------------------------------------

function Schedule({
  appointments,
  openBroadcasts,
  onRefresh,
}: {
  appointments: Job[];
  openBroadcasts: Job[];
  onRefresh: () => void;
}) {
  const [view, setView] = useState<"agenda" | "month">("agenda");
  const groups = useMemo(() => {
    const m = new Map<string, Job[]>();
    for (const j of appointments) {
      const key = new Date(j.date!).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      m.set(key, [...(m.get(key) ?? []), j]);
    }
    return Array.from(m.entries());
  }, [appointments]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHead
          title="Schedule"
          sub="Every claimed shoot across your bench — one calendar for the whole company."
        />
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-ink-800 p-0.5 text-sm">
            {(["agenda", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  "rounded-full px-3 py-1.5 font-medium capitalize transition-colors",
                  view === v ? "bg-amber-brand text-ink-950" : "text-bone/60 hover:text-bone",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button variant="ghost" className="text-sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {openBroadcasts.length > 0 && (
        <div className="rounded-2xl border border-amber-brand/25 bg-amber-brand/5 p-4">
          <p className="text-sm font-medium text-amber-soft">
            {openBroadcasts.length} shoot{openBroadcasts.length > 1 ? "s" : ""} waiting to be claimed
          </p>
          <div className="mt-3 space-y-2">
            {openBroadcasts.map((j) => (
              <AppointmentRow key={j.id} job={j} pending />
            ))}
          </div>
        </div>
      )}

      {view === "month" ? (
        <MonthCalendar appointments={appointments} />
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-bone/45">
          No shoots on the calendar yet. Broadcast one and it appears here the
          moment a photographer claims it.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, list]) => (
            <div key={day}>
              <h3 className="mb-2 text-sm font-semibold text-bone/70">{day}</h3>
              <div className="space-y-2">
                {list.map((j) => (
                  <AppointmentRow key={j.id} job={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  job,
  compact,
  pending,
}: {
  job: Job;
  compact?: boolean;
  pending?: boolean;
}) {
  const time = job.date
    ? new Date(job.date).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-950 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-16 shrink-0 text-center">
          <p className="text-sm font-semibold text-amber-soft">{time}</p>
          {compact && job.date && (
            <p className="text-[10px] text-bone/40">
              {new Date(job.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <Link href={`/jobs/${job.id}`} className="truncate text-sm font-medium text-bone hover:text-amber-soft">
            {job.title}
          </Link>
          <p className="truncate text-xs text-bone/50">
            {job.neighborhood}
            {job.claimedByName ? ` · ${job.claimedByName}` : ""}
          </p>
        </div>
      </div>
      {pending ? (
        <Badge tone="amber">Unclaimed</Badge>
      ) : (
        <a
          href={`/api/calendar/${job.id}`}
          className="shrink-0 rounded-full bg-ink-800 px-3 py-1.5 text-xs font-medium text-bone/70 hover:text-bone"
        >
          + Calendar
        </a>
      )}
    </div>
  );
}

// ---- Bench manager ----------------------------------------------------------

function BenchManager({
  co,
  onChange,
}: {
  co: Company;
  onChange: (c: Company) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", rate: "" });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const pending = co.members.filter((m) => m.status === "pending");
  const roster = co.members.filter((m) => m.status !== "pending");

  const add = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/company/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          rate: form.rate ? Number(form.rate) : undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        onChange({ ...co, members: [...co.members, data.member] });
        setForm({ name: "", email: "", phone: "", rate: "" });
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/company/members?id=${id}`, { method: "DELETE" });
    onChange({ ...co, members: co.members.filter((m) => m.id !== id) });
  };

  const approve = async (id: string) => {
    await fetch("/api/company/members", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });
    onChange({
      ...co,
      members: co.members.map((m) => (m.id === id ? { ...m, status: "active" } : m)),
    });
  };

  const copyLink = (m: Member) => {
    const url = `${window.location.origin}/bench/${co.slug}/${m.id}`;
    navigator.clipboard?.writeText(url);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-8">
        {/* Applicants awaiting approval */}
        {pending.length > 0 && (
          <div>
            <SectionHead
              title={`Applicants (${pending.length})`}
              sub="Photographers who applied to your bench. Review their work, then approve to add them to your queue."
            />
            <div className="space-y-3">
              {pending.map((m) => (
                <div key={m.id} className="rounded-2xl border border-amber-brand/25 bg-amber-brand/5 p-4">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-bone">{m.name}</p>
                      <p className="text-xs text-bone/50">
                        {m.email}
                        {m.phone ? ` · ${m.phone}` : ""}
                      </p>
                      {m.gear && <p className="mt-1 text-xs text-bone/70"><span className="text-bone/40">Gear:</span> {m.gear}</p>}
                      {m.experience && <p className="mt-0.5 text-xs text-bone/70"><span className="text-bone/40">Experience:</span> {m.experience}</p>}
                    </div>
                  </div>
                  {m.sampleUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.sampleUrl} alt="Work sample" className="mt-3 h-40 w-full rounded-lg object-cover" />
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" onClick={() => approve(m.id)}>Approve → add to bench</Button>
                    <button onClick={() => remove(m.id)} className="rounded-full px-4 py-2 text-sm text-bone/55 ring-1 ring-inset ring-ink-600 hover:text-rose-200 hover:ring-rose-500/40">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active roster */}
        <div>
          <SectionHead
            title="My bench"
            sub="Approved photographers. Each has a personal link — send it to them and they can claim broadcasts with one tap (no login needed)."
          />
          {roster.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-700 p-8 text-center text-bone/45">
              No photographers yet. Add one on the right, or approve an applicant.
            </div>
          ) : (
            <div className="space-y-2">
              {roster.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-700 bg-ink-900 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-bone">{m.name}</p>
                      <p className="truncate text-xs text-bone/50">
                        {m.email}
                        {m.rate ? ` · $${m.rate}/day` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {m.status === "invited" && <Badge tone="blue">Invited</Badge>}
                    <button onClick={() => copyLink(m)} className="rounded-full bg-ink-800 px-3 py-1.5 text-xs font-medium text-bone/70 hover:text-bone">
                      {copied === m.id ? "Copied ✓" : "Copy claim link"}
                    </button>
                    <button onClick={() => remove(m.id)} className="rounded-full px-2 py-1.5 text-xs text-bone/40 hover:text-rose-300" aria-label={`Remove ${m.name}`}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 lg:sticky lg:top-20 lg:self-start">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-bone/40">
          Add a photographer directly
        </h3>
        <div className="space-y-3">
          <Labeled label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          </Labeled>
          <Labeled label="Email">
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Phone (optional)">
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="512-555-0100" />
            </Labeled>
            <Labeled label="Day rate (optional)">
              <input type="number" className="input" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="350" />
            </Labeled>
          </div>
          <Button className="w-full" onClick={add} disabled={busy || !form.name || !form.email}>
            {busy ? "Adding…" : "Add to bench"}
          </Button>
          <p className="text-xs text-bone/40">
            Adding someone directly skips approval. To have photographers apply
            themselves, share your public page.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Books (accounting) -----------------------------------------------------

function Books({ jobs }: { jobs: Job[] }) {
  // Money is real once a job is claimed (someone's getting paid).
  const billable = jobs.filter((j) => j.status !== "open");
  const rows = billable.map((j) => ({ job: j, ec: economicsFor(j) }));
  const t = rows.reduce(
    (acc, r) => ({
      client: acc.client + r.ec.clientPrice,
      pay: acc.pay + r.ec.payout,
      fee: acc.fee + r.ec.fee,
      net: acc.net + r.ec.net,
    }),
    { client: 0, pay: 0, fee: 0, net: 0 },
  );

  return (
    <div>
      <SectionHead
        title="Books"
        sub="What you charge, what you pay photographers, the platform fee, and what you keep — per job and in total. Ready to export to QuickBooks / Xero when payments go live."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Client revenue" value={money(t.client)} />
        <Metric label="Photographer payouts" value={money(t.pay)} />
        <Metric label="Platform fees" value={money(t.fee)} />
        <Metric label="Your net" value={money(t.net)} accent />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-bone/45">
          Nothing billable yet. Once a photographer claims a shoot, the numbers
          show up here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-700">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wide text-bone/40">
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Photographer</th>
                <th className="px-4 py-3 text-right font-medium">Client</th>
                <th className="px-4 py-3 text-right font-medium">Payout</th>
                <th className="px-4 py-3 text-right font-medium">Fee</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ job, ec }) => (
                <tr key={job.id} className="border-b border-ink-800 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="text-bone hover:text-amber-soft">
                      {job.title}
                    </Link>
                    <span className="ml-2 rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-bone/50">
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bone/60">{job.claimedByName ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-bone/80">{money(ec.clientPrice)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-bone/60">−{money(ec.payout)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-bone/40">−{money(ec.fee)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-300">{money(ec.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline">Export CSV</Button>
        <span className="text-xs text-bone/40">
          Card payments &amp; automatic photographer payouts turn on with Stripe
          Connect (next phase).
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
      <p className="text-[11px] uppercase tracking-wide text-bone/40">{label}</p>
      <p className={clsx("mt-1 font-display text-2xl font-semibold", accent ? "text-emerald-300" : "text-bone")}>
        {value}
      </p>
    </div>
  );
}

// ---- Activity (notifications) -----------------------------------------------

function Activity({
  notifications,
  onGo,
}: {
  notifications: Notification[];
  onGo: (t: Tab) => void;
}) {
  const icon = { application: "📥", claim: "✅", inquiry: "✉️" } as const;
  return (
    <div className="max-w-2xl">
      <SectionHead
        title="Activity"
        sub="New applications, claims, and inquiries as they happen. (Real email/SMS alerts turn on when you connect a provider.)"
      />
      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-bone/45">
          Nothing yet. When a photographer applies, claims a shoot, or a client
          inquires, it shows up here.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onGo(n.type === "inquiry" ? "leads" : n.type === "application" ? "bench" : "schedule")}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left hover:border-ink-600"
            >
              <span className="text-lg">{icon[n.type]}</span>
              <span className="flex-1 text-sm text-bone/85">{n.text}</span>
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Micro-site editor (unchanged behavior) ---------------------------------

function SiteEditor({
  co,
  setCo,
  onSave,
  saving,
  saved,
}: {
  co: Company;
  setCo: (c: Company) => void;
  onSave: (b: Partial<Company>) => void;
  saving: boolean;
  saved: boolean;
}) {
  const set = <K extends keyof Company>(k: K, v: Company[K]) => setCo({ ...co, [k]: v });
  const toggleSpecialty = (s: Specialty) => {
    const has = co.specialties.includes(s);
    set("specialties", has ? co.specialties.filter((x) => x !== s) : [...co.specialties, s]);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <Panel title="Story">
          <Labeled label="Tagline">
            <input className="input" value={co.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Labeled>
          <Labeled label="About">
            <textarea className="input resize-none" rows={4} value={co.about} onChange={(e) => set("about", e.target.value)} />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Location">
              <input className="input" value={co.location} onChange={(e) => set("location", e.target.value)} />
            </Labeled>
            <Labeled label="Base day rate ($)">
              <input type="number" className="input" value={co.baseDayRate} onChange={(e) => set("baseDayRate", Number(e.target.value))} />
            </Labeled>
          </div>
          <Labeled label="Markets (comma separated)">
            <input className="input" value={co.markets.join(", ")} onChange={(e) => set("markets", e.target.value.split(",").map((m) => m.trim()).filter(Boolean))} />
          </Labeled>
        </Panel>
        <Panel title="Equipment policy">
          <Labeled label="Policy">
            <select className="input" value={co.equipmentPolicy} onChange={(e) => set("equipmentPolicy", e.target.value as Company["equipmentPolicy"])}>
              <option value="either" className="bg-ink-800">Provided or BYO</option>
              <option value="provided" className="bg-ink-800">We provide gear</option>
              <option value="byo" className="bg-ink-800">Bring your own kit</option>
            </select>
          </Labeled>
          <Labeled label="Notes">
            <textarea className="input resize-none" rows={2} value={co.equipmentNotes} onChange={(e) => set("equipmentNotes", e.target.value)} />
          </Labeled>
        </Panel>
        <Panel title="Perks (one per line)">
          <textarea className="input resize-none" rows={4} value={co.perks.join("\n")} onChange={(e) => set("perks", e.target.value.split("\n").map((p) => p.trim()).filter(Boolean))} />
        </Panel>
        <Panel title="Who you're looking for & how they get paid">
          <Labeled label="Equipment you expect photographers to have">
            <textarea className="input resize-none" rows={2} value={co.wantsEquipment} onChange={(e) => set("wantsEquipment", e.target.value)} />
          </Labeled>
          <Labeled label="Experience you're looking for">
            <textarea className="input resize-none" rows={2} value={co.wantsExperience} onChange={(e) => set("wantsExperience", e.target.value)} />
          </Labeled>
          <Labeled label="How photographers get paid (be clear!)">
            <textarea className="input resize-none" rows={3} value={co.payTerms} onChange={(e) => set("payTerms", e.target.value)} />
          </Labeled>
        </Panel>
        <div className="flex items-center gap-3">
          <Button
            onClick={() =>
              onSave({
                tagline: co.tagline, about: co.about, location: co.location,
                baseDayRate: co.baseDayRate, markets: co.markets,
                equipmentPolicy: co.equipmentPolicy, equipmentNotes: co.equipmentNotes,
                wantsEquipment: co.wantsEquipment, wantsExperience: co.wantsExperience,
                payTerms: co.payTerms,
                perks: co.perks, accent: co.accent, specialties: co.specialties,
              })
            }
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
        </div>
      </div>
      <div className="space-y-4">
        <Panel title="Brand accent">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button key={a} onClick={() => set("accent", a)} className={clsx("h-9 w-9 rounded-full ring-2 transition-transform hover:scale-110", co.accent.toLowerCase() === a.toLowerCase() ? "ring-bone" : "ring-transparent")} style={{ background: a }} aria-label={a} />
            ))}
          </div>
        </Panel>
        <Panel title="Specialties">
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((s) => (
              <button key={s} onClick={() => toggleSpecialty(s)} className={clsx("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", co.specialties.includes(s) ? "bg-amber-brand text-ink-950" : "bg-ink-800 text-bone/60 hover:bg-ink-700")}>
                {s}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function OfferingsEditor({
  co,
  onSave,
  saving,
  saved,
}: {
  co: Company;
  onSave: (b: Partial<Company>) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [items, setItems] = useState<Offering[]>(co.offerings);
  const update = (i: number, patch: Partial<Offering>) => setItems(items.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const add = () => setItems([...items, { title: "New service", price: 150, unit: "per shoot", blurb: "" }]);
  return (
    <div className="max-w-3xl space-y-4">
      {items.map((o, i) => (
        <div key={i} className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <Labeled label="Service"><input className="input" value={o.title} onChange={(e) => update(i, { title: e.target.value })} /></Labeled>
            <Labeled label="Price ($)"><input type="number" className="input" value={o.price} onChange={(e) => update(i, { price: Number(e.target.value) })} /></Labeled>
            <Labeled label="Unit"><input className="input" value={o.unit} onChange={(e) => update(i, { unit: e.target.value })} /></Labeled>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <Labeled label="Blurb" className="flex-1"><input className="input" value={o.blurb} onChange={(e) => update(i, { blurb: e.target.value })} /></Labeled>
            <button onClick={() => remove(i)} className="mb-1 rounded-full px-3 py-2 text-xs text-bone/50 ring-1 ring-inset ring-ink-600 hover:text-rose-200 hover:ring-rose-500/40">Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={add}>+ Add service</Button>
        <Button onClick={() => onSave({ offerings: items })} disabled={saving}>{saving ? "Saving…" : "Save services"}</Button>
        {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
      </div>
    </div>
  );
}

function Inquiries({
  inquiries,
  onRefresh,
}: {
  inquiries: Inquiry[];
  onRefresh: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-end">
        <Button variant="ghost" className="text-sm" onClick={onRefresh}>Refresh</Button>
      </div>
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-bone/40">
          No leads yet. Share your micro-site link to start getting inquiries.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-bone">{q.name}</p>
                  <a href={`mailto:${q.email}`} className="text-sm text-amber-soft hover:underline">{q.email}</a>
                </div>
                <Badge tone="amber">{q.projectType}</Badge>
              </div>
              {q.message && <p className="mt-3 text-sm text-bone/70">{q.message}</p>}
              <div className="mt-3">
                <Button href={`mailto:${q.email}`} className="py-1.5 text-xs">Reply →</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Bits -------------------------------------------------------------------

const ACCENTS = ["#e8a94b", "#7c9cf5", "#e06c75", "#5ec8a0", "#c98bdb", "#d98b5f", "#8bb8d9"];

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-bone/55">{sub}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-bone/40">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Labeled({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-bone/45">{label}</span>
      {children}
    </label>
  );
}
