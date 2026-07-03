# Contributing to holland.vip

This is a personal portfolio site, so most content changes are reserved for the
site's owner — but bug reports, accessibility fixes, dependency bumps, and small
correctness improvements are very welcome. Thanks for helping!

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting set up

Follow the [Getting Started](./README.md#-getting-started) section of the README
(Node version pinned in `.nvmrc` — run `nvm use` — then `npm install`,
`npm run dev`).

## Workflow

1. **Open an issue first** for anything non-trivial so we can agree on the approach.
2. Create a branch and make your change in small, focused commits.
3. Ensure everything is green locally — these mirror the CI jobs:

   ```bash
   npm run lint && npm run format:check   # Build & Lint job (with npm run build)
   npm run build
   npm run test:unit:coverage             # Unit Tests & Coverage job (80% gate)
   npm test                               # Playwright E2E (CI runs Chromium projects)
   ```

4. Open a Pull Request and fill in the template. CI (build/lint/format, unit
   coverage, E2E) and the dependency-review check must pass.

## Standards

- **Formatting** — Prettier owns formatting; run `npm run format` before
  committing. A PR fails CI if formatting drifts.
- **Tests** — unit coverage is gated at **80%** (statements/branches/functions/
  lines), so new components generally need a test in `tests/unit/`.
- **Conventions** — use the CSS-variable utility classes and the `cn()` helper;
  never hardcode colors. The full conventions live in [CLAUDE.md](./CLAUDE.md)
  (theme/hydration patterns, static-export constraints, styling DO/DON'Ts).

## Security issues

Do not report vulnerabilities in public issues — see [SECURITY.md](./SECURITY.md)
for the private disclosure process.
