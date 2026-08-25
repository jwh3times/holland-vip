# Private Workspace Portability — Implementation Plan

**Goal:** Make every durable piece of `holland-vip` work recoverable from another computer while preserving the public/private boundary of the public repository.

**Architecture:** The public `jwh3times/holland-vip` repository remains the source of truth for code and public documentation. A private `jwh3times/holland-vip-workspace` repository is cloned into the public repository's ignored `private/` directory as an independent nested repository. Durable private prose lives in that repository; private work state lives in its Issues; a private GitHub Project may aggregate public and private Issues as a view. Genuine undisclosed vulnerabilities use the public repository's security-advisory workflow. 1Password is the canonical credential manager and is accessible through the `op` CLI; provider secret stores contain deployed copies, never the only recoverable copy.

**Primary outputs:**

- Private GitHub repository `jwh3times/holland-vip-workspace`
- Private workspace files `README.md`, `CURRENT.md`, `archive/**`, `config/holland-vip.env.tpl`
- Private Issues for confidential and operational work
- Optional private GitHub Project
- Public bootstrap and issue-routing documentation
- Portable root ignore for `.superpowers/`
- Updated `/end-session` routing for the nested private repository

## Global constraints

- **Verify privacy before upload:** create the companion repository empty, verify `visibility` is `PRIVATE`, then push private files.
- **Independent nested repository:** `private/.git/` belongs to the companion repository. Do not add a public `.gitmodules` file and do not stage `private/` in the public repository with `git add -f`.
- **1Password is canonical:** store recoverable credentials, recovery codes, and the private-repository locator in 1Password. GitHub and Cloudflare secret stores receive deployed copies where required.
- **Host credential access:** run authenticated `op`, authenticated `gh`, and authenticated remote Git operations outside the native Windows sandbox so they can use the host's 1Password and Windows credential-manager sessions.
- **Process-scoped secrets:** prefer `op run` with 1Password secret references. When a destination CLI requires standard input, pipe `op read` directly into it. Do not print a secret, place it in a command-line argument, assign it to a persistent shell variable, or write a plaintext `.env` file.
- **Secret references are not secret values:** a template containing `op://...` references may live in the private companion repository. Keep vault/item topology out of the public repository.
- **No credentials in documentation:** record secret names, owning system, purpose, rotation date, and verification status; never record values.
- **Issues are work state:** public work stays in public Issues; private work goes to companion-repository Issues. `CURRENT.md` links to Issues and stays short.
- **Advisories are vulnerability-only:** use a repository security advisory only for a real vulnerability needing private remediation and coordinated disclosure.
- **OneDrive is secondary recovery:** it may hold an occasional backup/export of the private repository, but it is not the live source of truth.
- **Two repositories, two publish operations:** public `/ship` does not publish private-repository commits. A session is portable only after both repositories' intended changes are committed and pushed.
- **Preserve before pruning:** retain the original `private/` files and `.superpowers/sdd/` until the private remote and the fresh-machine recovery drill are verified.

---

### Task 1: Record the storage and credential contract

**Files:**

- Create in private repository: `README.md`
- Create in private repository: `config/holland-vip.env.tpl`
- Create or update in 1Password: `holland-vip-workspace` item
- Create or update in 1Password: GitHub recovery-code item

- [ ] **Step 1: Confirm the companion-repository name and disclosure rule**

Use `jwh3times/holland-vip-workspace` unless the owner chooses another name. Record whether that name may appear in public bootstrap documentation. If its name is private, store its HTTPS URL in the 1Password `holland-vip-workspace` item and make the public bootstrap accept a placeholder instead.

Completion criterion: the repository name and whether it may be public are recorded before any documentation references it.

- [ ] **Step 2: Verify 1Password CLI access without reading secrets**

Run in the user's terminal:

```powershell
op --version
op account list
op vault list
```

Use the 1Password desktop-app integration or `op signin` as appropriate for the installed CLI. Do not run a command that reveals an item value during this check.

Completion criterion: `op vault list` succeeds in an authenticated session, and no secret value appears in terminal output or logs.

- [ ] **Step 3: Create the 1Password workspace item**

Create an item named `holland-vip-workspace` in the user's chosen private vault with these fields where applicable:

| Field                        | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `private_repo_url`           | Locator for the private companion repository                         |
| `GITHUB_TOKEN`               | Build-time GitHub API access used by contribution/repository fetches |
| `SYNC_PAT`                   | GitHub Actions credential used by agent-artifact synchronization     |
| `CLOUDFLARE_DEPLOY_HOOK_URL` | Cloudflare Pages deploy-hook credential                              |
| `cloudflare_project`         | Non-secret project locator                                           |
| `last_verified`              | Date the external destinations were checked                          |

Keep GitHub recovery codes in a separate 1Password Secure Note or supported recovery-code item so loss of the GitHub login does not also remove access to the private repository.

Completion criterion: each credential has one canonical 1Password field or an explicit `not used` status; no value is copied into a repository file.

- [ ] **Step 4: Define private secret references**

Create `config/holland-vip.env.tpl` in the private repository using references, substituting the actual vault name while keeping the item name stable:

```dotenv
GITHUB_TOKEN=op://<vault>/holland-vip-workspace/GITHUB_TOKEN
SYNC_PAT=op://<vault>/holland-vip-workspace/SYNC_PAT
CLOUDFLARE_DEPLOY_HOOK_URL=op://<vault>/holland-vip-workspace/CLOUDFLARE_DEPLOY_HOOK_URL
```

Document this invocation pattern in the private `README.md`:

```powershell
op run --env-file private/config/holland-vip.env.tpl -- <command>
```

For example, local contribution seeding becomes:

```powershell
op run --env-file private/config/holland-vip.env.tpl -- node scripts/seed-contributions.mjs
```

Completion criterion: the template contains only `op://` references, `op run` resolves them for a harmless test command, and no resolved value is written to disk.

- [ ] **Step 5: Write the private storage policy**

The private `README.md` must route information as follows:

| Information                                          | Destination                               |
| ---------------------------------------------------- | ----------------------------------------- |
| Public code, architecture, and contributor guidance  | Public repository                         |
| Durable private prose and session handoffs           | Private companion repository              |
| Public task or defect                                | Public Issue                              |
| Confidential task, decision, or infrastructure check | Private companion Issue                   |
| Genuine undisclosed vulnerability                    | Public repository draft security advisory |
| Credential or recovery code                          | 1Password                                 |
| Deployed credential copy                             | GitHub or Cloudflare secret store         |

State that provider configuration records include status and dates, not values.

Completion criterion: every current local-only document and credential class has exactly one destination.

---

### Task 2: Create and verify the private companion repository

**External state:**

- Create: GitHub repository `jwh3times/holland-vip-workspace`
- Verify: private visibility and authenticated access

- [ ] **Step 1: Create the empty remote**

Run authenticated `gh` outside the Windows sandbox so it can use the host credential manager:

```powershell
gh repo create jwh3times/holland-vip-workspace --private
```

Do not initialize it with a README, license, or `.gitignore`; the existing `private/` directory will become the initial clone source.

Completion criterion: the repository exists and contains no uploaded private files yet.

- [ ] **Step 2: Verify visibility before the first push**

```powershell
gh repo view jwh3times/holland-vip-workspace --json nameWithOwner,visibility,url
```

Require `visibility` to equal `PRIVATE`. Stop before initialization or push if it does not.

Completion criterion: the exact target repository and `PRIVATE` visibility are independently verified.

- [ ] **Step 3: Store the locator in 1Password**

Save the verified HTTPS URL in the `private_repo_url` field of the 1Password `holland-vip-workspace` item. Retrieve it later with a secret reference rather than relying on memory when the name is intentionally omitted from public docs.

Completion criterion: a new computer with 1Password access can discover the private remote without this working tree.

- [ ] **Step 4: Initialize `private/` as an independent repository**

From the public repository root:

```powershell
git -C private init -b main
git -C private remote add origin https://github.com/jwh3times/holland-vip-workspace.git
git -C private remote -v
```

The public root `.gitignore` already ignores `private/`, so the nested `.git/` must remain invisible to the public index.

Completion criterion: `git -C private status` reports the private repository, while root `git status` does not list any `private/` content.

---

### Task 3: Migrate and publish private documentation

**Files in private repository:**

- Create: `.gitignore`
- Create: `CURRENT.md`
- Create: `README.md`
- Create: `archive/repo-analysis-2026-06-16.md`
- Create: `archive/todo-legacy-2026-08-20.md`
- Create directories: `decisions/`, `research/`, `runbooks/`, `config/`

- [ ] **Step 1: Create the private structure**

Use this layout:

```text
private/
├── .gitignore
├── README.md
├── CURRENT.md
├── archive/
├── config/
│   └── holland-vip.env.tpl
├── decisions/
├── research/
└── runbooks/
```

The private `.gitignore` must cover plaintext credential artifacts:

```gitignore
.env
.env.*
!.env.example
!.env.tpl
*.pem
*.key
credentials/
secrets/
```

Completion criterion: the private repository accepts reference templates but ignores likely plaintext credential files.

- [ ] **Step 2: Archive the existing documents**

Move:

- `repo-analysis.md` → `archive/repo-analysis-2026-06-16.md`
- `todo.md` → `archive/todo-legacy-2026-08-20.md`

Add a short archival banner to each file stating that it is a point-in-time record and not current operating state. Preserve the original body.

Completion criterion: both original documents are preserved with dates and cannot be mistaken for the live tracker.

- [ ] **Step 3: Create `CURRENT.md`**

Limit it to:

- Last-updated date
- Current objective
- Next concrete action
- Active public/private Issue links
- Blocking external decision, if any
- Last verified public and private commits

Do not reproduce Issue bodies or maintain a second backlog.

Completion criterion: a fresh reader can identify the next action in under one minute, and every detailed action points to an Issue.

- [ ] **Step 4: Commit and push the private repository**

```powershell
git -C private add .
git -C private diff --cached
git -C private commit -m "docs: initialize portable holland-vip workspace"
git -C private push -u origin main
```

Review the staged diff for credential values before committing. Secret names and `op://` references are expected; resolved values are not.

Completion criterion: the private remote contains the expected structure, `git -C private status` is clean, and `git -C private status -sb` shows no unpushed commit.

---

### Task 4: Move live work state to GitHub Issues

**External state:**

- Create: private companion-repository Issues
- Preserve: public issue `jwh3times/holland-vip#109`

- [ ] **Step 1: Audit the archived todo against current external state**

Check, without revealing values:

- Whether `GITHUB_TOKEN` is configured for the Cloudflare Pages production build
- Whether GitHub repository secret `SYNC_PAT` exists
- Whether GitHub repository secret `CLOUDFLARE_DEPLOY_HOOK_URL` exists
- Whether the deploy-hook workflow succeeds
- Whether the deferred notes/blog decision remains deferred

Use provider secret listings or dashboards for presence checks. Use 1Password CLI only to confirm that the canonical item/field exists. Never compare by printing both values.

Completion criterion: each external-state question has a dated `configured`, `missing`, `obsolete`, or `needs human verification` result.

- [ ] **Step 2: Create private Issues for unresolved work**

Create one Issue per unresolved action. Recommended initial labels:

- `area:infrastructure`
- `area:content`
- `type:task`
- `type:decision`
- `priority:high`
- `priority:someday`

Keep credentials out of Issue bodies. Refer to a 1Password item and field by name only when needed.

Completion criterion: every unresolved private action has one Issue with an owner, status, and done condition.

- [ ] **Step 3: Reconcile public work**

Leave public issue `#109` in the public repository and identify any other non-confidential work that belongs there. Do not duplicate public Issues privately; link them from `CURRENT.md` or the optional Project.

Completion criterion: no live task exists only in the archived todo, and no task has competing public/private source-of-truth Issues.

- [ ] **Step 4: Update and push `CURRENT.md`**

Link the highest-priority Issues and record the next action. Commit and push the private repository again.

Completion criterion: the remote `CURRENT.md` matches the Issue tracker and the private repository is clean.

---

### Task 5: Create the optional private GitHub Project

**External state:**

- Optional create: user-owned private GitHub Project

- [ ] **Step 1: Establish Project access**

The current `gh` authorization lacks `read:project`. Use the GitHub UI by default. If CLI automation is chosen, obtain explicit approval before running `gh auth refresh` for Project scopes; do not retrieve or store the resulting GitHub authentication token manually.

Completion criterion: Project management is available without exposing a token or replacing the host credential-manager login.

- [ ] **Step 2: Create and verify the Project**

Create a user-owned Project and set visibility to private before adding confidential text. Verify that only explicitly permitted users can view it.

Completion criterion: visibility is private before the first private Issue or draft is added.

- [ ] **Step 3: Add the working fields**

Create:

- Status: Backlog, Ready, In progress, Blocked, Done
- Priority: High, Medium, Low, Someday
- Area: Code, Content, Infrastructure, Security, Documentation
- Repository: Public, Private

Completion criterion: every added Issue can be categorized without putting confidential prose in a custom field.

- [ ] **Step 4: Populate the Project**

Add private companion Issues and selected public Issues such as `#109`. Treat Project-only drafts as temporary intake and convert confidential drafts only into companion-repository Issues.

Completion criterion: the Project is a navigational view over Issues, not the only copy of any durable decision or task.

---

### Task 6: Document and enforce the public/private workflow

**Files in public repository:**

- Modify: `.gitignore`
- Create: `docs/agents/workspace-bootstrap.md`
- Modify: `docs/agents/issue-tracker.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify authored skill: `.agents/skills/end-session/SKILL.md`
- Regenerate: `.claude/skills/end-session/**`
- Include: `docs/research/2026-08-25-private-workspace-portability.md`
- Include: this implementation plan

- [ ] **Step 1: Make scratch ignoring portable**

Add to the root `.gitignore`:

```gitignore
# Agent scratch output
/.superpowers/
```

Keep the existing `private/` and `/.claude/settings.local.json` rules.

Completion criterion: a fresh clone ignores `.superpowers/` without relying on an untracked nested `.gitignore`.

- [ ] **Step 2: Write the fresh-machine bootstrap**

Create `docs/agents/workspace-bootstrap.md` with this sequence:

1. Install Git, Node from `.nvmrc`, GitHub CLI, 1Password desktop, and 1Password CLI.
2. Authenticate to 1Password and verify `op vault list`.
3. Authenticate `gh` using its supported browser/credential-manager flow.
4. Clone the public repository.
5. Discover the private remote from the public-safe name or `op read "op://<vault>/holland-vip-workspace/private_repo_url"`.
6. Clone the private repository into `private/` without printing a credential.
7. Run `npm ci`.
8. Read `private/README.md` and `private/CURRENT.md`.
9. Recreate machine-local `.claude/settings.local.json` from a sanitized private example if desired.
10. Run the fast validation gates.

The bootstrap must explain that `op read` of the repository locator is safe to use for cloning only if the locator itself is intentionally private; credential values still must flow through `op run` or direct stdin.

Completion criterion: the bootstrap contains every prerequisite and command needed before reading any old-machine-only file.

- [ ] **Step 3: Add the issue-routing contract**

Update `docs/agents/issue-tracker.md` with the routing table from Task 1 and the explicit `-R jwh3times/holland-vip-workspace` form for private `gh issue` commands. State that authenticated `gh` operations run outside the Windows sandbox and that `gh auth token` is never printed or copied into 1Password manually.

Completion criterion: an agent can choose the correct tracker without inspecting the content of a private document first.

- [ ] **Step 4: Update agent and human guidance**

Update `AGENTS.md`, `CLAUDE.md`, and `README.md` only where the new two-repository workflow affects architecture, setup, issue routing, session close-out, or recovery. Use one detailed source (`docs/agents/workspace-bootstrap.md`) and concise pointers elsewhere.

Completion criterion: the three top-level documents agree and do not duplicate the full bootstrap procedure.

- [ ] **Step 5: Update `/end-session` on its authored side**

Edit `.agents/skills/end-session/SKILL.md` so it:

- Routes private durable output to the nested companion repository
- Updates `private/CURRENT.md` only when the live handoff changes
- Checks root `git status` and `git -C private status`
- Reports uncommitted or unpushed private work explicitly
- Preserves its existing no-push contract; pushing the private repository remains an explicit user-authorized action

Use the `writing-for-agents` skill during implementation. Do not hand-edit the generated `.claude/skills/end-session/` mirror.

Completion criterion: invoking `/end-session` cannot silently leave private state stranded on one computer.

- [ ] **Step 6: Format and regenerate agent artifacts**

Run in this order:

```powershell
npm run format
npm run sync:agents
node scripts/sync-agents.mjs --check
```

Completion criterion: formatting is stable and generated artifacts match their authored sources.

---

### Task 7: Remove obsolete local artifacts

**Files:**

- Remove local scratch: `.superpowers/sdd/**`
- Retain ignored reproducible outputs only as locally useful

- [ ] **Step 1: Gate cleanup on remote verification**

Verify:

```powershell
git -C private status -sb
git -C private log -1 --oneline
gh repo view jwh3times/holland-vip-workspace --json visibility,url
```

Confirm the two archived documents and `CURRENT.md` are visible remotely while authenticated.

Completion criterion: the private remote is private, current, and recoverable before any original is removed.

- [ ] **Step 2: Remove `.superpowers/sdd/`**

Delete the completed scratch tree. Its durable plan/design already live under tracked `docs/superpowers/`, and the implementation commits are on `origin/main`.

Completion criterion: `.superpowers/sdd/` is gone and root Git status remains unaffected because `/.superpowers/` is tracked in `.gitignore`.

- [ ] **Step 3: Leave build products reproducible**

Keep these ignored and out of both repositories:

- `.next/`
- `coverage/`
- `node_modules/`
- `out/`
- `playwright-report/`
- `test-results/`
- `next-env.d.ts`
- `tsconfig.tsbuildinfo`

They may be deleted for space and recreated with `npm ci`, tests, and `npm run build`.

Completion criterion: no generated dependency, build, or test output is introduced into either repository.

---

### Task 8: Run the fresh-machine recovery drill

**Environment:**

- A separate computer or a temporary directory outside the current public and private repositories

- [ ] **Step 1: Bootstrap from independent systems only**

Starting with no local project files:

1. Unlock/sign in to 1Password and verify `op vault list`.
2. Authenticate GitHub CLI without exporting its token.
3. Clone `jwh3times/holland-vip`.
4. Resolve the private repository locator through the documented public name or 1Password CLI.
5. Clone the private repository into `holland-vip/private/`.
6. Read `private/CURRENT.md` and fetch its linked Issues.

Completion criterion: the operator can identify and begin the next task without accessing the original computer or OneDrive working tree.

- [ ] **Step 2: Verify process-scoped 1Password injection**

Run a harmless command through the private secret-reference template that checks only for presence, not value. Do not use `Write-Output`, `echo`, environment dumps, or debug tracing.

Completion criterion: the child process observes the required variable while the parent shell and filesystem retain no plaintext copy.

- [ ] **Step 3: Install and validate the public repository**

```powershell
npm ci
npm run lint
npm run format:check
node scripts/sync-agents.mjs --check
npm run test:unit:coverage
npm run build
```

Completion criterion: every command succeeds on the fresh machine.

- [ ] **Step 4: Verify public independence**

In a second temporary clone, omit the private repository and run `npm ci` plus `npm run build`.

Completion criterion: public contributors and CI can build the site without access to the private companion.

- [ ] **Step 5: Record the recovery result**

Update private `CURRENT.md` or a dated private runbook entry with:

- Recovery-test date
- Public commit tested
- Private commit tested
- Operating system
- Result and any manual gaps

Commit and push that private update.

Completion criterion: the recovery drill itself is recorded remotely and both repositories are clean.

---

### Task 9: Verify and ship the public changes

- [ ] **Step 1: Run the public fast gates**

```powershell
npm run lint
npm run format:check
node scripts/sync-agents.mjs --check
npm run test:unit:coverage
npm run build
```

Completion criterion: all required local CI gates pass.

- [ ] **Step 2: Audit both repositories for disclosure and unpublished work**

Review:

```powershell
git status --short --untracked-files=all
git diff --check
git -C private status -sb
```

Search the public staged diff for the names of credential fields and confirm that any occurrence is documentation or an `op://` reference, never a resolved value. Keep vault names and item topology private unless explicitly approved.

Completion criterion: the public diff is safe to publish and the private repository has no unintended local-only commit.

- [ ] **Step 3: Ship through the repository workflow**

Use `/ship` for the public branch so docs, changelog, CI gates, push, and PR are handled consistently. Publish any intended private-repository commit separately with explicit user authorization.

Completion criterion: the public PR is open or updated, the private remote contains the intended state, and neither repository relies on the original computer.

## Acceptance criteria

- [ ] A clean computer can discover and clone both repositories using GitHub plus 1Password.
- [ ] `private/` is an independent ignored repository, not a submodule or public tracked path.
- [ ] All durable private Markdown is committed and pushed to the private repository.
- [ ] `CURRENT.md` identifies the next action and links to Issues without duplicating a backlog.
- [ ] Public and private work are routed to their respective Issues.
- [ ] Actual confidential vulnerabilities use security advisories rather than ordinary Issues or notes.
- [ ] 1Password is the canonical store for `GITHUB_TOKEN`, `SYNC_PAT`, `CLOUDFLARE_DEPLOY_HOOK_URL`, GitHub recovery codes, and the private locator where needed.
- [ ] Secret values reach commands through `op run` or direct stdin and never appear in repository files, command arguments, terminal output, or persistent shell variables.
- [ ] GitHub and Cloudflare contain only the deployed secret copies they require.
- [ ] The public site builds with no private repository present.
- [ ] `.superpowers/` is portably ignored and obsolete scratch has been removed after verification.
- [ ] Both repositories are clean and pushed at the end of the recovery drill.

## References

- [1Password CLI: load secrets into scripts](https://developer.1password.com/docs/cli/secrets-scripts)
- [1Password secret references](https://developer.1password.com/docs/cli/secret-references)
- [GitHub repository visibility](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories)
- [GitHub Project visibility](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-your-project/managing-visibility-of-your-projects)
- [GitHub repository security advisories](https://docs.github.com/en/code-security/concepts/vulnerability-reporting-and-management/repository-security-advisories)
- [Private-workspace research](../../research/2026-08-25-private-workspace-portability.md)
