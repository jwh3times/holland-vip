// Installs the optional private companion repository (jwh3times/holland-vip-workspace) into the
// public clone's ignored `private/` directory. Intended for a fresh machine or a new git worktree,
// where `private/` is absent because it is gitignored. Idempotent: exits 0 if already installed.
//
//   npm run bootstrap:private
//   npm run bootstrap:private -- --url <credential-free github url>
//   npm run bootstrap:private -- --op-reference "op://<vault>/<item>/<field>"
//   npm run bootstrap:private -- --service-account-reference "op://<vault>/<item>/<field>"
//
// The clone URL is read from 1Password (default reference below) so the locator never has to be
// typed or stored in the public tree; `--url` bypasses 1Password. Git credentials stay in the git
// credential manager and are never read here.
//
// The locator is the only value this script keeps. A `--service-account-reference` token, when one
// is used, is captured into *this* process via spawnSync().stdout and passed to a second `op`
// child in its environment — it is never printed or written to disk, but clearing the local copies
// below is tidiness, not erasure, since the captured stdout string outlives them. See
// docs/agents/workspace-bootstrap.md.
//
// Every run, including the already-installed one, also installs the companion's gitleaks pre-commit
// hook. `.git/hooks` is not versioned, so each machine needs its own copy; the hook is written
// without spawning anything and fails closed when gitleaks is missing. A different existing hook is
// reported and left in place.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privateRoot = join(repositoryRoot, "private");
const defaultReference = "op://holland-vip/holland-vip-workspace/private_repo_url";
const hookScript = [
  "#!/bin/sh",
  "# Installed by `npm run bootstrap:private`: refuse commits whose staged changes hold a credential.",
  "command -v gitleaks >/dev/null 2>&1 || {",
  '  echo "pre-commit: gitleaks is not installed; see https://github.com/gitleaks/gitleaks/releases" >&2',
  "  exit 1",
  "}",
  "exec gitleaks git --pre-commit --staged --redact --no-banner",
  "",
].join("\n");

function installSecretScanHook() {
  const hooksRoot = join(privateRoot, ".git", "hooks");
  const hookPath = join(hooksRoot, "pre-commit");
  if (existsSync(hookPath)) {
    if (readFileSync(hookPath, "utf8") === hookScript) return;
    console.warn(
      "private/.git/hooks/pre-commit already exists with different contents; left unchanged. " +
        "Replace it to enable the gitleaks secret scan."
    );
    return;
  }
  mkdirSync(hooksRoot, { recursive: true });
  writeFileSync(hookPath, hookScript, { mode: 0o755 });
  console.log("Installed the gitleaks pre-commit hook in private/.");
}

let explicitUrl = null;
let reference = defaultReference;
let serviceAccountReference = process.env.HOLLAND_VIP_OP_SERVICE_ACCOUNT_REFERENCE ?? null;
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!["--url", "--op-reference", "--service-account-reference"].includes(argument)) {
    throw new Error(`Unknown argument: ${argument}`);
  }
  const value = process.argv[index + 1];
  if (!value) throw new Error(`${argument} requires a value.`);
  if (argument === "--url") explicitUrl = value;
  else if (argument === "--op-reference") reference = value;
  else serviceAccountReference = value;
  index += 1;
}

if (existsSync(join(privateRoot, ".git"))) {
  console.log("The optional private companion is already installed at private/.");
  installSecretScanHook();
  process.exit(0);
}
if (existsSync(privateRoot) && readdirSync(privateRoot).length > 0) {
  throw new Error(
    "Refusing to overwrite the non-empty private/ directory because it is not a Git worktree."
  );
}

const opRead = (ref, env = process.env) =>
  spawnSync("op", ["read", "--no-newline", ref], { encoding: "utf8", env, windowsHide: true });

let cloneUrl = explicitUrl;
if (!cloneUrl) {
  let result = opRead(reference);
  if ((result.status !== 0 || !result.stdout.trim()) && serviceAccountReference) {
    const tokenResult = opRead(serviceAccountReference);
    let serviceToken = tokenResult.status === 0 ? tokenResult.stdout.trim() : "";
    if (serviceToken) {
      const serviceEnvironment = { ...process.env, OP_SERVICE_ACCOUNT_TOKEN: serviceToken };
      result = opRead(reference, serviceEnvironment);
      serviceEnvironment.OP_SERVICE_ACCOUNT_TOKEN = "";
      serviceToken = "";
    }
  }
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error(
      `Could not read the companion clone URL from ${reference} with the current 1Password ` +
        "identity (run `op signin`, or pass --url / --service-account-reference)."
    );
  }
  cloneUrl = result.stdout.trim();
}
if (/\r|\n/u.test(cloneUrl)) throw new Error("The clone URL must be a single line.");

// Validate the original spelling before URL parsing can normalize dot segments,
// backslashes, or encoded path characters into a different repository locator.
const httpsLocator = /^https:\/\/github\.com(?::443)?\/([^/]+)\/([^/]+)$/iu.exec(cloneUrl);
const sshLocator = /^git@github\.com:([^/]+)\/([^/]+)$/u.exec(cloneUrl);
const locator = httpsLocator ?? sshLocator;
const owner = locator?.[1] ?? "";
const repo = locator?.[2] ?? "";
const repoName = repo.replace(/\.git$/u, "");
if (
  !locator ||
  !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u.test(owner) ||
  !/^[A-Za-z0-9_.-]+$/u.test(repoName) ||
  /^\.+$/u.test(repoName)
) {
  throw new Error(
    "The clone URL must be a credential-free GitHub HTTPS or SSH owner/repository locator " +
      "without an unexpected port, query, fragment, or malformed path."
  );
}
if (httpsLocator) cloneUrl = `https://github.com/${owner}/${repo}`;

const clone = spawnSync("git", ["clone", "--", cloneUrl, privateRoot], {
  stdio: "inherit",
  windowsHide: true,
});
if (clone.status !== 0 || !existsSync(join(privateRoot, ".git"))) {
  throw new Error("The private companion clone did not complete successfully.");
}
installSecretScanHook();
console.log(
  "Private companion installed at private/. Read private/README.md, then the Holland.VIP board on GitHub."
);
