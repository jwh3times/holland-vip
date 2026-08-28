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
URLs live in `lib/site-config.ts`; metadata lives in `app/layout.tsx`.

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

The contribution GraphQL query and level map live in a plain `.mjs` module because the standalone
Node seeder imports the same contract without a TypeScript build step. A scheduled Cloudflare
rebuild keeps successfully fetched live data current.

## Test and delivery topology

Vitest and Testing Library cover modules with meaningful executable seams. Coverage policy lives
in `vitest.config.ts`; pure-JSX section and UI shell modules are excluded from line accounting and
asserted through seam tests instead.

Playwright starts its own server. Local runs cover the configured desktop and mobile projects. CI
builds once, uploads `out/`, then runs the Chromium-engine projects against that downloaded
artifact. `tests/global-setup.ts` refuses to run against an unrelated service already listening on
port 3000.

Cloudflare deployment is independent from GitHub Actions CI. The scheduled smoke workflow checks
the deployed site, while the refresh workflow calls the Cloudflare Pages deploy hook. Release tags
and changelog prediction follow [ADR 0001](adr/0001-release-and-ship.md).

## Agent and private-workspace boundaries

Agent skill and subagent artifacts follow [ADR 0002](adr/0002-agent-artifact-sync.md). The public
repository/private companion boundary follows [ADR 0003](adr/0003-private-workspace.md); machine
recovery steps live in [Workspace bootstrap](agents/workspace-bootstrap.md).
