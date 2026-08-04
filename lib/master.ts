// -----------------------------------------------------------------------------
// Demo / owner logins — recognized statelessly so they ALWAYS work, on every
// server instance, even on serverless where normal in-memory signups don't
// persist. Use these to explore both back ends before Supabase is connected.
//
//   Company owner  →  company dashboard (owns the Lumen Estates studio)
//   Photographer   →  photographer dashboard (owns the Maya Okafor profile)
//
// Credentials are overridable via env. Defaults below are demo values — change
// them before any real launch.
// -----------------------------------------------------------------------------

import { Account, Role } from "./backend-types";

interface Demo {
  id: string;
  email: string;
  password: string;
  token: string;
  role: Role;
  displayName: string;
  companySlug?: string;
  photographerSlug?: string;
}

export const MASTER_EMAIL = (
  process.env.MASTER_EMAIL ?? "edg1931@gmail.com"
).toLowerCase();
export const MASTER_PASSWORD = process.env.MASTER_PASSWORD ?? "Callsheet!2026";
export const MASTER_COMPANY = process.env.MASTER_COMPANY ?? "lumen-estates";
const MASTER_DISPLAY = process.env.MASTER_DISPLAY ?? "Ed";
const MASTER_TOKEN =
  process.env.MASTER_TOKEN ?? "master.callsheet.7f3a9c21e8b4d6f0a5c2";

export const PHOTOGRAPHER_EMAIL = (
  process.env.DEMO_PHOTOGRAPHER_EMAIL ?? "photographer@callsheet.demo"
).toLowerCase();
export const PHOTOGRAPHER_PASSWORD =
  process.env.DEMO_PHOTOGRAPHER_PASSWORD ?? "Callsheet!2026";
const PHOTOGRAPHER_TOKEN =
  process.env.DEMO_PHOTOGRAPHER_TOKEN ?? "demo.photographer.3b7c11ad92fe";

const DEMOS: Demo[] = [
  {
    id: "master-account",
    email: MASTER_EMAIL,
    password: MASTER_PASSWORD,
    token: MASTER_TOKEN,
    role: "company",
    displayName: MASTER_DISPLAY,
    companySlug: MASTER_COMPANY,
  },
  {
    id: "demo-photographer",
    email: PHOTOGRAPHER_EMAIL,
    password: PHOTOGRAPHER_PASSWORD,
    token: PHOTOGRAPHER_TOKEN,
    role: "photographer",
    displayName: "Maya Okafor",
    photographerSlug: "maya-okafor",
  },
];

function toAccount(d: Demo): Account {
  return {
    id: d.id,
    email: d.email,
    passwordHash: "",
    role: d.role,
    displayName: d.displayName,
    companySlug: d.companySlug,
    photographerSlug: d.photographerSlug,
    createdAt: 0,
  };
}

export function demoLogin(email: string, password: string): Account | undefined {
  const e = email.trim().toLowerCase();
  const d = DEMOS.find((x) => x.email === e && x.password === password);
  return d ? toAccount(d) : undefined;
}

export function demoTokenFor(email: string): string | undefined {
  const e = email.trim().toLowerCase();
  return DEMOS.find((x) => x.email === e)?.token;
}

export function demoAccountByToken(token: string): Account | undefined {
  const d = DEMOS.find((x) => x.token === token);
  return d ? toAccount(d) : undefined;
}

export function isDemoEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return DEMOS.some((x) => x.email === e);
}
