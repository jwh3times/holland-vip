# Development flow

The Matt Pocock skill flow is the binding process for changing code in this repository.
[ask-matt](../../.agents/skills/ask-matt/SKILL.md) owns the flow map: the main flow, its on-ramps,
and phase boundaries. This document owns what the map leaves to the repository: recognizing a ready
Issue, routing when there is none, the exemptions, and linking work to its Issue. Label names follow
[Triage labels](triage-labels.md); Issue operations follow [Work tracking](issue-tracker.md).

## Ready Issues

The gate in `AGENTS.md` opens on one of these, read with `gh issue view <n> --comments`:

- **Agent-ready Issue** — labelled `ready-for-agent` and carrying one of:
  - a `/to-spec` spec: the body opens with `## Problem Statement`;
  - a `/to-tickets` ticket: the body holds `## What to build` and `## Acceptance criteria`;
  - a `/triage` agent brief: a comment posted when the Issue moved to `ready-for-agent`.
- **Bug Issue** — worked through `/diagnosing-bugs`. The Issue number is required, usually from the
  `bug` template; a spec is not.

Public code lands from a `jwh3times/holland-vip` Issue. When the work starts from a private
`jwh3times/holland-vip-workspace` Issue, file a public Issue for the public-facing change and gate
on that one.

## Routing without a ready Issue

Stop before the first edit, name the route with a one-line reason, and wait for the user to run it.

| Situation                         | Route                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| Idea one session can hold         | `/grill-with-docs`, then `/to-spec`; add `/to-tickets` when the build spans sessions |
| Huge, foggy, multi-session effort | `/wayfinder`, then `/to-spec` once the map clears                                    |
| Raw Issue someone else filed      | `/triage`                                                                            |
| Ready Issue nobody has started    | `/implement`, in a fresh context                                                     |
| Something broken                  | File the bug Issue, then `/diagnosing-bugs`                                          |

`/ship` closes `/implement`, which invokes it once the branch is complete; it ends the branch rather
than opening a new phase.

## Exemptions

These changes skip the gate. They still land through a PR from a topic branch.

- **Dependency bumps** — Dependabot PRs and `chore(deps)` / `chore(deps-dev)` commits.
- **Docs and agent config only** — every changed path is on the exempt list below.
- **Release prep** — the `docs: update docs and changelog for v<version>` commit `/ship` writes,
  including its release-line change to `package.json` and `package-lock.json`.
- **User waiver** — the user explicitly waives the flow for this change. Record it in the PR body as
  `Flow waived by the user: <reason>`.

### Code versus docs and agent config

Exempt paths:

- **Docs** — `README.md`, `CONTRIBUTING.md`, `CONTEXT.md`, `CHANGELOG.md`, `SECURITY.md`,
  `CODE_OF_CONDUCT.md`, `docs/`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`.
- **Agent config** — `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.agents/`,
  `.claude/`, `.codex/`, `skills-lock.json`.

Every other tracked path is code: `app/`, `components/`, `content/`, `lib/`, `public/`, `scripts/`,
`tests/`, `.github/workflows/`, `.github/dependabot.yml`, and the root build and tool config
(`package.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, and their peers).
`content/` is code even for a copy edit, because it compiles into the shipped site, and
`scripts/sync-agents.mjs` is code even though it serves agents. One code path makes the whole change
a code change.

## Linking work to its Issue

- **Branch** — `<type>/<issue#>-<slug>`, cut from current `origin/main` before the first edit, for
  example `fix/215-contribution-timeout`. `<type>` is one of the conventional-commit types this
  repository uses: `feat`, `fix`, `refactor`, `test`, `ci`, `build`, `docs`, `chore`. Exempt work
  with no Issue uses `<type>/<slug>`, such as `docs/dev-flow`; Dependabot names its own branches.
- **PR body** — the first line is `Closes #N` when the PR finishes the ticket, or `Part of #N` when
  it is one slice of a spec that stays open; a waiver line takes the same place. `/ship` and the PR
  template both put it first. GitHub closes an Issue only from a keyword in the body; a number in
  the PR title links nothing.
