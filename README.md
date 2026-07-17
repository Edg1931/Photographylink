# Photographylink

The two-sided network where **photography companies build a trained bench of
freelance shooters** and **photographers find steady, transparent work** — with
a job **queue** at the center: post a shoot, and the first qualified, available,
well-rated pro in the area claims it.

This repository is a **working visual prototype** of that idea. It's a real
Next.js app with polished, production-quality UI, driven entirely by mock data
in [`lib/data.ts`](./lib/data.ts). It exists to make the concept tangible and
shareable before we build the real backend.

---

## The core insight

A photography company's growth is capped by a single problem: **you can only
take as many jobs as your photographers have hours.** When one quits, you're
back to job ads, interviews, and weeks of training — and quality drifts every
time. Photographylink replaces that treadmill with a **bench + queue** model:

- **Companies** keep a stable of vetted, style-matched shooters. Overflow,
  vacations, and multi-shooter days get dropped into a **queue**.
- **The first trained, available, qualified photographer claims the job.** No
  bidding, no chasing. Whoever takes it already knows how you deliver.
- **Ratings travel with each photographer** across every company they shoot for.

## What's in the prototype

| Route | What it shows |
| --- | --- |
| `/` | Landing page — the pitch, the problem, an animated live-queue demo |
| `/photographers` | Marketplace directory with live filtering & sorting |
| `/photographers/[slug]` | A photographer's portfolio micro-site |
| `/companies/[slug]` | A company's **branded** micro-site (bench, rates, jobs) |
| `/jobs` | The live job **queue** board (open → in progress → delivered) |
| `/how-it-works` | Both-sides walkthrough + a pricing sketch |

### Design language
Dark, cinematic, editorial — built to make visual professionals want to sign
up. Golden-hour amber accent, `Fraunces` display serif + `Inter`, a filmy grain
texture, and motion used sparingly (the queue demo, live-status dots).

## Tech

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- No database yet — everything renders from typed mock data, so the shapes in
  `lib/data.ts` double as the future schema.

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build a production bundle:

```bash
npm run build && npm start
```

## Deploying

The app is Vercel-ready — push the branch and import the repo, or run
`vercel`. No environment variables are required for the prototype.

## Where this goes next

The mock-data types are designed to become real tables. The natural next phase:

1. **Supabase** for auth (company vs. photographer roles), a Postgres schema
   mirroring `lib/data.ts`, and image storage for portfolios.
2. **Real queue mechanics** — post a job, notify a company's bench, atomic
   "claim" so exactly one photographer gets each job.
3. **Ratings & reviews** that aggregate across companies.
4. **Templated micro-sites** rendered from company/photographer records.
5. A **mobile app** sharing the same API (React Native / Expo).

---

_Prototype — all photographers, companies, jobs, and reviews are fictional and
images are placeholders._
