# Ship

## Fast checks

All from the repository root; together they cover what the required **Build & Lint** check runs
before its build.

- `npm run format:check`, fixed by `npm run format`
- `npm run lint`
- `npx tsc --noEmit` (the type errors the build would hit)
- `npm run sync:agents:check`, fixed by `npm run format` then `npm run sync:agents`, committing the
  regenerated mirrors
- `npm run lint:agents`
- only when `scripts/` changed: `node --test scripts/sync-agents.test.mjs scripts/lint-agent-neutrality.test.mjs`
- only when `app/`, `components/`, `lib/`, `tests/unit/` or `vitest.config.ts` changed:
  `npm run test:unit:coverage` — the 95% thresholds in `vitest.config.ts`

The production build, **Playwright Tests**, **Unit Tests & Coverage**, the advisory Lighthouse
budget and **CodeQL** run only in CI.

## Issue link

- **Branch pattern:** `<type>/<issue#>-<slug>`, `<type>` one of `feat`, `fix`, `refactor`, `test`,
  `ci`, `build`, `docs`, `chore`. Exempt work drops the number (`docs/dev-flow`); Dependabot names
  its own.
- **Link line:** `Closes #<n>` when the PR finishes the issue; `Part of #<n>` for one slice of a
  spec that stays open. It is the body's first line.
- **Waiver line:** `Flow waived by the user: <reason>`.
- **Exempt:**
  - dependency bumps
  - changes touching only docs and agent config
  - release prep (the `docs: update docs and changelog for v<version>` commit)
- **Defined in:** `docs/agents/dev-flow.md`.
