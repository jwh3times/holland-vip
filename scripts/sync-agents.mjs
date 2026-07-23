#!/usr/bin/env node
// Regenerate the Codex agent artifacts from their canonical .claude/ sources.
// Usage:
//   node scripts/sync-agents.mjs            regenerate to disk
//   node scripts/sync-agents.mjs --check    verify only (exit 1 if out of sync)
import { relative } from "node:path";
import { syncAll } from "./lib/agent-sync.mjs";

const check = process.argv.includes("--check");
const { changed, stale } = syncAll({ check });
const rel = (f) => relative(process.cwd(), f);

if (changed.length === 0 && stale.length === 0) {
  console.log("Codex agent artifacts are in sync.");
  process.exit(0);
}

if (check) {
  console.error(
    "::error::Codex agent artifacts are out of sync. Run `npm run sync:agents` and commit the result."
  );
  for (const f of changed) console.error(`  out of date: ${rel(f)}`);
  for (const f of stale) console.error(`  extraneous:  ${rel(f)}`);
  process.exit(1);
}

for (const f of changed) console.log(`  wrote:   ${rel(f)}`);
for (const f of stale) console.log(`  removed: ${rel(f)}`);
