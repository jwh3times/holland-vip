# Workspace bootstrap

The public repository is self-contained. Maintainers who need confidential operating context also
clone the private `jwh3times/holland-vip-workspace` repository into the public clone's ignored
`private/` directory. It is an independent nested repository, not a submodule.

## Prerequisites

Install:

- Git
- Node.js at the version in `.nvmrc`
- GitHub CLI (`gh`)
- 1Password desktop with CLI integration enabled
- 1Password CLI (`op`)

## Authenticate

Unlock or sign in to 1Password, then verify access without reading an item value:

```powershell
op --version
op account list
op vault list
```

Authenticate GitHub through its supported browser and credential-manager flow:

```powershell
gh auth login
gh auth status
```

Keep GitHub's authentication in its credential manager. Never print `gh auth token`, copy it into a
workspace, or transfer it manually to 1Password.

## Clone both repositories

Clone the public repository first:

```powershell
git clone https://github.com/jwh3times/holland-vip.git
Set-Location holland-vip
```

After `npm ci`, the fastest path — and the one to use for every new git worktree, where `private/`
is absent because it is ignored — is the bootstrap script:

```powershell
npm run bootstrap:private
```

[`scripts/bootstrap-private.mjs`](../../scripts/bootstrap-private.mjs) reads the clone locator from
`op://holland-vip/holland-vip-workspace/private_repo_url`, rejects any URL that is not a
credential-free `github.com` HTTPS/SSH locator, clones it into `private/`, and exits 0 without
touching anything if `private/.git` already exists (it refuses to overwrite a non-empty `private/`
that is not a repository).

`--url <locator>` bypasses 1Password, `--op-reference` points at a different field, and
`--service-account-reference` (or the `HOLLAND_VIP_OP_SERVICE_ACCOUNT_REFERENCE` environment
variable) names a field holding a 1Password service-account token to retry with when the
interactive identity cannot read the item.

### What the already-installed shortcut proves

It checks **presence, not identity**. It confirms a Git worktree is there; it does not confirm the
installed companion is the expected repository, has the expected remote, or is still private, so a
re-run over a wrong or renamed companion still reports success. This supports idempotence; it is
not recovery attestation.

Verifying identity is deliberately not done there. The shortcut runs before any 1Password read and
spawns no subprocess at all — that is what makes a re-run instant, offline, and credential-free —
and comparing the remote against an expected locator would cost exactly the work the path exists to
skip. After a recovery, confirm it yourself:

```powershell
git -C private remote get-url origin
```

### Where the service-account token lives

The locator is the only value the script keeps. The service-account token, when one is used, is
read by an `op` child process and captured into the **bootstrap process** through
`spawnSync().stdout`, then passed to a second `op` child in its environment. Nothing prints it and
nothing writes it to disk, but the bootstrap process does hold it: the script clears its local
copies afterwards, and that is tidiness rather than a guarantee, since the captured `stdout` string
stays reachable until the process exits. Treat the token's blast radius as the lifetime of the
bootstrap process, not the lifetime of an `op` child.

### Accepted locators

Supported locators are `https://github.com/<owner>/<repository>` (with an optional `.git`
suffix or explicit default port `443`) and `git@github.com:<owner>/<repository>`. HTTPS scheme
and hostname casing are normalized before Git runs. Plain HTTP, credentials in the URL,
unexpected ports, query strings, fragments, and malformed owner/repository paths are rejected.
Explicit invalid `--url` values invoke neither Git nor 1Password; locators read from 1Password
pass the same validation before Git runs.

The companion name is intentionally public, so the equivalent manual clone is:

```powershell
git clone https://github.com/jwh3times/holland-vip-workspace.git private
```

If a future companion name or locator is intentionally private, retrieve only the locator without
displaying it (this is what the script does):

```powershell
$privateRepoUrl = op read "op://holland-vip/holland-vip-workspace/private_repo_url"
git clone -- $privateRepoUrl private
Remove-Variable privateRepoUrl
```

The commands in this document are written for PowerShell; every step maps one-to-one to bash
(`cp` for `Copy-Item`, `cat` for `Get-Content`), and `npm run bootstrap:private` is identical on
both.

An HTTPS repository locator without an embedded credential may be passed to `git clone`; credential
values still flow only through `op run` or direct standard input. Never add `.gitmodules`, stage
`private/` with `git add -f`, or copy a token into the clone URL.

Verify the boundary:

```powershell
git -C private remote -v
git -C private status -sb
git status --short --untracked-files=all
```

The first two commands must describe the companion repository. The root status must not list any
`private/` content.

## Sync an existing workspace

From the public repository root, move both independent repositories to `main` and fast-forward
them from `origin/main`:

```powershell
npm run sync:main
```

The command refuses dirty worktrees and divergent branches rather than stashing changes or
creating merge commits. If the private companion is not installed, it reports and skips it. Use
`npm run sync:main -- --skip-private` when only the public checkout should be updated.

## Move a session between machines

`/handoff` writes the session's handoff document to Proton Drive under
`My Files/Documents/Handoffs`, records it as this repository's active entry in `handoff_map.json`,
and closes out with `/end-session`. On the other machine, `/lets-go` reads the active document,
sets the entry back to `null`, and resumes. Both use
[`scripts/handoff-map.mjs`](../../scripts/handoff-map.mjs), which finds the folder under
`~/Proton Drive`; set `HANDOFFS_DIR` when the drive is mounted elsewhere. On a machine with no Proton
Drive desktop client (Fedora), `HANDOFFS_DIR` is a local mirror that both skills pull from and push to
the cloud folder `/my-files/Documents/Handoffs` through the `proton-drive` CLI; export it in a shell
profile and keep the CLI logged in with `proton-drive auth login`.

## Restore the working environment

Install the exact public dependencies:

```powershell
npm ci
```

Read the private storage contract:

```powershell
Get-Content -Raw private\README.md
```

Live work state is never in a file. Read it from GitHub:

```powershell
gh project item-list 8 --owner jwh3times
gh issue list -R jwh3times/holland-vip --state open
gh issue list -R jwh3times/holland-vip-workspace --state open
```

If the private repository contains a sanitized machine-settings example and those permissions are
still desired, copy it to the ignored local path:

```powershell
Copy-Item private\examples\claude-settings.local.example.json .claude\settings.local.json
```

Machine-specific settings are optional and are never required for the public build.

## Load credentials for one process

The private companion carries one reference-only template per task, so a command receives the
credentials it uses and no others:

```powershell
op run --env-file private/config/github-snapshots.env.tpl -- npm run refresh:github-snapshots
op run --env-file private/config/cloudflare-verify.env.tpl -- node scripts/verify-cloudflare-deployment.mjs
```

A process boundary limits how long an injected value persists; it does not stop that process, or
anything it spawns, from reading every value handed to it. That is why there is no combined
template to reach for. `private/README.md` lists the templates and which credentials each resolves;
add a new one when a new task needs a different set rather than widening an existing one.

`SYNC_PAT` and the Cloudflare deploy-hook URL are not in any template — both are read only by
GitHub Actions, so they go straight into the secret store (`op read ... | gh secret set ...`)
without passing through a local shell.

The refresh fetches and validates both public fallback snapshots before replacing either one.
Review and verify the generated pair together:

```powershell
git diff -- lib/github-fallback.json lib/github-contributions-fallback.json
npm run test:unit -- --run tests/unit/github-fallback.test.ts
```

Commit both JSON files in the same public change after confirming that the featured repositories,
descriptions, totals, dates, and contribution levels are plausible. Do not copy the token or any
resolved private environment value into the commit.

When a destination CLI accepts standard input, stream the field directly:

```powershell
op read "op://<vault>/holland-vip-workspace/SYNC_PAT" |
  gh secret set SYNC_PAT -R jwh3times/holland-vip
```

Do not echo secrets, put them in command arguments, dump the child environment, enable debug tracing,
or write a resolved `.env` file.

## Validate the public repository

Run the fast gates:

```powershell
npm run lint
npm run format:check
node scripts/sync-agents.mjs --check
npm run test:unit:coverage
npm run build
```

The public build must also pass when `private/` is absent. CI and public contributors never depend on
the companion repository.

## End a portable session

Public and private work have separate histories and publish operations. Before changing computers,
check both:

```powershell
git status -sb
git -C private status -sb
```

Public `/ship` does not commit or push the private repository. Commit and push intended private
changes separately with explicit authorization, then confirm both branches match their upstreams.
