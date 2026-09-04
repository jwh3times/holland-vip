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
// typed or stored in the public tree; `--url` bypasses 1Password. Only the URL is ever read —
// credentials stay in the git credential manager. See docs/agents/workspace-bootstrap.md.

import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privateRoot = join(repositoryRoot, "private");
const defaultReference = "op://holland-vip/holland-vip-workspace/private_repo_url";

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

if (/^https?:\/\//iu.test(cloneUrl)) {
  const parsed = new URL(cloneUrl);
  if (parsed.hostname.toLowerCase() !== "github.com" || parsed.username || parsed.password) {
    throw new Error(
      "The HTTPS clone URL must target github.com and contain no embedded credential."
    );
  }
} else if (!/^git@github\.com:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/u.test(cloneUrl)) {
  throw new Error("The clone URL must be a credential-free GitHub HTTPS or SSH URL.");
}

const clone = spawnSync("git", ["clone", "--", cloneUrl, privateRoot], {
  stdio: "inherit",
  windowsHide: true,
});
if (clone.status !== 0 || !existsSync(join(privateRoot, ".git"))) {
  throw new Error("The private companion clone did not complete successfully.");
}
console.log(
  "Private companion installed at private/. Read private/README.md, then the Holland.VIP board on GitHub."
);
