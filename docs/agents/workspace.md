# Workspace

## Private companion

`private/` — the independent `jwh3times/holland-vip-workspace` repository, ignored by this one and
installed with `npm run bootstrap:private` (see `docs/agents/workspace-bootstrap.md`).

## Workspace status command

`git status --short --branch` and `git -C private status --short --branch`

## Companion commit policy

ask — commit or push the private repository only on the user's explicit authorization.

## Sync with main

`npm run sync:main` — fast-forwards both clean worktrees; `npm run sync:main -- --skip-private`
updates only the public checkout.

## Safe-to-remove paths

Left in place by default; offer to remove them only when the user asks for a cold tree:

- `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`, `tsconfig.tsbuildinfo`
- stray scratch files at the repository root or under `private/`, named one by one

## Never-remove paths

- `node_modules/`
- `private/`, in any form — `git clean -fdx` here destroys it, so inspect with `git clean -nd` and
  delete confirmed paths with an explicit `rm`
- `.env`, `.env.*`
- `.claude/settings.local.json`
- `.claude/worktrees/` — removing one is the user's decision; it may hold unpushed commits

## Dev stack

none

## Generated-config check

`npm run sync:agents:check` (run inside the required **Build & Lint** check), regenerated with
`npm run format` then `npm run sync:agents` — when agent sources changed (`.agents/skills/`,
`.claude/agents/`).

## Final portability check

none
