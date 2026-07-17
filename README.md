# Callsheet

> Working brand name — see [`docs/BRAND_AND_MARKETING.md`](./docs/BRAND_AND_MARKETING.md)
> for the research and rationale (and alternates). The name lives in
> [`lib/brand.ts`](./lib/brand.ts) and is a one-line change. Repo is still
> `Photographylink`.

The two-sided network where **photography companies build a trained bench of
freelance shooters** and **photographers find steady, transparent work** — with
a job **queue** at the center: post a shoot, and the first qualified, available,
well-rated pro in the area **claims** it.

This repository is a **working prototype** with real, functional claim
mechanics. Profiles and marketplace content render from typed mock data in
[`lib/data.ts`](./lib/data.ts); the job queue is backed by a real server store
with an **atomic claim** guarantee (no database yet — by design, so we can
validate the feel before wiring up infrastructure).

---

## The core insight

A photography company's growth is capped by one problem: **you can only take as
many jobs as your photographers have hours.** When one quits, you're back to job
ads, interviews, and weeks of training — and quality drifts every time.
Callsheet replaces that treadmill with a **bench + queue** model, the direct
answer to a documented structural failure in freelance-photographer reliability
(see the marketing profile).

## What's in the prototype

| Route | What it shows |
| --- | --- |
| `/` | Landing — the pitch, the problem, an animated live-queue demo |
| `/photographers` | Marketplace directory with live filtering & sorting |
| `/photographers/[slug]` | A photographer's portfolio micro-site |
| `/companies/[slug]` | A company's **branded** micro-site (bench, rates, jobs) |
| `/jobs` | The **live, functional** job queue — claim, race, post, reset |
| `/how-it-works` | Both-sides walkthrough + pricing sketch |

## The atomic claim engine

The thing the product hinges on: when a job is dropped into the queue and the
whole bench is notified, **exactly one** photographer may win the claim — even
if several tap "Claim" in the same instant.

- **Store:** [`lib/store.ts`](./lib/store.ts) — an in-memory singleton with an
  **async mutex** that serializes the read-check-write. An artificial latency
  inside the critical section models a real DB round-trip and makes the race
  genuine. This is the exact behavior a Postgres
  `UPDATE jobs SET claimed_by=$1 WHERE id=$2 AND claimed_by IS NULL` (or
  `SELECT … FOR UPDATE`) gives — so moving to Supabase later changes only this
  file.
- **API:**
  - `GET  /api/jobs` — list jobs
  - `POST /api/jobs` — post a job to the queue
  - `POST /api/jobs/:id/claim` — atomic claim (`{ photographerSlug }`) → `200` win / `409` already claimed
  - `POST /api/jobs/:id/advance` — claimed → scheduled → delivered
  - `GET  /api/claim-log` — every claim attempt the server saw
  - `POST /api/reset` — reset demo to seed data
- **UI:** the `/jobs` board lets you claim as any photographer, **post** a job,
  **advance** it, and run **"simulate 5 shooters racing"** to watch exactly one
  win — with a live activity log that shows the wins and the rejected losses.

### Prove it yourself

```bash
npm run build && npm start        # in one terminal
node scripts/race-test.mjs        # in another
```

Output: 6 concurrent claims on one job → `1 WON`, `5 lost (already_claimed)`,
and the server confirms a single consistent owner.

## Design & brand

Dark, cinematic, gallery-first — built to make visual professionals want to sign
up. Golden-hour **amber** drives the photographer/claim experience; a slate
**blue** anchors the company/trust side (a research-backed dual accent,
deliberately non-green to separate from commodity gig marketplaces). `Fraunces`
display serif + `Inter`. Full rationale in
[`docs/BRAND_AND_MARKETING.md`](./docs/BRAND_AND_MARKETING.md).

## Tech

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- Route handlers for the claim API; in-memory store for state
- No database yet — mock-data shapes in `lib/data.ts` are designed to become the
  future schema

## Run it locally

```bash
npm install
npm run dev            # http://localhost:3000
```

## Where this goes next

1. **Supabase** — auth (company vs. photographer roles), a Postgres schema
   mirroring `lib/data.ts`, portfolio image storage. Swap `lib/store.ts`'s mutex
   for a conditional `UPDATE` — the API and UI stay identical.
2. **Notifications** — push/SMS to the bench when a job posts.
3. **Ratings & reviews** aggregated across companies.
4. **Templated micro-sites** rendered from records.
5. A **mobile app** sharing the same API.

---

_Prototype — all photographers, companies, jobs, and reviews are fictional and
images are placeholders._
