// -----------------------------------------------------------------------------
// In-memory job store with ATOMIC claim semantics.
//
// This is the real thing the product hinges on: when a company drops a job into
// the queue and its whole bench is notified, *exactly one* photographer may win
// the claim — even if five of them tap "Claim" in the same instant.
//
// There is no database here yet (by design — we're validating feel first). State
// lives in a module-level singleton that persists for the life of the Node
// server process. The concurrency guarantee is provided by an async mutex that
// serializes the read-modify-write, so the critical section behaves exactly like
// a Postgres `UPDATE jobs SET claimed_by=$1 WHERE id=$2 AND claimed_by IS NULL`
// (or `SELECT ... FOR UPDATE`) would. When we move to Supabase, this file is the
// only thing that changes — the API and UI stay identical.
// -----------------------------------------------------------------------------

import { jobs as seedJobs, Job, getCompany } from "./data";

export interface ClaimEvent {
  at: number;
  jobId: string;
  photographerSlug: string;
  outcome: "won" | "lost";
  reason?: string;
}

export type ClaimResult =
  | { ok: true; job: Job }
  | {
      ok: false;
      reason: "not_found" | "not_open" | "already_claimed" | "reserved";
      job?: Job;
    };

// ---- Mutable state (the "database") ----------------------------------------

let jobsState: Job[] = clone(seedJobs);
let claimLog: ClaimEvent[] = [];
let idCounter = 5000;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// ---- Async mutex ------------------------------------------------------------
// A single promise chain. Each critical section awaits the previous one, so the
// read-check-write below can never interleave with another claim. This is what
// makes the claim atomic despite `await`s inside it.

let tail: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const result = tail.then(fn);
  // Keep the chain alive even if a section throws.
  tail = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---- Reads ------------------------------------------------------------------

export function listJobs(): Job[] {
  return clone(jobsState);
}

export function listClaimLog(): ClaimEvent[] {
  return clone(claimLog).sort((a, b) => b.at - a.at).slice(0, 40);
}

// ---- Writes -----------------------------------------------------------------

/**
 * Attempt to claim a job for a photographer. Atomic: concurrent callers are
 * serialized, and only the first to reach the still-open job wins. The
 * artificial latency models real DB round-trip time and makes the race genuine —
 * without the lock, two callers could both observe "open" before either writes.
 */
export function claimJob(
  jobId: string,
  photographerSlug: string,
): Promise<ClaimResult> {
  return withLock(async () => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) {
      return { ok: false, reason: "not_found" as const };
    }
    if (job.status !== "open") {
      recordClaim(jobId, photographerSlug, "lost", "not_open");
      return { ok: false, reason: "already_claimed" as const, job: clone(job) };
    }
    // A direct offer can only be accepted by the photographer it was offered to.
    if (job.assignedToSlug && job.assignedToSlug !== photographerSlug) {
      recordClaim(jobId, photographerSlug, "lost", "reserved");
      return { ok: false, reason: "reserved" as const, job: clone(job) };
    }

    // --- critical section (serialized by the mutex) ---
    await delay(140); // simulated DB write latency
    // Re-check under the lock. Guaranteed still valid because nothing else can
    // run between the check above and the write below.
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
    job.postedAgo = "just now";
    recordClaim(jobId, photographerSlug, "won");
    return { ok: true as const, job: clone(job) };
  });
}

/**
 * Directly offer an open job to one photographer. Only they can then accept it;
 * everyone else is rejected with `reserved`. Re-assigning is allowed while the
 * job is still open.
 */
export function assignJob(
  jobId: string,
  photographerSlug: string,
): Promise<ClaimResult> {
  return withLock(() => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.status !== "open") {
      return { ok: false, reason: "not_open" as const, job: clone(job) };
    }
    job.assignedToSlug = photographerSlug;
    return { ok: true as const, job: clone(job) };
  });
}

/**
 * The offered photographer declines a direct offer, releasing the job back to
 * the whole bench (it becomes a normal open, claimable job).
 */
export function declineJob(
  jobId: string,
  photographerSlug: string,
): Promise<ClaimResult> {
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

/** Advance a claimed job to scheduled, or a scheduled job to delivered. */
export function advanceJob(jobId: string): Promise<ClaimResult> {
  return withLock(() => {
    const job = jobsState.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" as const };
    if (job.status === "claimed") job.status = "scheduled";
    else if (job.status === "scheduled") job.status = "delivered";
    return { ok: true as const, job: clone(job) };
  });
}

export interface NewJobInput {
  companySlug: string;
  title: string;
  type: Job["type"];
  neighborhood: string;
  payout: number;
  durationHours: number;
  shootAt: string;
  deliverables: string;
  equipment: Job["equipment"];
  urgency: Job["urgency"];
  // Optional: post the job as a direct offer to one photographer.
  assignedToSlug?: string;
}

/** Post a fresh job to the top of the queue. */
export function postJob(input: NewJobInput): Promise<Job> {
  return withLock(() => {
    idCounter += 1;
    const job: Job = {
      id: `job-${idCounter}`,
      companySlug: getCompany(input.companySlug)
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
      urgency: input.urgency,
    };
    jobsState = [job, ...jobsState];
    return clone(job);
  });
}

/** Reset the demo back to the seed data. */
export function resetDemo(): Promise<{ ok: true }> {
  return withLock(() => {
    jobsState = clone(seedJobs);
    claimLog = [];
    idCounter = 5000;
    return { ok: true as const };
  });
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
