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
- `node scripts/check-docs.mjs`
- only when `scripts/` changed: `node --test "scripts/*.test.mjs"`
- only when `app/`, `components/`, `lib/`, `tests/unit/` or `vitest.config.ts` changed:
  `npm run test:unit:coverage` — the 95% thresholds in `vitest.config.ts`

The unit entry is the **Unit Tests & Coverage** job's command, run here only when its paths
changed. CI-only: the production build, **Playwright Tests** (a browser against the static build),
the advisory **Lighthouse Budget** and **CodeQL**.
