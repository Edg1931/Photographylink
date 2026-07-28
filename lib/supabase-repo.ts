import { SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "crypto";
import {
  companies as seedCompanies,
  photographers as seedPhotographers,
  jobs as seedJobs,
  Company,
  Job,
} from "./data";
import type {
  Account,
  Inquiry,
  CompanyPatch,
  NewInquiry,
  SignUpInput,
  AuthResult,
  NewJobInput,
} from "./backend-types";

// -----------------------------------------------------------------------------
// Supabase implementation of the data layer. Mirrors the in-memory functions in
// backend.ts / store.ts so callers are impl-agnostic. Activated only when
// Supabase is configured.
// -----------------------------------------------------------------------------

function hash(pw: string): string {
  return createHash("sha256").update(`pl::${pw}`).digest("hex");
}

// ---- Row mappers ------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

function toCompany(r: any): Company {
  return {
    slug: r.slug,
    name: r.name,
    logoMark: r.logo_mark,
    cover: r.cover,
    location: r.location,
    markets: r.markets ?? [],
    tagline: r.tagline,
    about: r.about,
    accent: r.accent,
    specialties: r.specialties ?? [],
    rating: Number(r.rating),
    reviewCount: r.review_count,
    shootsPerMonth: r.shoots_per_month,
    baseDayRate: r.base_day_rate,
    equipmentPolicy: r.equipment_policy,
    equipmentNotes: r.equipment_notes,
    perks: r.perks ?? [],
    offerings: r.offerings ?? [],
    bench: r.bench ?? [],
    members: r.members ?? [],
    showcase: r.showcase ?? [],
  };
}

function companyRow(c: Company) {
  return {
    slug: c.slug,
    name: c.name,
    logo_mark: c.logoMark,
    cover: c.cover,
    location: c.location,
    markets: c.markets,
    tagline: c.tagline,
    about: c.about,
    accent: c.accent,
    specialties: c.specialties,
    rating: c.rating,
    review_count: c.reviewCount,
    shoots_per_month: c.shootsPerMonth,
    base_day_rate: c.baseDayRate,
    equipment_policy: c.equipmentPolicy,
    equipment_notes: c.equipmentNotes,
    perks: c.perks,
    offerings: c.offerings,
    bench: c.bench,
    members: c.members,
    showcase: c.showcase,
  };
}

function patchRow(p: CompanyPatch) {
  const row: Record<string, unknown> = {};
  if (p.tagline !== undefined) row.tagline = p.tagline;
  if (p.about !== undefined) row.about = p.about;
  if (p.accent !== undefined) row.accent = p.accent;
  if (p.location !== undefined) row.location = p.location;
  if (p.baseDayRate !== undefined) row.base_day_rate = p.baseDayRate;
  if (p.equipmentPolicy !== undefined) row.equipment_policy = p.equipmentPolicy;
  if (p.equipmentNotes !== undefined) row.equipment_notes = p.equipmentNotes;
  if (p.markets !== undefined) row.markets = p.markets;
  if (p.specialties !== undefined) row.specialties = p.specialties;
  if (p.offerings !== undefined) row.offerings = p.offerings;
  if (p.perks !== undefined) row.perks = p.perks;
  if (p.members !== undefined) row.members = p.members;
  return row;
}

function toJob(r: any): Job {
  return {
    id: r.id,
    companySlug: r.company_slug,
    title: r.title,
    type: r.type,
    address: r.address,
    neighborhood: r.neighborhood,
    shootAt: r.shoot_at,
    postedAgo: r.posted_ago,
    durationHours: Number(r.duration_hours),
    payout: r.payout,
    deliverables: r.deliverables,
    equipment: r.equipment,
    status: r.status,
    claimedBySlug: r.claimed_by ?? undefined,
    claimedByName: r.claimed_by_name ?? undefined,
    assignedToSlug: r.assigned_to ?? undefined,
    date: r.date ?? undefined,
    urgency: r.urgency,
  };
}

function jobRow(j: Job) {
  return {
    id: j.id,
    company_slug: j.companySlug,
    title: j.title,
    type: j.type,
    address: j.address,
    neighborhood: j.neighborhood,
    shoot_at: j.shootAt,
    posted_ago: j.postedAgo,
    duration_hours: j.durationHours,
    payout: j.payout,
    deliverables: j.deliverables,
    equipment: j.equipment,
    status: j.status,
    claimed_by: j.claimedBySlug ?? null,
    claimed_by_name: j.claimedByName ?? null,
    assigned_to: j.assignedToSlug ?? null,
    date: j.date ?? null,
    urgency: j.urgency,
  };
}

function toInquiry(r: any): Inquiry {
  return {
    id: r.id,
    companySlug: r.company_slug,
    name: r.name,
    email: r.email,
    projectType: r.project_type,
    message: r.message,
    createdAt: new Date(r.created_at).getTime(),
    read: r.read,
  };
}

function toAccount(r: any): Account {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
    displayName: r.display_name,
    companySlug: r.company_slug ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---- Seeding ----------------------------------------------------------------

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(sb: SupabaseClient): Promise<void> {
  if (!seedPromise) seedPromise = doSeed(sb);
  return seedPromise;
}

async function doSeed(sb: SupabaseClient): Promise<void> {
  const { count, error } = await sb
    .from("companies")
    .select("slug", { count: "exact", head: true });
  if (error) {
    // Table missing / not migrated yet — surface a clear hint.
    throw new Error(
      `Supabase not ready (${error.message}). Run supabase/migrations/0001_init.sql.`,
    );
  }
  if ((count ?? 0) > 0) return;

  await sb.from("companies").upsert(seedCompanies.map(companyRow));
  await sb.from("photographers").upsert(
    seedPhotographers.map((p) => ({
      slug: p.slug,
      name: p.name,
      avatar: p.avatar,
      cover: p.cover,
      location: p.location,
      radius_miles: p.radiusMiles,
      headline: p.headline,
      bio: p.bio,
      specialties: p.specialties,
      rating: p.rating,
      review_count: p.reviewCount,
      jobs_completed: p.jobsCompleted,
      on_time_rate: p.onTimeRate,
      response_hours: p.responseHours,
      day_rate: p.dayRate,
      half_day_rate: p.halfDayRate,
      available_now: p.availableNow,
      owns_gear: p.ownsGear,
      networks: p.networks,
      portfolio: p.portfolio,
    })),
  );
  await sb.from("jobs").upsert(seedJobs.map(jobRow));
}

// ---- Companies --------------------------------------------------------------

export async function listCompanies(sb: SupabaseClient): Promise<Company[]> {
  await ensureSeeded(sb);
  const { data } = await sb
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toCompany);
}

export async function getCompany(
  sb: SupabaseClient,
  slug: string,
): Promise<Company | undefined> {
  await ensureSeeded(sb);
  const { data } = await sb.from("companies").select("*").eq("slug", slug).maybeSingle();
  return data ? toCompany(data) : undefined;
}

export async function updateCompany(
  sb: SupabaseClient,
  slug: string,
  patch: CompanyPatch,
): Promise<Company | undefined> {
  const { data } = await sb
    .from("companies")
    .update(patchRow(patch))
    .eq("slug", slug)
    .select("*")
    .maybeSingle();
  return data ? toCompany(data) : undefined;
}

export async function insertCompany(
  sb: SupabaseClient,
  c: Company,
  ownerId: string,
): Promise<void> {
  await sb.from("companies").insert({ ...companyRow(c), owner_id: ownerId });
}

export async function slugTaken(
  sb: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const { data } = await sb.from("companies").select("slug").eq("slug", slug).maybeSingle();
  return Boolean(data);
}

// ---- Accounts / sessions ----------------------------------------------------

export async function signUp(
  sb: SupabaseClient,
  input: SignUpInput,
  buildCompany: (name: string, slug: string, owner: string) => Company,
  slugify: (name: string) => string,
): Promise<AuthResult> {
  await ensureSeeded(sb);
  const email = input.email.trim().toLowerCase();
  const existing = await sb.from("accounts").select("id").eq("email", email).maybeSingle();
  if (existing.data) return { ok: false, error: "That email already has an account" };

  const displayName = input.displayName || email.split("@")[0];
  const { data: acct, error } = await sb
    .from("accounts")
    .insert({
      email,
      password_hash: hash(input.password),
      role: input.role,
      display_name: displayName,
    })
    .select("*")
    .single();
  if (error || !acct) return { ok: false, error: error?.message ?? "Sign up failed" };

  if (input.role === "company") {
    const name = input.companyName?.trim() || `${displayName}'s Studio`;
    const base = slugify(name) || "studio";
    let slug = base;
    let n = 2;
    while (await slugTaken(sb, slug)) slug = `${base}-${n++}`;
    const company = buildCompany(name, slug, displayName);
    await insertCompany(sb, company, acct.id);
    await sb.from("accounts").update({ company_slug: slug }).eq("id", acct.id);
    acct.company_slug = slug;
  }

  const token = await newSession(sb, acct.id);
  return { ok: true, token, account: toAccount(acct) };
}

export async function logIn(
  sb: SupabaseClient,
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data: acct } = await sb
    .from("accounts")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (!acct || acct.password_hash !== hash(password)) {
    return { ok: false, error: "Invalid email or password" };
  }
  const token = await newSession(sb, acct.id);
  return { ok: true, token, account: toAccount(acct) };
}

async function newSession(sb: SupabaseClient, accountId: string): Promise<string> {
  const { data } = await sb
    .from("sessions")
    .insert({ account_id: accountId })
    .select("token")
    .single();
  return data!.token as string;
}

export async function logOut(sb: SupabaseClient, token: string): Promise<void> {
  await sb.from("sessions").delete().eq("token", token);
}

export async function accountFromToken(
  sb: SupabaseClient,
  token: string,
): Promise<Account | undefined> {
  const { data: sess } = await sb
    .from("sessions")
    .select("account_id")
    .eq("token", token)
    .maybeSingle();
  if (!sess) return undefined;
  const { data: acct } = await sb
    .from("accounts")
    .select("*")
    .eq("id", sess.account_id)
    .maybeSingle();
  return acct ? toAccount(acct) : undefined;
}

// ---- Inquiries --------------------------------------------------------------

export async function createInquiry(
  sb: SupabaseClient,
  input: NewInquiry,
): Promise<Inquiry> {
  const { data } = await sb
    .from("inquiries")
    .insert({
      id: `inq-${randomUUID().slice(0, 8)}`,
      company_slug: input.companySlug,
      name: input.name,
      email: input.email,
      project_type: input.projectType,
      message: input.message,
    })
    .select("*")
    .single();
  return toInquiry(data);
}

export async function listInquiries(
  sb: SupabaseClient,
  companySlug?: string,
): Promise<Inquiry[]> {
  let q = sb.from("inquiries").select("*").order("created_at", { ascending: false });
  if (companySlug) q = q.eq("company_slug", companySlug);
  const { data } = await q;
  return (data ?? []).map(toInquiry);
}

// ---- Jobs -------------------------------------------------------------------

export async function listJobs(sb: SupabaseClient): Promise<Job[]> {
  await ensureSeeded(sb);
  const { data } = await sb
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toJob);
}

export async function claimJob(
  sb: SupabaseClient,
  jobId: string,
  slug: string,
  name?: string,
): Promise<{ ok: boolean; reason?: string; job?: Job }> {
  const { data } = await sb.rpc("claim_job", {
    p_id: jobId,
    p_slug: slug,
    p_name: name ?? null,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (row && row.id) return { ok: true, job: toJob(row) };

  // Did not qualify — determine why for a good message.
  const { data: job } = await sb.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, reason: "not_found" };
  if (job.status !== "open") return { ok: false, reason: "already_claimed", job: toJob(job) };
  return { ok: false, reason: "reserved", job: toJob(job) };
}

export async function assignJob(sb: SupabaseClient, jobId: string, slug: string) {
  const { data } = await sb
    .from("jobs")
    .update({ assigned_to: slug })
    .eq("id", jobId)
    .eq("status", "open")
    .select("*")
    .maybeSingle();
  return data ? { ok: true, job: toJob(data) } : { ok: false, reason: "not_open" };
}

export async function declineJob(sb: SupabaseClient, jobId: string, slug: string) {
  const { data } = await sb
    .from("jobs")
    .update({ assigned_to: null })
    .eq("id", jobId)
    .eq("assigned_to", slug)
    .eq("status", "open")
    .select("*")
    .maybeSingle();
  return data ? { ok: true, job: toJob(data) } : { ok: false, reason: "not_open" };
}

export async function advanceJob(sb: SupabaseClient, jobId: string) {
  const { data: job } = await sb.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, reason: "not_found" };
  const next =
    job.status === "claimed" ? "scheduled" : job.status === "scheduled" ? "delivered" : job.status;
  const { data } = await sb
    .from("jobs")
    .update({ status: next })
    .eq("id", jobId)
    .select("*")
    .maybeSingle();
  return { ok: true, job: data ? toJob(data) : undefined };
}

export async function postJob(sb: SupabaseClient, job: Job): Promise<Job> {
  const { data } = await sb.from("jobs").insert(jobRow(job)).select("*").single();
  return toJob(data);
}
