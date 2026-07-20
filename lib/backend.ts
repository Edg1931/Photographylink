// -----------------------------------------------------------------------------
// Prototype backend: accounts, sessions, editable companies, and inquiries.
//
// This is the application's data-access layer. Today it is an in-memory
// singleton (state lives for the life of the Node server process — great for a
// single-instance demo, resets on restart / not shared across serverless
// lambdas). It is deliberately shaped so that swapping to Supabase means
// re-implementing THESE functions against Postgres + Supabase Auth, with the
// API routes and UI untouched:
//
//   listCompanies()      -> select * from companies
//   getCompany(slug)     -> select ... where slug = $1
//   updateCompany(...)   -> update companies set ... where slug = $1 (owner check via RLS)
//   signUp / logIn       -> supabase.auth.signUp / signInWithPassword
//   createInquiry(...)   -> insert into inquiries ...  (+ email via edge function)
//
// Auth here is demo-grade (sha256, in-memory sessions) — NOT production. Real
// auth comes with the Supabase swap.
// -----------------------------------------------------------------------------

import { createHash, randomUUID } from "crypto";
import {
  companies as seedCompanies,
  Company,
  Offering,
} from "./data";

export type Role = "company" | "photographer";

export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  displayName: string;
  companySlug?: string; // for company accounts
  createdAt: number;
}

export interface Inquiry {
  id: string;
  companySlug: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: number;
  read: boolean;
}

// ---- State ------------------------------------------------------------------

let companiesState: Company[] = clone(seedCompanies);
const accounts = new Map<string, Account>(); // id -> account
const emailIndex = new Map<string, string>(); // email -> account id
const sessions = new Map<string, string>(); // token -> account id
let inquiries: Inquiry[] = [];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function hash(pw: string): string {
  return createHash("sha256").update(`pl::${pw}`).digest("hex");
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "studio";
  let slug = base;
  let n = 2;
  while (companiesState.some((c) => c.slug === slug)) slug = `${base}-${n++}`;
  return slug;
}

// ---- Companies --------------------------------------------------------------

export function listCompanies(): Company[] {
  return clone(companiesState);
}

export function getCompany(slug: string): Company | undefined {
  const c = companiesState.find((x) => x.slug === slug);
  return c ? clone(c) : undefined;
}

// Fields an owner may edit from the dashboard.
export interface CompanyPatch {
  tagline?: string;
  about?: string;
  accent?: string;
  location?: string;
  baseDayRate?: number;
  equipmentPolicy?: Company["equipmentPolicy"];
  equipmentNotes?: string;
  markets?: string[];
  specialties?: Company["specialties"];
  offerings?: Offering[];
  perks?: string[];
}

export function updateCompany(
  slug: string,
  patch: CompanyPatch,
): Company | undefined {
  const c = companiesState.find((x) => x.slug === slug);
  if (!c) return undefined;
  Object.assign(c, patch);
  return clone(c);
}

// ---- Accounts / sessions ----------------------------------------------------

export interface SignUpInput {
  email: string;
  password: string;
  role: Role;
  displayName: string;
  companyName?: string;
}

export type AuthResult =
  | { ok: true; token: string; account: Account }
  | { ok: false; error: string };

export function signUp(input: SignUpInput): AuthResult {
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
    const slug = slugify(name);
    const company = newCompanyRecord(name, slug, account.displayName);
    companiesState = [company, ...companiesState];
    account.companySlug = slug;
  }

  accounts.set(id, account);
  emailIndex.set(email, id);
  const token = randomUUID();
  sessions.set(token, id);
  return { ok: true, token, account: clone(account) };
}

export function logIn(email: string, password: string): AuthResult {
  const id = emailIndex.get(email.trim().toLowerCase());
  const account = id ? accounts.get(id) : undefined;
  if (!account || account.passwordHash !== hash(password)) {
    return { ok: false, error: "Invalid email or password" };
  }
  const token = randomUUID();
  sessions.set(token, account.id);
  return { ok: true, token, account: clone(account) };
}

export function logOut(token: string): void {
  sessions.delete(token);
}

export function accountFromToken(token: string | undefined): Account | undefined {
  if (!token) return undefined;
  const id = sessions.get(token);
  const acct = id ? accounts.get(id) : undefined;
  return acct ? clone(acct) : undefined;
}

// ---- Inquiries --------------------------------------------------------------

export interface NewInquiry {
  companySlug: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export function createInquiry(input: NewInquiry): Inquiry {
  const inquiry: Inquiry = {
    id: `inq-${randomUUID().slice(0, 8)}`,
    companySlug: input.companySlug,
    name: input.name,
    email: input.email,
    projectType: input.projectType,
    message: input.message,
    createdAt: Date.now(),
    read: false,
  };
  inquiries = [inquiry, ...inquiries];
  // Where a real email/notification would fire (platform + company):
  // await sendEmail(PLATFORM_INBOX, ...); await sendEmail(companyOwnerEmail, ...);
  return clone(inquiry);
}

export function listInquiries(companySlug?: string): Inquiry[] {
  const list = companySlug
    ? inquiries.filter((i) => i.companySlug === companySlug)
    : inquiries;
  return clone(list);
}

export function inquiryCount(companySlug?: string): number {
  return companySlug
    ? inquiries.filter((i) => i.companySlug === companySlug).length
    : inquiries.length;
}

// ---- Helpers ----------------------------------------------------------------

function newCompanyRecord(
  name: string,
  slug: string,
  ownerName: string,
): Company {
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
