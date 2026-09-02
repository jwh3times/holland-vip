/**
 * Move the public checkout and its optional private companion to `main`, then
 * fast-forward both from `origin/main`.
 *
 * Usage:
 *
 *   npm run sync:main
 *   npm run sync:main -- --skip-private
 *
 * The repositories are independent Git checkouts with separate remotes. This
 * command refuses uncommitted changes instead of stashing them and uses
 * `--ff-only` so it cannot create merge commits or discard divergent work.
 * A missing private companion is reported and skipped.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MAIN_BRANCH = "main";
export const PRIVATE_TARGET = "private";

/**
 * @param {readonly string[]} argv
 * @returns {{ syncPrivate: boolean }}
 */
export function parseArgs(argv) {
  let syncPrivate = true;
  for (const argument of argv) {
    if (argument === "--skip-private") syncPrivate = false;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return { syncPrivate };
}

/** @param {string} porcelain */
export function isDirty(porcelain) {
  return porcelain.trim().length > 0;
}

const MARKS = {
  updated: "+",
  current: "=",
  skipped: "-",
  failed: "x",
};

/**
 * @typedef {"updated" | "current" | "skipped" | "failed"} SyncStatus
 * @typedef {{ label: string, status: SyncStatus, detail: string }} SyncResult
 * @typedef {{ status: number, stdout: string, stderr: string }} GitRun
 * @typedef {(root: string, args: readonly string[]) => GitRun} GitRunner
 */

/** @param {SyncResult} result */
export function describeResult(result) {
  return `${MARKS[result.status]} ${result.label}: ${result.detail}`;
}

/** @type {GitRunner} */
export const runGit = (root, args) => {
  const result = spawnSync("git", [...args], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
};

/** @param {string} output */
function firstLine(output) {
  return (
    output
      .split("\n")
      .map((value) => value.trim())
      .find(Boolean) ?? "no output"
  );
}

/**
 * @param {string} root
 * @param {string} label
 * @param {GitRunner} [git]
 * @returns {SyncResult}
 */
export function syncRepository(root, label, git = runGit) {
  /** @param {string} detail */
  const fail = (detail) => ({ label, status: /** @type {const} */ ("failed"), detail });

  if (!existsSync(path.join(root, ".git"))) {
    return { label, status: "skipped", detail: `no Git repository at ${root}` };
  }

  const status = git(root, ["status", "--porcelain"]);
  if (status.status !== 0) return fail(firstLine(status.stderr));
  if (isDirty(status.stdout)) {
    return fail("uncommitted changes; commit or stash them, then run this again");
  }

  const fetch = git(root, ["fetch", "--prune", "origin"]);
  if (fetch.status !== 0) return fail(firstLine(fetch.stderr));

  const previousBranch = git(root, ["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
  const beforeResult = git(root, ["rev-parse", MAIN_BRANCH]);
  if (beforeResult.status !== 0) return fail(firstLine(beforeResult.stderr));
  const before = beforeResult.stdout.trim();

  if (previousBranch !== MAIN_BRANCH) {
    const checkout = git(root, ["checkout", MAIN_BRANCH]);
    if (checkout.status !== 0) return fail(firstLine(checkout.stderr));
  }

  const merge = git(root, ["merge", "--ff-only", `origin/${MAIN_BRANCH}`]);
  if (merge.status !== 0) return fail(firstLine(merge.stderr));

  const after = git(root, ["rev-parse", "HEAD"]).stdout.trim();
  const switched = previousBranch === MAIN_BRANCH ? "" : ` (was on ${previousBranch})`;
  if (before === after) {
    return {
      label,
      status: "current",
      detail: `${MAIN_BRANCH} already up to date at ${after.slice(0, 7)}${switched}`,
    };
  }

  const count = git(root, ["rev-list", "--count", `${before}..${after}`]).stdout.trim();
  const commits = count && count !== "0" ? `, ${count} new commit(s)` : "";
  return {
    label,
    status: "updated",
    detail: `${MAIN_BRANCH} now at ${after.slice(0, 7)}${commits}${switched}`,
  };
}

/** @param {readonly string[]} argv */
export function main(argv) {
  const { syncPrivate } = parseArgs(argv);
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const results = [syncRepository(repositoryRoot, "holland-vip")];

  if (syncPrivate) {
    const privateRoot = path.join(repositoryRoot, PRIVATE_TARGET);
    if (existsSync(path.join(privateRoot, ".git"))) {
      results.push(syncRepository(privateRoot, "private companion"));
    } else {
      results.push({
        label: "private companion",
        status: "skipped",
        detail: `not installed at ${privateRoot}; run \`npm run bootstrap:private\``,
      });
    }
  }

  for (const result of results) console.log(describeResult(result));
  return results.some((result) => result.status === "failed") ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
