// Atomic-claim race test.
//
// Fires N concurrent claim requests at the SAME open job from different
// photographers and asserts exactly one wins. Run against a running server:
//
//   npm start &            # or: npm run dev
//   node scripts/race-test.mjs
//
const BASE = process.env.BASE ?? "http://localhost:3000";
const RACERS = [
  "maya-okafor",
  "diego-navarro",
  "harper-lin",
  "sam-whitfield",
  "priya-raman",
  "theo-brandt",
];

async function main() {
  await fetch(`${BASE}/api/reset`, { method: "POST" });

  const { jobs } = await fetch(`${BASE}/api/jobs`).then((r) => r.json());
  const open = jobs.find((j) => j.status === "open");
  if (!open) throw new Error("no open job to race for");

  console.log(`\nRacing ${RACERS.length} photographers for job ${open.id} — "${open.title}"\n`);

  const results = await Promise.all(
    RACERS.map(async (slug) => {
      const res = await fetch(`${BASE}/api/jobs/${open.id}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ photographerSlug: slug }),
      });
      const data = await res.json();
      return { slug, status: res.status, ok: !!data.ok, reason: data.reason };
    }),
  );

  for (const r of results) {
    const mark = r.ok ? "✅ WON " : "❌ lost";
    console.log(`  ${mark}  ${r.slug.padEnd(16)} http ${r.status}${r.reason ? `  (${r.reason})` : ""}`);
  }

  const winners = results.filter((r) => r.ok);
  console.log(`\nWinners: ${winners.length} (expected exactly 1)`);

  // Confirm the server agrees.
  const after = await fetch(`${BASE}/api/jobs`).then((r) => r.json());
  const job = after.jobs.find((j) => j.id === open.id);
  console.log(`Server state: ${job.status} by ${job.claimedBySlug ?? "—"}`);

  if (winners.length !== 1) {
    console.error("\n💥 ATOMICITY VIOLATED — more than one claim succeeded.");
    process.exit(1);
  }
  console.log("\n🎯 Atomic claim holds: exactly one winner.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
