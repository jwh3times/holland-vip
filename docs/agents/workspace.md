# Workspace

## Private companion

`private/` — the independent `jwh3times/holland-vip-workspace` repository, ignored by this one and
installed with `npm run bootstrap:private` (see `docs/agents/workspace-bootstrap.md`).

## Safe-to-remove paths

- `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`, `tsconfig.tsbuildinfo`

## Never-remove paths

- `node_modules/`
- `private/`, in any form — `git clean -fdx` here destroys it, so inspect with `git clean -nd` and
  delete confirmed paths with an explicit `rm`
- `.env`, `.env.*`
- `.claude/settings.local.json`

## Dev stack

none

## Generated-config check

`npm run sync:agents:check` (run inside the required **Build & Lint** check), regenerated with
`npm run format` then `npm run sync:agents` — always: it is quick, and it also catches an orphaned mirror.
