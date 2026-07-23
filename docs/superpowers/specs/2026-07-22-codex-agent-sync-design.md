# Codex ↔ Claude Agent-Artifact Sync — Design

- **Date:** 2026-07-22
- **Status:** Approved (design); pending implementation plan
- **Author:** Jerry Holland (with Claude Code)
- **Topic:** Single source of truth for skills and subagents shared between Claude Code and OpenAI Codex CLI

## Problem

The repo is gaining OpenAI Codex CLI support alongside Claude Code. The Claude
tooling lives under `.claude/` (skills, subagents, settings); Codex reads its own
paths. Two Codex artifacts were created by hand as copies of the Claude sources
with a blanket `CLAUDE.md → AGENTS.md` / `Claude → Codex` find-replace, and both
were **corrupted by that substitution** before ever being committed:

- `.codex/agents/docs-updater.toml` — the "documents you maintain" description
  became `AGENTS.md, README.md, and AGENTS.md` (the real `CLAUDE.md` reference was
  destroyed and `AGENTS.md` listed twice); the maintained-docs table collapsed two
  distinct rows into one.
- `.agents/skills/ship/SKILL.md` — `docs it owns (AGENTS.md, README.md, AGENTS.md)`
  and `git add CHANGELOG.md AGENTS.md README.md AGENTS.md` — again the `CLAUDE.md`
  reference gone, `AGENTS.md` duplicated.

This is the drift the project wants to prevent, demonstrated on the very first
hand copy. The fix must be **mechanical**: a single source of truth from which the
Codex artifacts are generated, with drift caught in CI.

## Verified facts — Codex CLI config surface

Confirmed against current Codex CLI documentation (April–May 2026):

| Concept         | Claude source                                                                     | Codex artifact                                                                                                                                                   | Format relationship                                                                                                        |
| --------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Skills**      | `.claude/skills/<name>/SKILL.md`                                                  | `.agents/skills/<name>/SKILL.md`                                                                                                                                 | **Identical** — both markdown + `name`/`description` YAML frontmatter (+ optional `references/`, `scripts/`, `templates/`) |
| **Subagents**   | `.claude/agents/<name>.md` (frontmatter: `name`, `description`, `tools`, `model`) | `.codex/agents/<name>.toml` (`name`, `description`, `developer_instructions`, optional `model`, `model_reasoning_effort`, `sandbox_mode`, `nickname_candidates`) | **Different** — md+frontmatter → TOML                                                                                      |
| **Root memory** | `CLAUDE.md`                                                                       | `AGENTS.md` (32 KiB cap)                                                                                                                                         | Both markdown; **out of scope** (see below)                                                                                |

Key implications:

1. Codex's project skills path is `.agents/skills/` and uses the **same
   `SKILL.md` format** as Claude, so a Codex skill is a near-verbatim copy — no
   text substitution is warranted or correct.
2. Only subagents require a real structural transform (markdown + YAML frontmatter
   → TOML), and two TOML fields (`model`, `sandbox_mode`) have no direct Claude
   equivalent.

## Scope

**In scope:** skills and subagents.

- Generate `.agents/skills/**` from `.claude/skills/**`.
- Generate `.codex/agents/*.toml` from `.claude/agents/*.md`.

**Out of scope (deliberate):**

- **Root docs** `CLAUDE.md` / `AGENTS.md` — already kept in sync by the
  `docs-updater` subagent as intentionally different, audience-native prose;
  `CLAUDE.md` is ~17 KB against Codex's 32 KiB `AGENTS.md` cap. Left as-is.
- **Settings** `.claude/settings.json` vs Codex `config.toml` — schemas diverge
  too much to map mechanically.

## Design

### 1. Directionality — `.claude/` is canonical

The only files a human edits are:

- `.claude/skills/<name>/SKILL.md` (and any sibling files)
- `.claude/agents/<name>.md`

Everything under `.agents/` and `.codex/` is **generated output** and must never
be hand-edited. `.claude/` is chosen as canonical because it already exists, is the
richer format (carries `tools`/`model` metadata that maps _down_ to Codex), and is
where the primary workflow happens. No neutral third source is introduced (YAGNI —
it would be a representation no tool reads directly).

Each generated file carries a **banner** marking it as generated:

- TOML: a leading `#` comment line.
- Skill `SKILL.md`: a YAML `#` comment line injected as the second line of the
  frontmatter block (keeps `---` on line 1 so Codex's frontmatter parser still
  works). Non-markdown sibling files (scripts, references) are copied without a
  banner.

Banner text (no date, to keep output deterministic):
`GENERATED — do not edit. Source: <path>. Regenerate: npm run sync:agents`

### 2. Skills — verbatim directory mirror

For each `<name>` under `.claude/skills/`, mirror the **entire directory** to
`.agents/skills/<name>/`:

- `SKILL.md` — copied verbatim except for the injected frontmatter banner line.
- All other files/subdirs (`references/`, `scripts/`, `templates/`, …) — copied
  byte-for-byte.
- **No `CLAUDE.md → AGENTS.md` substitution.** The `ship` skill's content is
  tool-agnostic: its `docs-updater` step legitimately refreshes all three of
  `CLAUDE.md` / `README.md` / `AGENTS.md` no matter which tool runs it, so every
  `CLAUDE.md` mention is accurate for Codex too.
- Stale outputs are removed: an `.agents/skills/<name>` with no corresponding
  `.claude/skills/<name>` source is deleted on regeneration.

Current inputs: one skill, `ship`.

### 3. Subagents — structural transform to TOML

For each `.claude/agents/<name>.md`, parse frontmatter + body and emit
`.codex/agents/<name>.toml` with this mapping:

| Claude `.md`  | Codex `.toml`            | Rule                                                                                                                                       |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `name`                   | verbatim (TOML basic string, escaped)                                                                                                      |
| `description` | `description`            | **verbatim** (TOML basic string, escaped) — no substitution                                                                                |
| body markdown | `developer_instructions` | verbatim, emitted as a TOML **literal** multi-line string (`'''…'''`) so backslashes in regex patterns (`\s`, `\.`) pass through untouched |
| `tools:` list | `sandbox_mode`           | **derived**: list contains `Write` or `Edit` → `"workspace-write"`, else `"read-only"`                                                     |
| `model`       | _(omitted)_              | Claude/Codex model namespaces don't map; omit so Codex uses its configured default                                                         |

Notes:

- `description` and `name` are emitted as TOML **basic** strings (`"…"`) with
  proper escaping of `"`, `\`, and control chars.
- `developer_instructions` uses a TOML **literal** string. The generator **fails
  loudly** if the body contains the `'''` delimiter (rare; no current source hits
  it) rather than silently producing invalid TOML.
- `sandbox_mode` derivation is a correctness fix: `docs-updater` uses `Write`/`Edit`
  and so must run `workspace-write`; the hand-made file omitted this and would have
  defaulted to read-only, unable to update docs.

Expected `docs-updater.toml` output (abridged):

```toml
# GENERATED — do not edit. Source: .claude/agents/docs-updater.md. Regenerate: npm run sync:agents
name = "docs-updater"
description = "Use to keep project documentation current after code changes — CLAUDE.md, README.md, and AGENTS.md. Run after adding a section/component, changing CI workflows, theming/CSS variables, or test configuration."
sandbox_mode = "workspace-write"
developer_instructions = '''
You are keeping the holland.vip portfolio documentation current. ...
'''
```

**Deferred escape hatch (not built now):** a specific Codex `model` /
`model_reasoning_effort` per agent can later be supplied via an optional `codex:`
block in the Claude frontmatter — Claude Code ignores unknown frontmatter keys and
the generator would read them. There is nothing to configure today, so this is not
implemented; if added later, verify Claude tolerates the extra key.

### 4. Generator — `scripts/sync-agents.mjs`

- ESM, **zero new dependencies**, matching the existing `scripts/*.mjs` convention
  (`next-version.mjs`, `seed-contributions.mjs`).
- Hand-rolled minimal frontmatter reader and TOML emitter. The frontmatter in this
  repo is deliberately simple (`key: value` lines and a single comma-separated
  `tools:` list); the reader is documented as handling _that_ shape, not arbitrary
  YAML.
- **Deterministic** output (no timestamps / no ordering nondeterminism) so
  regeneration never churns and `--check` is stable.

CLI contract:

- `node scripts/sync-agents.mjs` — regenerate all artifacts to disk (create,
  overwrite, and delete stale outputs).
- `node scripts/sync-agents.mjs --check` — regenerate in memory, compare to
  on-disk; exit `0` if identical, exit `1` and print the stale/missing paths
  otherwise. Writes nothing. Retained for local use and testability even though CI
  uses auto-commit.

`package.json` gains `"sync:agents": "node scripts/sync-agents.mjs"`.

### 5. CI — auto-commit workflow `.github/workflows/sync-agents.yml`

- Trigger: `on: pull_request` targeting `main`.
- `permissions: contents: write`.
- Steps: checkout PR head branch → setup-node from `.nvmrc` → `npm ci` →
  `node scripts/sync-agents.mjs` → if `git status` shows changes under `.agents/`
  or `.codex/`, configure a bot identity, `git add .agents .codex`, commit
  (`chore: sync codex agent artifacts`), and `git push` back to the PR branch.
- **Self-terminating:** commit only when there are changes, so a run triggered by
  the auto-commit finds nothing to do and exits — no loop.
- **Re-trigger fix:** checkout/push use a fine-grained PAT secret **`SYNC_PAT`**
  (contents: read/write on this repo) so the auto-commit re-triggers `ci.yml`'s
  required checks on the new SHA. Without a PAT, pushes made with the default
  `GITHUB_TOKEN` do not re-trigger workflows and required checks would sit pending
  on the auto-commit SHA (manual re-run needed). Documented as a required setup
  step.
- Fork PRs cannot auto-push (read-only token) — a non-issue for this solo repo,
  noted for completeness.

### 6. Merge prep for the currently-uncommitted files

The two broken untracked files are **replaced by correct generated output**, not
merged as-is:

1. Build `scripts/sync-agents.mjs`.
2. Run `npm run sync:agents` — regenerates `.agents/skills/ship/SKILL.md` and
   `.codex/agents/docs-updater.toml` correctly (correct description, banner,
   `sandbox_mode`, intact body).
3. Commit together: the generator, the CI workflow, the `package.json` script, the
   unit test, and the corrected `.agents/` / `.codex/` artifacts. The corrupted
   hand-made content never lands.

Generated artifacts are **committed** (not gitignored) — Codex reads them from the
working tree and other clones/CI need them present.

## Testing

- A focused Vitest unit test for the generator covering:
  - frontmatter parse → TOML emit for a subagent (field mapping, banner,
    `sandbox_mode` derivation, literal-string body),
  - the `'''`-in-body guard (expect a thrown error),
  - skill directory mirroring + banner injection,
  - `--check` returning non-zero when an artifact is stale and zero when in sync.
- Confirm during implementation that `scripts/` is outside the Vitest coverage
  `collectCoverageFrom` scope, so the new script neither drags down nor is forced
  to meet the 80% component-coverage gate. Add an exclude if needed.
- `npm run format` / `format:check`, `npm run lint`, `npx tsc --noEmit` stay green
  (the CI `build`/`unit` jobs remain the gate).

## Risks & mitigations

- **Hand-rolled YAML/TOML** — acceptable because the input frontmatter is tiny and
  controlled; the generator fails loudly on anything it doesn't understand rather
  than emitting silently-wrong output.
- **`SYNC_PAT` setup** — the workflow is inert-but-harmless until the secret is
  added; document the one-time setup (create fine-grained PAT, add repo secret).
- **Someone edits a generated file** — the next CI run regenerates from `.claude/`
  and overwrites it (source-of-truth wins, by design); the banner warns humans up
  front.
- **Claude reading `.agents/skills/`** — Claude Code reads `.claude/skills/`, not
  `.agents/skills/`, so there is no duplicate-skill collision. Verify during
  implementation.

## Out of scope / future

- Root-doc (`CLAUDE.md`/`AGENTS.md`) mechanical sync.
- `.claude/settings.json` ↔ Codex `config.toml`.
- Per-agent Codex `model` / reasoning-effort overrides (the deferred `codex:`
  frontmatter escape hatch).
- Additional tools beyond Claude and Codex.

## References

- Codex CLI customisation stack (skills / subagents / AGENTS.md paths & formats):
  <https://codex.danielvaughan.com/2026/04/12/codex-cli-customisation-stack-unified-system/>
- Codex subagents format (`.codex/agents/*.toml` fields):
  <https://proflead.dev/posts/codex-subagents-explained/>
- Codex custom prompts (deprecated in favor of skills) & AGENTS.md:
  <https://developers.openai.com/codex/custom-prompts>,
  <https://developers.openai.com/codex/guides/agents-md>
