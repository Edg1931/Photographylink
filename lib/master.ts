// -----------------------------------------------------------------------------
// Master account — a stateless owner login that works on every server instance.
//
// Why stateless: on the in-memory fallback (and on serverless in general),
// accounts and sessions live in per-instance memory, so a normal signup can't
// reliably log back in. The master account sidesteps that entirely: its login
// and its session token are recognized in code, with no lookup in any accounts
// or sessions store — so it works immediately, on Vercel, before Supabase is
// configured.
//
// Credentials are overridable via env (MASTER_EMAIL / MASTER_PASSWORD /
// MASTER_TOKEN). The defaults below are demo values — change them (or set the
// env vars) before any real launch.
// -----------------------------------------------------------------------------

import { Account } from "./backend-types";

export const MASTER_EMAIL = (
  process.env.MASTER_EMAIL ?? "edg1931@gmail.com"
).toLowerCase();
export const MASTER_PASSWORD = process.env.MASTER_PASSWORD ?? "Callsheet!2026";
export const MASTER_DISPLAY = process.env.MASTER_DISPLAY ?? "Ed";

// The company this master account owns/edits. lumen-estates is a fully-populated
// seed studio, so the dashboard opens with real jobs, bench, and offerings.
export const MASTER_COMPANY = process.env.MASTER_COMPANY ?? "lumen-estates";

// Fixed session token for the master account — recognized without any store.
export const MASTER_TOKEN =
  process.env.MASTER_TOKEN ?? "master.callsheet.7f3a9c21e8b4d6f0a5c2";

export const MASTER_ID = "master-account";

export function isMasterLogin(email: string, password: string): boolean {
  return email.trim().toLowerCase() === MASTER_EMAIL && password === MASTER_PASSWORD;
}

export function masterAccount(): Account {
  return {
    id: MASTER_ID,
    email: MASTER_EMAIL,
    passwordHash: "",
    role: "company",
    displayName: MASTER_DISPLAY,
    companySlug: MASTER_COMPANY,
    createdAt: 0,
  };
}
