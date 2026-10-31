# Docs

## Doc map

- `README.md` — the human overview, setup, command index and deployment entry point. **When:** a
  prerequisite, setup step, npm script or deployment entry point changes.
- `docs/architecture.md` — stable boundaries and non-obvious technical explanations. **When:** page
  composition, content ownership, theme architecture, GitHub build data, test topology,
  deployment, releases or agent artifact generation change.
- `AGENTS.md` — the authoritative agent rules and context pointers; keep always-loaded guidance
  short. **When:** a rule every coding agent must follow changes, a verification command changes,
  or a CI, release or agent-artifact contract it summarizes changes.
- `CONTRIBUTING.md` — the contributor workflow and required checks. **When:** the development flow,
  a required check or the PR template changes.
- `SECURITY.md` — supported versions, the reporting route, scope and response. **When:** the
  reporting route or the supported version changes, or the site gains a surface the scope omits
  (a backend, a form, user data); the headers it cites live in `public/_headers`.
- `CODE_OF_CONDUCT.md`, `LICENSE` — `owner-only`.
- `CLAUDE.md` — a Claude-only overlay that imports `AGENTS.md`. **When:** only a Claude Code note
  changes.
- `.github/copilot-instructions.md` — a Copilot-only high-signal overlay. **When:** only a Copilot
  note changes; never restate the architecture.
- `CONTEXT.md` — the domain glossary only, maintained through `domain-modeling`. `frozen` for this
  skill: report a term the code contradicts instead of editing it.
- `docs/adr/*.md` — accepted decisions. `frozen`: report a contradiction between an accepted ADR
  and the code instead of editing either.
- `CHANGELOG.md` — release history, Keep a Changelog, one dated section per merge. `ship-owned`.
- `docs/agents/*.md` — conventions and settings the skills read. **When:** a convention, route or
  setting changes.
- `.agents/skills/*/**` — skills, mirrored to `.claude/skills/`. The `mattpocock/skills` set is
  forked and owned here: edit it in place, and update `ask-matt`'s routing when a skill is added or
  removed. `end-session`, `handoff`, `lets-go`, `ship` and `docs-updater` install from
  `jwh3times/skills` (ADR-0005): `frozen` here, fixed upstream. **When:** a skill is added, removed
  or replaced (`.agents/skills/`, `skills-lock.json`): `ask-matt`'s routing and AGENTS.md's
  development-flow paragraph.
- `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*.md` — the PR body's sections; the
  bug and feature forms. **When:** the development flow's linking rule changes; the triage labels
  the forms apply change.
- `private/**/*.md` — durable private decisions, research and verification evidence in the
  companion; live status belongs in issues. **When:** a private procedure changes.

**Never in public docs:** a backlog, next action, active-issue list or status summary (GitHub owns
work state), credentials and recovery material, and unpublished vulnerability details (they stay in
a draft advisory).

## Drift probes

- Sections and anchors: `SECTION_IDS` in `components/ui/section.tsx` and the order in
  `app/page.tsx`
- Coverage thresholds: `thresholds` in `vitest.config.ts`
- CI jobs: the keys under `jobs:` in `.github/workflows/ci.yml`, then each one's `name:` — never a
  bare `name:` grep, which counts steps too
- npm scripts: `scripts` in `package.json`
- Node version: `.nvmrc` and `engines.node` in `package.json`
- Required status checks: `gh api repos/jwh3times/holland-vip/rules/branches/main`

## Docs validation

- `node scripts/check-docs.mjs`
- `npm run format:check` — Prettier covers the repository's Markdown.
