import { Job } from "./data";

// Platform fee taken on each job (illustrative). When Stripe Connect is wired,
// this is the application_fee on the split payment. Overridable via env.
export const PLATFORM_FEE_PCT = Number(process.env.PLATFORM_FEE_PCT ?? 0.06);

// How many days after delivery a photographer is paid (shown as "pays in Nd").
export const PAYOUT_DAYS = Number(process.env.PAYOUT_DAYS ?? 3);

export interface Economics {
  clientPrice: number; // what the client pays the company for this service
  payout: number; // what the photographer earns
  fee: number; // platform fee
  net: number; // what the company keeps
}

export function economicsFor(job: Job): Economics {
  const payout = job.payout;
  // If a client price wasn't set, estimate a healthy margin so numbers are sane.
  const clientPrice = job.clientPrice ?? Math.round(payout / 0.6);
  const fee = Math.round(payout * PLATFORM_FEE_PCT * 100) / 100;
  const net = Math.round((clientPrice - payout - fee) * 100) / 100;
  return { clientPrice, payout, fee, net };
}

export function money(n: number): string {
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
