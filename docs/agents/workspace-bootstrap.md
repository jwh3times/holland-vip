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
that is not a repository). `--url <locator>` bypasses 1Password, `--op-reference` points at a
different field, and `--service-account-reference` (or the
`HOLLAND_VIP_OP_SERVICE_ACCOUNT_REFERENCE` environment variable) names a field holding a 1Password
service-account token to retry with when the interactive identity cannot read the item. Only the
locator is ever read; the token never leaves the child process.

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

## Restore the working environment

Install the exact public dependencies:

```powershell
npm ci
```

Read the private storage contract and current handoff:

```powershell
Get-Content -Raw private\README.md
Get-Content -Raw private\CURRENT.md
```

If the private repository contains a sanitized machine-settings example and those permissions are
still desired, copy it to the ignored local path:

```powershell
Copy-Item private\examples\claude-settings.local.example.json .claude\settings.local.json
```

Machine-specific settings are optional and are never required for the public build.

## Load credentials for one process

The private template contains only 1Password secret references:

```powershell
op run --env-file private/config/holland-vip.env.tpl -- <command>
```

For example:

```powershell
op run --env-file private/config/holland-vip.env.tpl -- node scripts/seed-contributions.mjs
```

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
