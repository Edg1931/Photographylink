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
import { companies as seedCompanies, Company } from "./data";
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
  NewInquiry,
  SignUpInput,
  AuthResult,
} from "./backend-types";

export type { Account, Inquiry, Role, CompanyPatch, NewInquiry, SignUpInput, AuthResult };

// ---- In-memory fallback state ----------------------------------------------

let companiesState: Company[] = clone(seedCompanies);
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

// ---- Accounts / sessions ----------------------------------------------------

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (input.email.trim().toLowerCase() === MASTER_EMAIL) {
    return { ok: false, error: "That email is reserved — just log in with it." };
  }
  const sb = getSupabase();
  if (sb) return repo.signUp(sb, input, newCompanyRecord, slugBase);

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

// ---- Helpers ----------------------------------------------------------------

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
    showcase,
  };
}
