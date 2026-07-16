// Prints the next release version (major.minor.build) that a merge to main will mint,
// matching the tag logic in .github/workflows/version.yml. Single source of truth:
// version.yml, the CI changelog guard, and the /ship skill all call this script.
//
// Reads package.json `version` as the major.minor release line (build acts as a floor),
// scans existing `v<major>.<minor>.*` tags, and prints `<major>.<minor>.<nextBuild>`.
// Requires tags in the working copy (callers run `git fetch --tags` / checkout depth 0).

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));

const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version ?? "");
if (!match) {
  console.error(
    `::error::package.json version '${version}' must be plain <major>.<minor>.<build> SemVer.`
  );
  process.exit(1);
}

const [, major, minor, requested] = match;
const line = `${major}.${minor}`;
const prefix = `v${line}.`;

const tags = execFileSync("git", ["tag", "-l", `${prefix}*`], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const builds = tags
  .filter((tag) => tag.startsWith(prefix))
  .map((tag) => tag.slice(prefix.length))
  .filter((suffix) => /^\d+$/.test(suffix))
  .map(Number);

const requestedBuild = Number(requested);
const build =
  builds.length === 0 ? requestedBuild : Math.max(Math.max(...builds) + 1, requestedBuild);

process.stdout.write(`${line}.${build}\n`);
