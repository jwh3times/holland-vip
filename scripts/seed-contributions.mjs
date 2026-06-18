// Seeds lib/github-contributions-fallback.json with a real snapshot of the GitHub
// contribution calendar, so non-token builds (local dev, CI) render real data.
//
// Usage (run from your own terminal so the token never lands in a transcript):
//   GITHUB_TOKEN=<your_pat> node scripts/seed-contributions.mjs        # bash
//   $env:GITHUB_TOKEN="<your_pat>"; node scripts/seed-contributions.mjs # PowerShell
//
// The token only needs the default public read scope (classic: no scopes / `public_repo`;
// fine-grained: read-only). It is read from the env and never written or printed.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const GITHUB_USER = "jwh3times";
const OUT = fileURLToPath(new URL("../lib/github-contributions-fallback.json", import.meta.url));

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("ERROR: set GITHUB_TOKEN in your environment first (it is read from the env).");
  process.exit(1);
}

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "holland-vip-seed",
  },
  body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USER } }),
});

if (!res.ok) {
  console.error(`ERROR: GitHub GraphQL responded ${res.status} ${res.statusText}`);
  process.exit(1);
}

const json = await res.json();
if (json.errors?.length) {
  console.error(`ERROR: GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  process.exit(1);
}

const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
if (!cal) {
  console.error("ERROR: no contribution calendar in response.");
  process.exit(1);
}

const calendar = {
  totalContributions: cal.totalContributions,
  weeks: cal.weeks.map((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }))
  ),
};

await writeFile(OUT, JSON.stringify(calendar, null, 2) + "\n");
console.log(
  `Wrote ${OUT}\n  totalContributions: ${calendar.totalContributions}, weeks: ${calendar.weeks.length}`
);
