---
# GENERATED — do not edit. Source: .agents/skills/handoff/SKILL.md — regenerate with 'node scripts/sync-agents.mjs'.
name: handoff
description: Hand the session to another machine — write the handoff document to Proton Drive, register it in the handoff map, then close out with end-session.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document so a fresh agent — usually on Jerry's other computer — can continue the work
with `/lets-go`. The document travels through Proton Drive, and `handoff_map.json` beside it records
the one active handoff per repository. `scripts/handoff-map.mjs` locates that folder on Windows and
Linux and owns every map read and write.

If the user passed arguments, treat them as a description of what the next session will focus on
and tailor the document accordingly.

## Transport

Decide once, at the start, how the Handoffs folder reaches the cloud on this machine:

- **Desktop client** — `~/Proton Drive` exists and the Proton Drive client keeps it in sync. Every
  step marked _(CLI mirror only)_ is skipped.
- **CLI mirror** — `command -v proton-drive` succeeds and `~/Proton Drive` is absent (Fedora: Proton
  ships no Linux sync client). `HANDOFFS_DIR` names a local mirror of the cloud folder
  `/my-files/Documents/Handoffs`; nothing syncs it, so the skill pulls the map before reading it and
  pushes the map and document after writing them. If only the older `HANDOFF_DIR` is set, export
  `HANDOFFS_DIR` from it. If both are unset, ask the user for the mirror folder (for example
  `~/Documents/Handoffs`), `mkdir -p` it, and export `HANDOFFS_DIR` for this session; suggest they
  add it to their shell profile.

Every `proton-drive` command must name a conflict strategy — the CLI prompts otherwise, and a prompt
hangs an agent. Output containing `You need to login first` means the CLI session lapsed: ask the
user to run `proton-drive auth login` themselves, then retry the command.

## 1. Audit unmerged work

Only what reaches `origin/main` — or at least `origin` — is visible on the other machine. Check both
repositories (skip the `private` lines when `private/.git` is absent):

```bash
git fetch --prune origin
git status --porcelain
git branch -vv --no-merged origin/main
git log --oneline origin/main..HEAD
git stash list
gh pr list -R jwh3times/holland-vip --author @me --state open --json number,title,headRefName,url
git -C private fetch --prune origin
git -C private status --porcelain
git -C private branch -vv --no-merged origin/main
git -C private log --oneline origin/main..HEAD
git -C private stash list
gh pr list -R jwh3times/holland-vip-workspace --author @me --state open --json number,title,headRefName,url
```

When any of these reports something, **alert** the user right away, before writing anything, under
a `⚠ Unmerged work` heading: one line per item naming the repository, branch, and state —
_uncommitted_, _stashed_, _unpushed_ (these three never reach the other machine), or _pushed but
unmerged_ / _open PR_. Then continue; shipping and pushing stay with the user and `/ship`. The step
is complete when every command's output is either empty or named in the alert, and the same list
goes into the document and the final report.

## 2. File human follow-ups

A handoff document is not a tracker. Any required human action the session leaves behind must
already be a private `ready-for-human` Issue with a wiki runbook (see "Human follow-up actions" in
`docs/agents/issue-tracker.md`); file any that are missing before writing the handoff, then
reference the Issue by URL.

## 3. Write the document

**Pull** _(CLI mirror only)_ — refresh the local map from the cloud before reading it:

```bash
proton-drive filesystem download -f remove /my-files/Documents/Handoffs/handoff_map.json "$HANDOFFS_DIR"
```

Complete when the transfer summary lists the map as downloaded and `$HANDOFFS_DIR/handoff_map.json`
exists. Then:

```bash
node scripts/handoff-map.mjs get
```

The JSON names the Handoffs `dir`, this repository's map `key`, and the currently `active` document.
If `active` is not `null`, an earlier handoff was never picked up: tell the user, read it, and carry
forward whatever is still true. When `exists` is `false` on the CLI mirror, download that one
document first with the same `filesystem download -f remove` command, naming
`/my-files/Documents/Handoffs/<active>`. Leave the old file in place.

Write the new document straight into `dir` as `<key>-handoff-<YYYY-MM-DD>.md`, appending
`-<focus-slug>` when that name is taken. It contains:

- **Where things stand** — repository, branch, HEAD SHA, and what is pushed.
- **Unmerged work** — the step 1 list, or "None: everything is on `origin/main`."
- **Reasoning** — decisions taken, dead ends ruled out, corrections from the user; the context git
  and GitHub cannot show.
- **Next step** — the first concrete action for the next session.
- **Suggested skills** — the skills the next agent should invoke.

Reference existing artifacts (specs, plans, ADRs, Issues, commits, diffs) by path or URL instead of
duplicating them. Redact sensitive information such as API keys, passwords, or personally
identifiable information; 1Password owns credentials.

## 4. Register it

```bash
node scripts/handoff-map.mjs set <file-name>
```

The step is complete when the output shows `active` equal to the new file name and `exists: true`.

**Push** _(CLI mirror only)_ — the document and the updated map go to the cloud, or the other
machine never sees them:

```bash
proton-drive filesystem upload -f create-new-revision -t "$HANDOFFS_DIR/<file-name>" "$HANDOFFS_DIR/handoff_map.json" /my-files/Documents/Handoffs
```

Complete when the transfer summary lists both files as uploaded.

## 5. Close out

Invoke the `end-session` skill, telling it the session is ending through `/handoff` and giving it
the handoff document's path. Its confirmation gates still apply.

## 6. Report

Finish with the handoff document's path, the map key and any `previous` value it replaced, and the
end-session summary. Close with the `⚠ Unmerged work` alert again — or state plainly that everything
is merged to `main` — and remind the user to run `/lets-go` on the other machine once Proton Drive
has synced.
