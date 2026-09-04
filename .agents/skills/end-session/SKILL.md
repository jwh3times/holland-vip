---
name: end-session
description: End the work session cleanly — record durable outcomes, reconcile both repositories and their Issues, then clean up the workspace.
disable-model-invocation: true
---

# End Session

> reconcile the session's durable outcomes, trackers, repository state, and local cleanup.

Land the day's session so nothing learned in it lives only in a context window that is about to disappear.

**Announce at start:** "I'm using the end-session skill to close out this session."

## Why this exists

A session produces four kinds of residue, each with a different home. Everything that mattered today
belongs in exactly one of them:

| Residue                                                           | Home                                             |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| Public architecture, conventions, or collaborator guidance        | Public repository                                |
| Durable private prose, decisions, research, runbooks, handoffs    | Independent nested repository under `private/`   |
| Public work                                                       | `jwh3times/holland-vip` Issues                   |
| Confidential work, decisions, or infrastructure checks            | `jwh3times/holland-vip-workspace` Issues         |
| Genuine undisclosed vulnerability                                 | Public repository draft security advisory        |
| Credentials, recovery codes, and canonical private locator        | 1Password                                        |
| User preferences or harness hints that aid the next local session | Project memory (`MEMORY.md` + one file per fact) |
| Scratch files, half-finished edits, stray branches                | The local workspace                              |

Anything that does not fit a row is context worth dropping — say so and drop it.

## Steps

### 1. Take stock of the session

Reconstruct what actually happened before writing anything:

```bash
git status --porcelain
git status -sb
git log --oneline -15
git branch --show-current
git -C private status --porcelain
git -C private status -sb
git -C private log --oneline -5
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title) [\(.headRefName)]"'
```

If `private/.git` is absent, report that the companion repository is not cloned and point to
[`docs/agents/workspace-bootstrap.md`](../../../docs/agents/workspace-bootstrap.md). Do not create
or infer a private remote during close-out.

Then walk the conversation itself for the things git cannot show: decisions taken, dead ends ruled
out, corrections the user gave you, gotchas discovered, work deliberately left unfinished.

Produce one list of session items and tag each with its destination — **public repo**, **private
repo**, **public issue**, **private issue**, **advisory**, **1Password**, **memory**, **workspace**,
or **drop**. Show the list to the user before acting on it. The step is complete when every item
carries a destination; steps 2–5 then execute that list, and an item with no destination means the
stock-take is not finished.

### 2. Update project memory

Memory lives outside the repo, in the project memory directory the harness names in your system
prompt — `~/.claude/projects/<project-slug>/memory/`, where this repo's slug is
`C--Users-jerry-OneDrive-Documents-VSCodeProjects-holland-vip`. One fact per file, frontmatter with
`name` / `description` / `metadata.type` (`user`, `feedback`, `project`, `reference`), plus a
one-line pointer in `MEMORY.md`. Link related memories with `[[name]]`.

Write a memory when the session produced:

- **feedback** — a correction or a confirmed way of working the user gave you (record the _why_).
- **user** — how Jerry works, what he expects, what he does not want.
- **project** — in-flight work or a constraint the repo itself does not record; convert relative
  dates to absolute (today is knowable from `git log -1 --date=short --format=%ad`).
- **reference** — a dashboard, ticket, or URL you had to hunt for (Cloudflare Pages settings, the
  Actions secrets page, a GitHub advisory).

This repo already documents itself heavily: `CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`,
`docs/agents/*`, `CHANGELOG.md`, and the private companion repository cover structure, conventions,
history, and durable private context. Memory is a local working cache, not the portable source of
truth: anything needed on another computer must also reach the appropriate public/private
repository or Issue. Prefer updating an existing memory file over adding a near-duplicate, and
delete any that this session proved wrong.

### 3. Reconcile the private repository

`private/` is ignored by the public repository but is itself the independent
`jwh3times/holland-vip-workspace` repository. Route private output by job:

- Durable private decisions and research go under `decisions/` and `research/`.
- Dated recovery and verification evidence goes under `verification/`.
- Point-in-time records go under `archive/` and do not become current again.
- All live work state — objective, next action, active Issues, blockers, status — belongs to GitHub
  Issues and the [Holland.VIP board](https://github.com/users/jwh3times/projects/8). Never write it
  into a Markdown file in either repository, and never open a session by reading one.

Durable domain vocabulary and hard-to-reverse decisions are not `private/` material — terms belong
in `CONTEXT.md` and decisions in `docs/adr/`, both maintained through `/domain-modeling`. Note the
candidate here and say so in the report rather than writing the ADR inside this skill.

After private edits, review them and report their publish state:

```bash
git -C private diff --check
git -C private status -sb
```

Do not commit or push the private repository without explicit user authorization. A clean working
tree can still have unpushed commits, so compare the branch with its upstream and name any ahead
count.

### 4. Update GitHub issues

Issue routing and operations are in
[`docs/agents/issue-tracker.md`](../../../docs/agents/issue-tracker.md) and the label vocabulary in
[`docs/agents/triage-labels.md`](../../../docs/agents/triage-labels.md) (`needs-triage`,
`needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Use explicit repositories so private
text cannot land in the public tracker. Start from what is actually open:

```bash
gh issue list -R jwh3times/holland-vip --state open --json number,title,labels --jq '.[] | "#\(.number) \(.title) \(.labels | map(.name))"'
gh issue list -R jwh3times/holland-vip-workspace --state open --json number,title,labels --jq '.[] | "#\(.number) \(.title) \(.labels | map(.name))"'
```

For each session item tagged **issue**:

- **Progress on an existing issue** → `gh issue comment <n>` with what changed and what remains.
- **A public discovery** → create or update a public Issue.
- **A confidential task, decision, or infrastructure check** → create or update a private
  companion Issue. Durable reasoning belongs in private Markdown; the Issue owns work state.
- **A genuine undisclosed vulnerability** → use a draft security advisory, not either ordinary
  Issue tracker.
- **Work that landed** → close it with a comment naming the PR (`gh issue close <n> --comment …`).
  A merged PR with a closing keyword already did this; verify rather than reclosing.
- **Stale labels** → `gh issue edit <n> --add-label/--remove-label` so the board matches reality.

Issue numbers and PR numbers share one space. Resolve a bare `#42` inside its named repository with
`gh pr view -R <owner/repo> 42` before falling back to `gh issue view -R <owner/repo> 42`.

Every write here is outward-facing. List the exact comments, closures, and new issues you intend to
make and get the user's go-ahead before running them.

### 5. Clean up the local workspace

Dry-run first, always:

```bash
git clean -nd
git -C private clean -nd
```

Then work through what it and `git status --porcelain` report:

- **Scratch files this session created** — remove them. Anything under the session scratchpad
  directory can go without asking; anything inside the repo gets listed for confirmation first.
- **Uncommitted work in either repository** — show it and ask what should happen to it. Commit only
  on the user's word.
- **Generated output** — `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`,
  `tsconfig.tsbuildinfo` are gitignored build artifacts. Leaving them is fine and saves a rebuild;
  remove them only when the user asks for a cold tree.
- **Branch state** — report each repository's current branch and upstream relationship, plus any
  open public PR. Name uncommitted and unpushed private work explicitly. Public shipping is
  `/ship`'s job; private publishing is a separate user-authorized action.

Use `git clean` only in the `-nd` dry-run form for inspection, and delete confirmed paths with an
explicit `rm`. `git clean -fdx` in this repo destroys `node_modules/` **and the entire gitignored
`private/` directory** — the very docs step 3 just updated.

### 6. Report

Close with a short summary: memories written or updated, public/private repository edits, Issues
touched (with repository and number), what was deleted, both branch/upstream states, and anything
deliberately dropped. State explicitly whether private work is uncommitted or unpushed. Finish with
the one thing the next session should pick up first.

When the next session needs the _reasoning_ of this one rather than its outcomes, say so and point
at `/handoff` — it writes the portable conversation summary this skill deliberately does not.

## Do not

- Ship. `/end-session` records and tidies; `/ship` is what pushes and opens PRs.
- Push the private repository. Report its publish state and wait for explicit authorization.
- Record work state in any Markdown file. Open or update the Issue and its board item instead.
- Put a credential value in a repository, Issue, command argument, or report; 1Password owns it.
- Delete a path outside the scratchpad before the user has seen it listed.
