# Test proof

How `test-prover` runs one test on its own here, and how it tells a run that tested nothing from a
pass.

## Test commands

- repo root: Vitest unit and component tests, `tests/unit/**/*.test.{ts,tsx}` (the `include` in
  `vitest.config.ts`).
  - One file: `npx vitest run <file>`; one test by name: `npx vitest run <file> -t "<name>"`.
  - The count is Vitest's `Tests  N passed (N)` line, which `mutate.mjs` reads already.
  - The scratch worktree links `node_modules`.
- repo root: `scripts/*.test.mjs`, node's built-in test runner.
  - One file: `node --test <file>`; one test by name:
    `node --test --test-name-pattern="<name>" <file>`, with `<name>` regex-escaped.
  - The count is node's `ℹ tests N` line, which `mutate.mjs` reads already.
  - The scratch worktree links `node_modules`.
- repo root: Playwright, `tests/*.spec.ts`: not provable here. The command would be
  `npx playwright test <file> --project=chromium -g "<name>"`, but its server is Next: `CI=true`
  (which `mutate.mjs` sets) serves `out/`, and Next's Turbopack refuses a `node_modules` linked
  from outside the worktree, so neither `npm run build` nor `npm run dev` runs in a scratch
  worktree without its own `npm ci`. It also needs the Chromium build of the installed Playwright
  version.

## Guide

none
