# Guard

The commands and paths `scripts/guard.mjs` stops in this repository, on top of the rules it applies
everywhere; the format is defined in `.agents/skills/ship/settings/guard.md`.

## Deny commands

- `^gh auth token\b` — prints the GitHub CLI's live token; authenticated `gh` commands use the
  credential manager directly, so run them instead.
- `^npx skills update\b` — leaves `.claude/skills/` linked to its source instead of copied; re-run
  the `npx skills add ... --copy -y` install in `AGENTS.md` instead.
- `^git add\b(?=.*\s(-f|--force)\b)(?=.*\sprivate(/|\s|$))` — stages the private companion into the
  public repository; `private/` is its own repository and is committed there.
- `^git submodule add\b` — adds a `.gitmodules`, which this repository never carries; the private
  companion is a separate clone installed by `npm run bootstrap:private`.
- `^gh api\b(?=.*\bsecurity-advisories\b)(?=.*\bstate=closed\b)` — closes a security advisory, which
  is only the alternative to publishing a draft; judge a published one by `state`, `withdrawn_at`
  and `patched_versions` instead.

## Ask commands

- `^npx playwright install\b` — a large browser download, run only when the user asks; locally run
  `npx playwright test --project=chromium --project="Mobile Chrome"`.
- `^git rebase\b(?!.*--(abort|quit|continue|skip)\b)` — a branch catches up by merging, and a
  pushed branch is never rebased; confirm this one is unpushed.

## Protected paths

- `^private/` — the private companion repository; inspect with `git clean -nd` and delete confirmed
  paths inside it with an explicit `rm`.
- `^\.env(\..*)?$` — local configuration and `op://` references that are not in Git.
- `^\.claude/settings\.local\.json$` — the maintainer's local Claude Code settings, not in Git.
- `^node_modules/` — the installed dependencies; reinstall with `npm ci` rather than deleting them.
