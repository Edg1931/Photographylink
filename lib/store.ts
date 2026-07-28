// -----------------------------------------------------------------------------
// Job store with ATOMIC claim semantics.
//
// Supabase path: jobs live in Postgres; claims run through the claim_job()
// function (a single conditional UPDATE) — atomic at the database level, exactly
// what production needs.
//
// Fallback path (no Supabase configured): an in-memory singleton with an async
// mutex that serializes the read-check-write, giving the same "exactly one
// winner" guarantee for the local/demo experience.
//
// Either way the API routes and UI are identical.
// -----------------------------------------------------------------------------

import { randomUUID } from "crypto";
import { jobs as seedJobs, Job } from "./data";
import { getSupabase } from "./supabase";
import { getCompany } from "./backend";
import * as repo from "./supabase-repo";
import { NewJobInput } from "./backend-types";

export type { NewJobInput };

export interface ClaimEvent {
  at: number;
  jobId: string;
  photographerSlug: string;
  outcome: "won" | "lost";
  reason?: string;
}

export type ClaimResult =
  | { ok: true; job: Job }
  | { ok: false; reason: "not_found" | "not_open" | "already_claimed" | "reserved"; job?: Job };

// ---- In-memory fallback state ----------------------------------------------

let jobsState: Job[] = clone(seedJobs);
let claimLog: ClaimEvent[] = [];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ---- Async mutex (fallback path) -------------------------------------------

let tail: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const result = tail.then(fn);
  tail = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function recordClaim(
  jobId: string,
  photographerSlug: string,
  outcome: "won" | "lost",
  reason?: string,
) {
  claimLog.push({ at: Date.now(), jobId, photographerSlug, outcome, reason });
  if (claimLog.length > 200) claimLog = claimLog.slice(-200);
}

// ---- Reads ------------------------------------------------------------------

export async function listJobs(): Promise<Job[]> {
  const sb = getSupabase();
  if (sb) return repo.listJobs(sb);
  return clone(jobsState);
}

export function listClaimLog(): ClaimEvent[] {
  return clone(claimLog)
    .sort((a, b) => b.at - a.at)
    .slice(0, 40);
}

// ---- Claim ------------------------------------------------------------------

export async function claimJob(
  jobId: string,
  photographerSlug: string,
  name?: string,
): Promise<ClaimResult> {
  const sb = getSupabase();
  if (sb) {
    const r = await repo.claimJob(sb, jobId, photographerSlug, name);
    recordClaim(
      jobId,
      photographerSlug,
      r.ok ? "won" : "lost",
      r.ok ? undefined : r.reason,
    );
    return r as ClaimResult;
  }

  return withLock(async () => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.status !== "open") {
      recordClaim(jobId, photographerSlug, "lost", "not_open");
      return { ok: false, reason: "already_claimed" as const, job: clone(job) };
    }
    if (job.assignedToSlug && job.assignedToSlug !== photographerSlug) {
      recordClaim(jobId, photographerSlug, "lost", "reserved");
      return { ok: false, reason: "reserved" as const, job: clone(job) };
    }
    await delay(140);
    if (job.status !== "open") {
      recordClaim(jobId, photographerSlug, "lost", "already_claimed");
      return { ok: false, reason: "already_claimed" as const, job: clone(job) };
    }
    if (job.assignedToSlug && job.assignedToSlug !== photographerSlug) {
      recordClaim(jobId, photographerSlug, "lost", "reserved");
      return { ok: false, reason: "reserved" as const, job: clone(job) };
    }
    job.status = "claimed";
    job.claimedBySlug = photographerSlug;
    if (name) job.claimedByName = name;
    job.postedAgo = "just now";
    recordClaim(jobId, photographerSlug, "won");
    return { ok: true as const, job: clone(job) };
  });
}

// ---- Assign / decline -------------------------------------------------------

export async function assignJob(
  jobId: string,
  photographerSlug: string,
): Promise<ClaimResult> {
  const sb = getSupabase();
  if (sb) return (await repo.assignJob(sb, jobId, photographerSlug)) as ClaimResult;
  return withLock(() => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.status !== "open") return { ok: false, reason: "not_open" as const, job: clone(job) };
    job.assignedToSlug = photographerSlug;
    return { ok: true as const, job: clone(job) };
  });
}

export async function declineJob(
  jobId: string,
  photographerSlug: string,
): Promise<ClaimResult> {
  const sb = getSupabase();
  if (sb) {
    const r = (await repo.declineJob(sb, jobId, photographerSlug)) as ClaimResult;
    if (r.ok) recordClaim(jobId, photographerSlug, "lost", "declined");
    return r;
  }
  return withLock(() => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.assignedToSlug !== photographerSlug || job.status !== "open") {
      return { ok: false, reason: "not_open" as const, job: clone(job) };
    }
    job.assignedToSlug = undefined;
    recordClaim(jobId, photographerSlug, "lost", "declined");
    return { ok: true as const, job: clone(job) };
  });
}

export async function advanceJob(jobId: string): Promise<ClaimResult> {
  const sb = getSupabase();
  if (sb) return (await repo.advanceJob(sb, jobId)) as ClaimResult;
  return withLock(() => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.status === "claimed") job.status = "scheduled";
    else if (job.status === "scheduled") job.status = "delivered";
    return { ok: true as const, job: clone(job) };
  });
}

// ---- Post / reset -----------------------------------------------------------

export async function postJob(input: NewJobInput): Promise<Job> {
  const job: Job = {
    id: `job-${randomUUID().slice(0, 8)}`,
    companySlug: (await hasCompany(input.companySlug))
      ? input.companySlug
      : seedJobs[0].companySlug,
    title: input.title || "Untitled shoot",
    type: input.type,
    address: "Address on claim",
    neighborhood: input.neighborhood || "Austin",
    shootAt: input.shootAt || "Flexible",
    postedAgo: "just now",
    durationHours: input.durationHours || 2,
    payout: input.payout || 200,
    deliverables: input.deliverables || "Standard listing gallery",
    equipment: input.equipment,
    status: "open",
    assignedToSlug: input.assignedToSlug || undefined,
    date: input.date || undefined,
    urgency: input.urgency,
  };
  const sb = getSupabase();
  if (sb) return repo.postJob(sb, job);
  return withLock(() => {
    jobsState = [job, ...jobsState];
    return clone(job);
  });
}

export async function resetDemo(): Promise<{ ok: true }> {
  // Only resets the in-memory demo. With Supabase, jobs persist by design.
  return withLock(() => {
    jobsState = clone(seedJobs);
    claimLog = [];
    return { ok: true as const };
  });
}

async function hasCompany(slug: string): Promise<boolean> {
  // Uses the backend (in-memory or Supabase) so companies created at signup
  // are recognized — not just the static seed set.
  return Boolean(await getCompany(slug));
}
