# Architecture

This document explains the stable boundaries that are not obvious from a single config or source
file. Commands, versions, and thresholds remain authoritative in `package.json` and their config
files.

## Static artifact

Next.js builds a fully static `out/` directory. `next.config.ts` sets `output: "export"` and
disables image optimization, so application behavior cannot depend on a runtime Node server,
request-time rendering, API routes, or runtime environment variables.

Cloudflare Pages builds from `main` and publishes `out/`. Production headers live in
`public/_headers`; a `headers()` block in Next config would not affect the exported site. Static
assets live in `public/` and are referenced from application code with root paths.

## Page composition and content

`app/page.tsx` composes the single-page portfolio. Hero renders first; the remaining sections are
an ordered list. `surfaceAt(index)` derives alternating section surfaces after optional sections
have been filtered, preventing a missing section from shifting every later surface.

Portfolio prose lives in typed modules under `content/`. Section components import and render
those records, which keeps a resume edit independent from layout code. Contact identity and social
URLs live in `lib/site-config.ts`; metadata lives in `app/layout.tsx`. The homepage emits a static
schema.org `Person` and `WebSite` graph from that shared identity configuration in `app/page.tsx`.

`components/ui/section.tsx` owns the section shell, vertical rhythm, headings, surfaces, and typed
anchor registry. `SECTION_IDS` lists anchorable sections and `NAV_SECTION_IDS` selects the
navigable subset. Navigation labels form a total record over that subset so missing or invented
links fail to compile.

## UI vocabulary

Theme colors are CSS custom properties in `app/globals.css`, surfaced through semantic utilities
such as `text-heading`, `text-body`, and `section-surface`. Components compose classes with `cn()`
from `lib/utils.ts`.

`app/globals.css` defines these project-specific utility classes:

- Text hierarchy: `text-heading`, `text-body`, `text-label`, `text-muted`
- Badge text: `text-badge-blue`, `text-badge-green`, `text-badge-purple`,
  `text-badge-orange`
- Card surfaces: `card-bg-blue`, `card-bg-green`, `card-bg-purple`, `card-bg-orange`,
  `card-bg-white`, `card-bg-white-transparent`, `card-bg-white-80`, `bento-card-bg`
- Section and hero surfaces: `section-surface`, `section-surface-contrast`, `hero-section`
- Decorative treatments: `gradient-text`, `gradient-text-blue`, `glass`
- Animation: `animate-fadeInUp`

The four accent names and every associated token live in `lib/accent.ts`. `Badge` and `Card`
consume that table; callers name an accent rather than rebuilding background, border, and text
class combinations.

`next-themes` applies light/dark mode through the root class. A component that reads theme state
uses the `useSyncExternalStore` mount guard in `components/mode-toggle.tsx` and renders stable
placeholder markup through hydration. The root `<html>` is the only element that suppresses the
expected hydration warning.

## Build-time GitHub data

The homepage resolves featured repositories and contribution history during the build.
`lib/github-fetch.ts` owns the shared request policy: build User-Agent, optional bearer token,
force-cache behavior, non-OK failure, and warn-once fallback.

`lib/github.ts` and `lib/github-contributions.ts` validate their committed snapshots before use.
An upstream failure uses the validated snapshot; an invalid snapshot degrades further to empty
data. This makes public, CI, and offline builds independent from credentials and GitHub uptime.

The repository allowlist/normalizer and contribution query/normalizer live in plain `.mjs` modules
so the standalone Node refresh script imports the production contracts without a TypeScript build
step. `npm run refresh:github-snapshots`, run through the private process-scoped credential
template, validates all upstream responses before replacing both committed snapshots. Review both
JSON diffs and run the fallback tests before committing them. A scheduled Cloudflare rebuild keeps
successfully fetched live data current between committed snapshot refreshes.

The static homepage writes `data-github-data-source="live"` on its main element only when both
repository and contribution requests succeed. If either request falls back—including when a
committed snapshot is malformed and degrades to empty data—the marker is `fallback`. This exposes
the build result to production checks without rendering UI or disclosing request details.

## Test and delivery topology

Vitest and Testing Library cover modules with meaningful executable seams. Coverage policy lives
in `vitest.config.ts`; pure-JSX section and UI shell modules are excluded from line accounting and
asserted through seam tests instead.

Playwright starts its own server. Local runs cover the configured desktop and mobile projects. CI
builds once, uploads `out/`, then runs the Chromium-engine projects against that downloaded
artifact. `tests/global-setup.ts` refuses to run against an unrelated service already listening on
port 3000. A separate weekly and manually dispatchable workflow builds one static export, fans out
Firefox and WebKit into independent jobs, and uploads an engine-specific report from each. This
adds cross-browser regression coverage without extending routine merge checks.

Lighthouse CI measures the same downloaded static export in a separate advisory merge-time job.
Its versioned configuration collects five runs through Playwright's managed Chromium and evaluates
the representative median run against performance, best-practices, paint, blocking-time, and
layout-shift budgets. The command fails locally when a budget regresses; CI currently allows the
job to fail without blocking a merge and retains its generated reports for diagnosis.

Cloudflare deployment is independent from GitHub Actions CI. The daily and manually dispatchable
smoke workflow runs `npm run smoke:production` against the deployed site. That command checks the
homepage identity, complete security-header contract, public metadata artifacts, RFC 9116 contact,
404 behavior, and www-to-apex redirect, with contract-specific diagnostics. The refresh workflow
calls the Cloudflare Pages deploy hook, polls the returned deployment ID through the Pages API until
it succeeds or fails, then verifies both that deployment's URL and the production homepage report
live GitHub data. Release tags and changelog prediction follow
[ADR 0001](adr/0001-release-and-ship.md).

## Agent and private-workspace boundaries

Agent skill and subagent artifacts follow [ADR 0002](adr/0002-agent-artifact-sync.md). The public
repository/private companion boundary follows [ADR 0003](adr/0003-private-workspace.md); machine
recovery steps live in [Workspace bootstrap](agents/workspace-bootstrap.md).

Work state is not documented in this repository. Issues, the cross-repository `Holland.VIP` board,
and draft security advisories own it, per [ADR 0004](adr/0004-github-canonical-work-tracking.md) and
[Work tracking](agents/issue-tracker.md).
