// Shared types for the data layer — imported by both the in-memory backend
// (backend.ts / store.ts) and the Supabase implementation (supabase-repo.ts).
// Kept in their own module so the two implementations never import each other.

import { Company, Job, Offering, Member } from "./data";

export type Role = "company" | "photographer";

export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  displayName: string;
  companySlug?: string;
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

export interface CompanyPatch {
  tagline?: string;
  about?: string;
  accent?: string;
  location?: string;
  baseDayRate?: number;
  equipmentPolicy?: Company["equipmentPolicy"];
  equipmentNotes?: string;
  wantsEquipment?: string;
  wantsExperience?: string;
  payTerms?: string;
  markets?: string[];
  specialties?: Company["specialties"];
  offerings?: Offering[];
  perks?: string[];
  members?: Member[];
}

export interface NewInquiry {
  companySlug: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
}

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
  assignedToSlug?: string;
  date?: string;
}
