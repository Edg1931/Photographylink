# Supabase setup

The app runs on an **in-memory store by default** and switches to **Supabase
automatically** once these three env vars are present. No code changes are
needed to go live — just provision the project, run the migration, and set the
keys.

## 1. Create a project
1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Pick a name and region, set a database password, and wait for it to finish.

## 2. Run the migration
1. In the dashboard, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) and **Run**.
   - This creates the tables, the atomic `claim_job()` function, and RLS
     policies. It does **not** insert demo rows — the app seeds companies,
     photographers, and jobs from `lib/data.ts` automatically on first load.

## 3. Get your keys
In **Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (under "Project API keys", reveal it) → `SUPABASE_SERVICE_ROLE_KEY`

> The service-role key is a secret. It's only ever used server-side here and is
> never exposed to the browser. Do not commit it.

## 4. Set env vars

**Local:**
```bash
cp .env.example .env.local
# paste your three values into .env.local
npm run dev
```

**Vercel (for the live site):**
1. Vercel → your project → **Settings → Environment Variables**.
2. Add the same three keys (Production + Preview).
3. **Redeploy** (Deployments → ⋯ → Redeploy, or push a commit).

## 5. Verify
- Visit `/signup`, create a company account — it should persist across a server
  restart now (it won't with the in-memory fallback).
- Edit your micro-site in the dashboard, reload the public page — changes stick.
- Submit an inquiry from a micro-site — it appears in the dashboard inbox and
  `/inbox`, and survives restarts.
- In the Supabase dashboard, **Table editor** shows rows in `companies`,
  `accounts`, `jobs`, and `inquiries`.

## What maps where
| App concern | Supabase |
| --- | --- |
| Accounts & sessions | `accounts`, `sessions` tables (server-side, service role) |
| Company micro-sites & offerings | `companies` table (`offerings`/`bench`/`showcase` as JSONB) |
| Job queue | `jobs` table |
| **Atomic claim** | `claim_job(id, slug)` — a single conditional `UPDATE` |
| Inquiries | `inquiries` table |
| Directory reads | `select` on `companies` (public read via RLS) |

## Notes & next steps
- **Auth** here is app-managed (accounts + sessions tables). Upgrading to
  **Supabase Auth** (email verification, OAuth, password reset) is a drop-in
  later — the `accounts` shape is compatible with `auth.users`.
- **Email notifications** for inquiries are stubbed at the marked spot in
  `lib/supabase-repo.ts`'s `createInquiry`. Add a provider (e.g. Resend) +
  a Supabase Edge Function or a server call to send real email.
- **Storage**: portfolio/cover images currently use Unsplash placeholders.
  Wire Supabase Storage for real uploads when you add profile image upload.
