---
name: end-session
description: End the work session cleanly — record what was learned, update private/ docs and GitHub issues, then clean up the local workspace.
disable-model-invocation: true
---

# End Session

> clean up the local workspace, update any private/ docs and/or github issues that need it from this session.

Land the day's session so nothing learned in it lives only in a context window that is about to disappear.

**Announce at start:** "I'm using the end-session skill to close out this session."

## Why this exists

A session produces four kinds of residue, each with a different home. Everything that mattered today
belongs in exactly one of them:

| Residue                                                       | Home                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| Durable facts about the user, this repo, or how to work in it | Project memory (`MEMORY.md` + one file per fact)                   |
| Open work, findings, plan status                              | `private/todo.md` · `private/repo-analysis.md` (local, gitignored) |
| Anything a collaborator or a future agent must see            | GitHub Issues (`gh`)                                               |
| Scratch files, half-finished edits, stray branches            | The local workspace                                                |

Anything that does not fit a row is context worth dropping — say so and drop it.

## Steps

### 1. Take stock of the session

Reconstruct what actually happened before writing anything:

```bash
git status --porcelain
git log --oneline -15
git branch --show-current
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title) [\(.headRefName)]"'
```

Then walk the conversation itself for the things git cannot show: decisions taken, dead ends ruled
out, corrections the user gave you, gotchas discovered, work deliberately left unfinished.

Produce one list of session items and tag each with its destination — **memory**, **private docs**,
**issue**, **workspace**, or **drop**. Show the list to the user before acting on it. The step is
complete when every item carries a destination; steps 2–5 then execute that list, and an item with
no destination means the stock-take is not finished.

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
`docs/agents/*`, `CHANGELOG.md`, and `private/repo-analysis.md` cover structure, conventions, and
history. Memory earns its place with what those cannot hold — how the user wants to work, and
context that would otherwise be re-derived next session. Prefer updating an existing memory file
over adding a near-duplicate, and delete any that this session proved wrong.

### 3. Update the `private/` docs

`private/` is gitignored — it never appears in a commit, a PR, or a push, so it is where candid,
still-open, or personal notes go. Two files, with distinct jobs:

- **`private/todo.md`** — the live tracker of what is still open, plus the tiered build-out plan.
  Statuses use the legend `⬜ open · 🔄 in progress · ✅ done`. Move items the session advanced,
  add ones it discovered, and refresh the `> Last updated:` blockquote at the top with today's date
  and a one-sentence statement of where things now stand. That blockquote is what the next session
  reads first — keep it true.
- **`private/repo-analysis.md`** — the standing analysis. Session work that resolves one of its
  findings gets recorded twice: flip the finding's inline marker (`⬜ OPEN` → `✅ RESOLVED`) and add
  it to the §0 Remediation Status roll-up. Resolved items live here rather than in `todo.md`.

Durable domain vocabulary and hard-to-reverse decisions are not `private/` material — terms belong
in `CONTEXT.md` and decisions in `docs/adr/`, both maintained through `/domain-modeling`. Note the
candidate here and say so in the report rather than writing the ADR inside this skill.

### 4. Update GitHub issues

Issues for `jwh3times/holland-vip` are worked with the `gh` CLI; the operations are in
[`docs/agents/issue-tracker.md`](../../../docs/agents/issue-tracker.md) and the label vocabulary in
[`docs/agents/triage-labels.md`](../../../docs/agents/triage-labels.md) (`needs-triage`,
`needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Start from what is actually open:

```bash
gh issue list --state open --json number,title,labels --jq '.[] | "#\(.number) \(.title) \(.labels | map(.name))"'
```

For each session item tagged **issue**:

- **Progress on an existing issue** → `gh issue comment <n>` with what changed and what remains.
- **A discovery worth tracking publicly** → `gh issue create`, labelled for its triage role.
  Findings that are only meaningful to Jerry stay in `private/todo.md` instead — the split is
  audience, not importance.
- **Work that landed** → close it with a comment naming the PR (`gh issue close <n> --comment …`).
  A merged PR with a closing keyword already did this; verify rather than reclosing.
- **Stale labels** → `gh issue edit <n> --add-label/--remove-label` so the board matches reality.

Issue numbers and PR numbers share one space, so resolve a bare `#42` with `gh pr view 42` before
falling back to `gh issue view 42`.

Every write here is outward-facing. List the exact comments, closures, and new issues you intend to
make and get the user's go-ahead before running them.

### 5. Clean up the local workspace

Dry-run first, always:

```bash
git clean -nd
```

Then work through what it and `git status --porcelain` report:

- **Scratch files this session created** — remove them. Anything under the session scratchpad
  directory can go without asking; anything inside the repo gets listed for confirmation first.
- **Uncommitted work** — show it and ask what should happen to it. Commit only on the user's word.
- **Generated output** — `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`,
  `tsconfig.tsbuildinfo` are gitignored build artifacts. Leaving them is fine and saves a rebuild;
  remove them only when the user asks for a cold tree.
- **Branch state** — report the current branch, whether it is pushed, and any open PR. Shipping is
  `/ship`'s job; name what is unshipped and stop there.

Use `git clean` only in the `-nd` dry-run form for inspection, and delete confirmed paths with an
explicit `rm`. `git clean -fdx` in this repo destroys `node_modules/` **and the entire gitignored
`private/` directory** — the very docs step 3 just updated.

### 6. Report

Close with a short summary: memories written or updated, `private/` edits, issues touched (with
numbers), what was deleted, branch/PR state, and anything deliberately dropped. Finish with the one
thing the next session should pick up first.

When the next session needs the _reasoning_ of this one rather than its outcomes, say so and point
at `/handoff` — it writes the portable conversation summary this skill deliberately does not.

## Do not

- Ship. `/end-session` records and tidies; `/ship` is what pushes and opens PRs.
- Write to `private/` or GitHub as a substitute for each other — audience decides, per step 4.
- Delete a path outside the scratchpad before the user has seen it listed.
