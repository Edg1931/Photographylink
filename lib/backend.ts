// -----------------------------------------------------------------------------
// Data-access layer. Exposes ONE async API to the app. Internally it uses
// Supabase when configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
// and otherwise falls back to an in-memory singleton so the app works before
// Supabase is provisioned.
//
//   Supabase path  -> lib/supabase-repo.ts (Postgres)
//   Fallback path  -> the in-memory maps below
//
// Swapping is transparent to callers: every export is async.
// -----------------------------------------------------------------------------

import { createHash, randomUUID } from "crypto";
import {
  companies as seedCompanies,
  photographers as seedPhotographers,
  Company,
  Member,
  Photographer,
} from "./data";
import { getSupabase } from "./supabase";
import * as repo from "./supabase-repo";
import {
  isMasterLogin,
  masterAccount,
  MASTER_TOKEN,
  MASTER_EMAIL,
} from "./master";
import {
  Account,
  Inquiry,
  Role,
  CompanyPatch,
  PhotographerPatch,
  NewInquiry,
  SignUpInput,
  AuthResult,
} from "./backend-types";

export type { Account, Inquiry, Role, CompanyPatch, PhotographerPatch, NewInquiry, SignUpInput, AuthResult };

// ---- In-memory fallback state ----------------------------------------------

let companiesState: Company[] = clone(seedCompanies);
let photographersState: Photographer[] = clone(seedPhotographers);
const accounts = new Map<string, Account>();
const emailIndex = new Map<string, string>();
const sessions = new Map<string, string>();
let inquiries: Inquiry[] = [];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
function hash(pw: string): string {
  return createHash("sha256").update(`pl::${pw}`).digest("hex");
}
function slugBase(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "studio"
  );
}

// ---- Companies --------------------------------------------------------------

export async function listCompanies(): Promise<Company[]> {
  const sb = getSupabase();
  if (sb) return repo.listCompanies(sb);
  return clone(companiesState);
}

export async function getCompany(slug: string): Promise<Company | undefined> {
  const sb = getSupabase();
  if (sb) return repo.getCompany(sb, slug);
  const c = companiesState.find((x) => x.slug === slug);
  return c ? clone(c) : undefined;
}

export async function updateCompany(
  slug: string,
  patch: CompanyPatch,
): Promise<Company | undefined> {
  const sb = getSupabase();
  if (sb) return repo.updateCompany(sb, slug, patch);
  const c = companiesState.find((x) => x.slug === slug);
  if (!c) return undefined;
  Object.assign(c, patch);
  return clone(c);
}

// ---- Photographers ----------------------------------------------------------

export async function listPhotographers(): Promise<Photographer[]> {
  const sb = getSupabase();
  if (sb) return repo.listPhotographers(sb);
  return clone(photographersState);
}

export async function getPhotographerRecord(
  slug: string,
): Promise<Photographer | undefined> {
  const sb = getSupabase();
  if (sb) return repo.getPhotographer(sb, slug);
  const p = photographersState.find((x) => x.slug === slug);
  return p ? clone(p) : undefined;
}

export async function updatePhotographer(
  slug: string,
  patch: PhotographerPatch,
): Promise<Photographer | undefined> {
  const sb = getSupabase();
  if (sb) return repo.updatePhotographer(sb, slug, patch);
  const p = photographersState.find((x) => x.slug === slug);
  if (!p) return undefined;
  Object.assign(p, patch);
  return clone(p);
}

// ---- Bench members ----------------------------------------------------------

export interface AddMemberInput {
  name: string;
  email: string;
  phone?: string;
  rate?: number;
}

export async function addMember(
  slug: string,
  input: AddMemberInput,
): Promise<Member | undefined> {
  const company = await getCompany(slug);
  if (!company) return undefined;
  const member: Member = {
    id: `mem-${randomUUID().slice(0, 6)}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    rate: input.rate,
    status: "active",
    avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(
      input.email || input.name,
    )}`,
  };
  await updateCompany(slug, { members: [...company.members, member] });
  return member;
}

export async function removeMember(slug: string, memberId: string): Promise<void> {
  const company = await getCompany(slug);
  if (!company) return;
  await updateCompany(slug, {
    members: company.members.filter((m) => m.id !== memberId),
  });
}

export async function getMember(
  slug: string,
  memberId: string,
): Promise<Member | undefined> {
  const company = await getCompany(slug);
  return company?.members.find((m) => m.id === memberId);
}

export interface ApplicationInput {
  name: string;
  email: string;
  phone?: string;
  gear?: string;
  experience?: string;
  sampleUrl?: string;
  photographerSlug?: string;
}

/** A photographer applies to a company's bench — creates a PENDING member. */
export async function applyToCompany(
  slug: string,
  input: ApplicationInput,
): Promise<{ ok: boolean; member?: Member; error?: string }> {
  const company = await getCompany(slug);
  if (!company) return { ok: false, error: "Company not found" };
  const email = input.email.trim().toLowerCase();
  const existing = company.members.find((m) => m.email.toLowerCase() === email);
  if (existing) {
    return {
      ok: false,
      error:
        existing.status === "pending"
          ? "You've already applied — they're reviewing it."
          : "You're already on this bench.",
    };
  }
  const member: Member = {
    id: `mem-${randomUUID().slice(0, 6)}`,
    name: input.name,
    email,
    phone: input.phone,
    status: "pending",
    avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(email)}`,
    photographerSlug: input.photographerSlug,
    gear: input.gear,
    experience: input.experience,
    sampleUrl: input.sampleUrl,
    appliedAt: Date.now(),
  };
  await updateCompany(slug, { members: [...company.members, member] });
  addNotification(slug, "application", `${member.name} applied to your bench`, "/dashboard");
  return { ok: true, member };
}

/** Company approves a pending applicant → they become active (in the queue). */
export async function approveMember(
  slug: string,
  memberId: string,
): Promise<Member | undefined> {
  const company = await getCompany(slug);
  if (!company) return undefined;
  const members = company.members.map((m) =>
    m.id === memberId ? { ...m, status: "active" as const } : m,
  );
  await updateCompany(slug, { members });
  return members.find((m) => m.id === memberId);
}

// ---- Accounts / sessions ----------------------------------------------------

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (input.email.trim().toLowerCase() === MASTER_EMAIL) {
    return { ok: false, error: "That email is reserved — just log in with it." };
  }
  const sb = getSupabase();
  if (sb) return repo.signUp(sb, input, newCompanyRecord, newPhotographerRecord, slugBase);

  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "Email and password required" };
  if (emailIndex.has(email)) return { ok: false, error: "That email already has an account" };

  const id = randomUUID();
  const account: Account = {
    id,
    email,
    passwordHash: hash(input.password),
    role: input.role,
    displayName: input.displayName || email.split("@")[0],
    createdAt: Date.now(),
  };
  if (input.role === "company") {
    const name = input.companyName?.trim() || `${account.displayName}'s Studio`;
    const base = slugBase(name);
    let slug = base;
    let n = 2;
    while (companiesState.some((c) => c.slug === slug)) slug = `${base}-${n++}`;
    companiesState = [newCompanyRecord(name, slug, account.displayName), ...companiesState];
    account.companySlug = slug;
  } else if (input.role === "photographer") {
    const base = slugBase(account.displayName) || "photographer";
    let slug = base;
    let n = 2;
    while (photographersState.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
    photographersState = [
      newPhotographerRecord(account.displayName, slug),
      ...photographersState,
    ];
    account.photographerSlug = slug;
  }
  accounts.set(id, account);
  emailIndex.set(email, id);
  const token = randomUUID();
  sessions.set(token, id);
  return { ok: true, token, account: clone(account) };
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  // Master account: recognized statelessly so it always works, on any instance.
  if (isMasterLogin(email, password)) {
    return { ok: true, token: MASTER_TOKEN, account: masterAccount() };
  }
  const sb = getSupabase();
  if (sb) return repo.logIn(sb, email, password);

  const id = emailIndex.get(email.trim().toLowerCase());
  const account = id ? accounts.get(id) : undefined;
  if (!account || account.passwordHash !== hash(password)) {
    return { ok: false, error: "Invalid email or password" };
  }
  const token = randomUUID();
  sessions.set(token, account.id);
  return { ok: true, token, account: clone(account) };
}

export async function logOut(token: string): Promise<void> {
  const sb = getSupabase();
  if (sb) return repo.logOut(sb, token);
  sessions.delete(token);
}

export async function accountFromToken(
  token: string | undefined,
): Promise<Account | undefined> {
  if (!token) return undefined;
  // Master session is recognized without any store lookup.
  if (token === MASTER_TOKEN) return masterAccount();
  const sb = getSupabase();
  if (sb) return repo.accountFromToken(sb, token);
  const id = sessions.get(token);
  const acct = id ? accounts.get(id) : undefined;
  return acct ? clone(acct) : undefined;
}

// ---- Inquiries --------------------------------------------------------------

export async function createInquiry(input: NewInquiry): Promise<Inquiry> {
  addNotification(input.companySlug, "inquiry", `New inquiry from ${input.name}`, "/dashboard");
  const sb = getSupabase();
  if (sb) return repo.createInquiry(sb, input);
  const inquiry: Inquiry = {
    id: `inq-${randomUUID().slice(0, 8)}`,
    ...input,
    createdAt: Date.now(),
    read: false,
  };
  inquiries = [inquiry, ...inquiries];
  return clone(inquiry);
}

export async function listInquiries(companySlug?: string): Promise<Inquiry[]> {
  const sb = getSupabase();
  if (sb) return repo.listInquiries(sb, companySlug);
  const list = companySlug
    ? inquiries.filter((i) => i.companySlug === companySlug)
    : inquiries;
  return clone(list);
}

// ---- Notifications ----------------------------------------------------------
// In-app activity feed for the company (new applications, claims, inquiries).
// This is where real email/SMS would fire — see the marked hook below.

export interface Notification {
  id: string;
  companySlug: string;
  type: "application" | "claim" | "inquiry";
  text: string;
  href?: string;
  at: number;
  read: boolean;
}

const notifications = new Map<string, Notification[]>();

export function addNotification(
  companySlug: string,
  type: Notification["type"],
  text: string,
  href?: string,
): void {
  const n: Notification = {
    id: `ntf-${randomUUID().slice(0, 6)}`,
    companySlug,
    type,
    text,
    href,
    at: Date.now(),
    read: false,
  };
  const list = notifications.get(companySlug) ?? [];
  notifications.set(companySlug, [n, ...list].slice(0, 100));
  // --- Real delivery hook (needs a provider) -------------------------------
  // Add an email/SMS provider (e.g. Resend / Twilio) and send here so the
  // owner is alerted off-platform:
  //   await sendEmail(ownerEmail, text); await sendSms(ownerPhone, text);
}

export function listNotifications(companySlug: string): Notification[] {
  return (notifications.get(companySlug) ?? []).map((n) => ({ ...n }));
}

export function markNotificationsRead(companySlug: string): void {
  (notifications.get(companySlug) ?? []).forEach((n) => (n.read = true));
}

// ---- Helpers ----------------------------------------------------------------

function newPhotographerRecord(name: string, slug: string): Photographer {
  return {
    slug,
    name,
    avatar: `https://i.pravatar.cc/240?u=${encodeURIComponent(slug)}`,
    cover:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
    location: "Your area",
    radiusMiles: 30,
    headline: "New here — add a headline that sells you in one line.",
    bio: "Tell companies about your style, your turnaround, and what you love shooting.",
    specialties: ["Real Estate"],
    rating: 5,
    reviewCount: 0,
    jobsCompleted: 0,
    onTimeRate: 100,
    responseHours: 2,
    dayRate: 350,
    halfDayRate: 200,
    availableNow: true,
    experienceYears: 0,
    ownsGear: [],
    networks: [],
    portfolio: [],
  };
}

function newCompanyRecord(name: string, slug: string, ownerName: string): Company {
  void ownerName;
  const covers = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
  ];
  const showcase = [
    "photo-1600585154340-be6161a56a0c",
    "photo-1600566753086-00f18fb6b3ea",
    "photo-1600607687939-ce8a6c25118c",
    "photo-1600047509807-ba8f99d2cdde",
    "photo-1600585152220-90363fe7e115",
    "photo-1580587771525-78b9dba3b914",
  ].map((id, i) => ({
    src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`,
    label: `Sample ${i + 1}`,
  }));

  return {
    slug,
    name,
    logoMark: name.trim().charAt(0).toUpperCase() || "S",
    cover: covers[slug.length % covers.length],
    location: "Your market",
    markets: ["Your city"],
    tagline: "Tell clients what you do best.",
    about:
      "This is your company micro-site. Head to your dashboard to edit your story, markets, rates, equipment policy, and the services you offer.",
    accent: "#e8a94b",
    specialties: ["Real Estate"],
    rating: 5,
    reviewCount: 0,
    shootsPerMonth: 0,
    baseDayRate: 350,
    equipmentPolicy: "either",
    equipmentNotes: "Describe what gear you provide vs. expect shooters to bring.",
    wantsEquipment: "e.g. Full-frame body + wide lens. Drone a plus.",
    wantsExperience: "e.g. 1+ year shooting real estate; comfortable with a shot list.",
    payTerms: "e.g. $150–$250 per listing, paid weekly by direct deposit.",
    perks: ["Add the perks that make shooters want to join your bench."],
    offerings: [
      {
        title: "Standard listing package",
        price: 175,
        unit: "per listing",
        blurb: "Describe your core deliverable.",
      },
    ],
    bench: [],
    members: [],
    showcase,
  };
}
