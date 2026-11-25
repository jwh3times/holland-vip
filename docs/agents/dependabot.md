# Dependabot

What reviewing a Dependabot pull request takes here, read by the `dependabot` skill in a session
and in the scheduled review. These facts apply to this repository only. How a Dependabot PR catches
up with `main` is in [releases](releases.md#merging-into-main), and reading a lockfile diff is in
[merging](merging.md#reviewing-a-dependency-change).

## Stack

A Next.js 16 (App Router) personal portfolio: React 19, TypeScript 7, Tailwind CSS 4, linted with
oxlint and oxlint-tsgolint (no ESLint), unit-tested with Vitest and jsdom, browser-tested with
Playwright. One `package.json` and `package-lock.json` at the repo root, no workspaces, and Node
from `.nvmrc` (a major only, matching `engines.node`).

`.github/dependabot.yml` updates two ecosystems from `/`: `npm` and `github-actions`. Each groups
its minor and patch bumps into one PR. In npm, the majors of these families arrive as one PR each:
`next-ecosystem`, `react`, `testing-library`, `vite-ecosystem` and `lint-and-typescript` (oxlint,
oxlint-tsgolint, typescript). `tests/unit/dependabot-groups.test.ts` fails when a group matches no
declared dependency.

Workflows run on pull requests: `ci.yml` (`Build & Lint`, `Playwright Tests`,
`Unit Tests & Coverage`, `Changelog`, and the advisory `Lighthouse Budget (advisory)`),
`dependency-review.yml` and `sync-agents.yml`. `cross-browser.yml`, `refresh.yml` and
`smoke.yml` run on a schedule or by hand, and `version.yml` on a push to `main`.

## Where to look

- The `with:` inputs in every workflow, and `tests/unit/workflow-action-pinning.test.ts`, which
  checks how the actions are pinned.
- Next.js: `next.config.ts`, `app/` (no `app/api/`, no middleware), `public/_headers` (the
  production headers; Next's `headers()` does not apply to a static export), and the Vitest mocks
  in `tests/unit/mocks/` that `vitest.config.ts` aliases over `next/image`, `next/link`,
  `next/font/local` and `geist/font/sans`.
- Tailwind: `app/globals.css` (`@import "tailwindcss"`, `@custom-variant dark`, `@theme inline`,
  `@layer base`), `postcss.config.mjs` (`@tailwindcss/postcss`), and
  `tests/unit/globals-css.test.ts`, which reads that file.
- TypeScript and linting: `tsconfig.json` (the `next` plugin) and `.oxlintrc.json`.
- Tests: `vitest.config.ts` and `vitest.setup.ts`, `playwright.config.ts` (it serves `out/` with
  `serve` in CI), `lighthouserc.cjs` and `scripts/lighthouse-puppeteer.cjs`.
- `overrides` in `package.json`, which pins transitive versions (postcss, lighthouse and others).

## Grounding facts

- Static export, no server: `next.config.ts` sets `output: "export"` and `images.unoptimized`, and
  there is no `app/api/` and no middleware (`docs/architecture.md`, "Static artifact"). A Next.js
  major's changes to the server, middleware, API routes, the image-optimization server or runtime
  configuration do not reach this repository; changes to static export, the App Router, metadata
  or the build do.
- Tailwind 4 is configured in CSS: there is no `tailwind.config.*`. A Tailwind major's changes to
  the JavaScript config schema do not apply; changes to the CSS directives in `app/globals.css` or
  to `@tailwindcss/postcss` do.
- There is no ESLint and no `eslint-config-next`: `npm run lint` is `oxlint .`. ESLint and
  Next's lint plugin release notes do not apply.
- No database, no Docker and no container images.
- Cloudflare Pages builds `main` and publishes `out/` (`docs/architecture.md`), and builds every
  PR's branch as a preview, reported as the `Cloudflare Pages` check. That deployment is
  independent of GitHub Actions.
- Every workflow job runs on GitHub-hosted `ubuntu-latest`. CI installs Playwright's browsers on
  the runner (`npx playwright install --with-deps chromium`); there is no Playwright image pin.
- `Changelog` passes a Dependabot PR, which adds no `changelog.d/` fragment, and `version.yml`
  gives its merge a section from its PR title (`ci.yml`, `scripts/stamp-changelog.mjs`).

## Playbook

- **Next.js major** (`next-ecosystem`): confirm whether the breaking change touches static export.
  Run `npm run build` (`next build`, exporting to `out/`), `npx tsc --noEmit`, `npm run lint` and
  `npm run test:unit:coverage`, the last because the unit tests stub `next/image`, `next/link` and
  `next/font/local`. Cite the specific change and the `next.config.ts` line or the file it
  affects.
- **Tailwind CSS major** (`tailwindcss` or `@tailwindcss/postcss`): check `app/globals.css` and
  the PostCSS pipeline, then run `npm run build` and `npm run test:unit:coverage`
  (`tests/unit/globals-css.test.ts`). Cite the specific change to the CSS-first configuration.
- **TypeScript or oxlint major** (`lint-and-typescript`): run `npm run lint` (oxlint with
  tsgolint's type-aware rules), `npx tsc --noEmit` and `npm run build`. Cite the specific rule,
  flag or compiler change.
- **Vitest, jsdom or Testing Library major** (`vite-ecosystem`, `testing-library`, `jsdom`): run
  `npm run test:unit:coverage`; it fails below the 95% thresholds in `vitest.config.ts`.
- **`@playwright/test` major**: CI runs Chromium and Mobile Chrome
  (`npm run test:e2e -- --project=chromium --project="Mobile Chrome"`); Firefox and WebKit run
  only in the scheduled `cross-browser.yml`, never on the PR. Read the release notes for config or
  API breaks against `playwright.config.ts` and `tests/*.spec.ts`; the gate is CI, so a green
  `Playwright Tests` plus cited evidence is the verdict basis.
- **GitHub Actions major**: read the action's release notes for every major crossed and grep its
  `with:` inputs across `.github/workflows/`. Cite the exact input or behavior that changed and
  whether this repository sets it.
