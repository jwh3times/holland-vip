# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jerry Holland built with Next.js 16+ (App Router), React 19.2+, TypeScript 7+, and Tailwind CSS v4. The site is configured for **static export** (SSG) and is deployed to **Cloudflare Pages** (custom domain `holland.vip`, with `www` 301-redirecting to the apex). Cloudflare Pages builds directly from the repo on push to `main`. The static `/out` output is portable to any static host.

Tailwind v4 is loaded via `@import "tailwindcss"` in [app/globals.css](app/globals.css) and configured entirely in CSS (custom properties + utility classes) — there is **no `tailwind.config.ts`**.

## Common Commands

### Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build static site to /out directory
npm run lint         # Run Oxlint
npm run lint:fix     # Apply Oxlint's safe fixes
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
```

### Testing

There are two test layers: **Vitest + Testing Library** for fast unit/component tests, and **Playwright** for end-to-end browser tests.

#### Unit tests (Vitest)

Component/unit tests live in [tests/unit/](tests/unit/) (`*.test.tsx`). They run in jsdom; `next/image` and `next/link` are stubbed via `tests/unit/mocks/*`, and CSS is not processed (Tailwind/PostCSS stay out of unit runs). Coverage is collected with V8 and **gated at 95%** (statements/branches/functions/lines) in [vitest.config.ts](vitest.config.ts). `components/sections/**` and the pure-JSX `components/ui/{section,card,badge,bento-grid}.tsx` shells are excluded from that measurement — a component whose body is a single JSX expression reports 100% the moment anything renders it, so it isn't a meaningful line-coverage signal; their behavior is asserted instead through seam tests (`section.test.tsx`, `sections.test.tsx`, `accent.test.tsx`).

```bash
npm run test:unit            # Run unit tests once
npm run test:unit:watch      # Watch mode
npm run test:unit:coverage   # Run with V8 coverage (enforces the 95% thresholds)
```

#### End-to-end (Playwright)

A server is started automatically — `playwright.config.ts` defines a `webServer` that waits on `localhost:3000` (`reuseExistingServer` is on locally, off in CI). You do **not** need to start one manually.

**Which server depends on the target**, and this matters when reproducing a CI failure:

| Condition                             | `webServer.command`                          | System under test           |
| ------------------------------------- | -------------------------------------------- | --------------------------- |
| Default (local)                       | `npm run dev`                                | Next.js dev server          |
| `CI` set, or `E2E_TARGET=build` local | `npx serve out --listen 3000 --no-clipboard` | The static export in `out/` |

So **CI e2e never exercises the dev server** — it tests the exact `out/` artifact the `build` job produced. To reproduce that locally, run `npm run build` first (the `out/` directory must exist), then `E2E_TARGET=build npx playwright test`. A failure that reproduces under `E2E_TARGET=build` but not under `npm run dev` is a build/export difference, not a flake.

Because `reuseExistingServer` accepts whatever is already on port 3000 — the Next.js default, so a second project's dev server can claim it — [tests/global-setup.ts](tests/global-setup.ts) probes `baseURL` first and aborts the run if the server answering isn't this site (checked against `siteConfig.url` and `siteConfig.name`). Nothing listening is fine; only a foreign server is rejected. Without it the suite runs green-or-red against the wrong app with no hint that the port is the problem.

```bash
npm test              # Run all Playwright tests (headless)
npm run test:ui       # Open Playwright UI mode
npm run test:headed   # Run tests with browser visible
npm run test:debug    # Run tests in debug mode

# Run a single file / test / project
npx playwright test tests/homepage.spec.ts
npx playwright test -g "theme toggle"
npx playwright test --project=chromium
```

Tests run across 5 projects (Desktop Chrome/Firefox/Safari + Mobile Chrome/Safari). **CI runs the Chromium-engine projects only** (`npm run test:e2e -- --project=chromium --project="Mobile Chrome"` — desktop + mobile viewport), so a test that passes in CI may still surface Firefox/WebKit-specific failures only when run across all projects locally.

Test files are in [tests/](tests/) covering homepage, accessibility, SEO, theme toggling, mobile navigation, and the 404 page (`not-found.spec.ts`). Select elements by role, test id (`data-testid`), or ARIA attribute rather than Tailwind utility classes — a class-name selector (e.g. `nav .hidden.md\:flex`) passes as long as the string is present even if the styles never apply, and breaks the moment the class list is reordered or renamed.

### Testing Build Output

After `npm run build`, the `/out` directory contains the complete static site. There is no production preview server — `next start` does not serve the static export. Use `npm run preview` (an alias for `npx serve out`) to preview the built output.

## CI/CD

- **Validation — [.github/workflows/ci.yml](.github/workflows/ci.yml)** — runs on push/PR to `main` with four jobs: the `build` job runs `npm run lint`, `npm run format:check`, `node scripts/sync-agents.mjs --check`, then `npm run build` (and uploads the `out/` artifact); the `unit` job runs `npm run test:unit:coverage` and **fails if coverage drops below the 95% thresholds** in `vitest.config.ts` — the gate's `include` excludes `components/sections/**` and the pure-JSX `ui/{section,card,badge,bento-grid}` shells, whose behavior is verified through seam tests rather than line coverage; the `test` job (needs `build`) downloads the `build` job's `static-site` artifact into `out/`, installs chromium, and runs Playwright against the Chromium-engine projects (`chromium` + `Mobile Chrome`) — so CI e2e exercises the built static export, not a dev server; the `changelog` job (PR-only, skipped for `dependabot[bot]`) fails the PR if the top `## [x.y.z]` version in [CHANGELOG.md](CHANGELOG.md) doesn't match the version `node scripts/next-version.mjs` computes — i.e. the version that merging this PR will actually mint. **A PR will fail CI if formatting drifts — run `npm run format` before committing.**
- **Agent artifact sync — [.github/workflows/sync-agents.yml](.github/workflows/sync-agents.yml)** — on same-repo pull requests, regenerates the agent artifacts from their authored sources and auto-commits any drift back to the branch; requires the `SYNC_PAT` repo secret (no-ops if unset) and is skipped for fork PRs. This runs alongside — not instead of — the `build` job's secret-free `sync-agents.mjs --check` gate above; see [Agent artifact sync](#agent-artifact-sync) below for how the artifacts are derived.
- **Dependency review — [.github/workflows/dependency-review.yml](.github/workflows/dependency-review.yml)** — on PRs to `main`, fails on high-severity dependency vulnerabilities.
- **Code scanning — CodeQL (default setup)** — enabled via GitHub's **default setup** (repo _Settings → Code security_), which scans JS/TS + Actions on PRs to `main` and weekly; findings surface in the Security tab. There is intentionally **no `codeql.yml`** in the repo: an advanced CodeQL workflow cannot upload results while default setup is enabled (it fails with _"analyses from advanced configurations cannot be processed when the default setup is enabled"_). Manage CodeQL from the Security settings, not a workflow file.
- **Versioning — [.github/workflows/version.yml](.github/workflows/version.yml)** — on every merge (push) to `main`, creates a standard SemVer tag and GitHub Release in `v<major>.<minor>.<build>` format (for example, `v1.0.3`). `/ship` classifies the branch as major, minor, or build-only and updates the `package.json` release line for a confirmed major/minor increase. The exact version is computed by [scripts/next-version.mjs](scripts/next-version.mjs) — the single source of truth shared with the CI `changelog` guard and `/ship`. It reads `package.json` `version` as the requested `major.minor.build` release line, auto-increments the build number from existing tags in that major/minor line, and preserves `x.y.0` when a new major/minor line has no existing `v<x>.<y>.*` tags.
- **Deployment — Cloudflare Pages** — Cloudflare builds and deploys directly from the GitHub repo on every push to `main` (build command `npm run build`, output dir `out`). There is **no deploy workflow in this repo** — deployment is configured in the Cloudflare dashboard, not GitHub Actions. CI is a parallel quality gate, not a deploy gate.
- **Post-deploy smoke — [.github/workflows/smoke.yml](.github/workflows/smoke.yml)** — daily cron (+ manual `workflow_dispatch`) curls the live `https://holland.vip`, asserting HTTP 200, expected content, and the security headers. This is the only check that exercises the _deployed_ site rather than the pre-deploy build. It reaches the site from a GitHub datacenter runner, which only works because Cloudflare **Bot Fight Mode is kept off** for the zone — free-plan Bot Fight Mode 403s datacenter IPs and cannot be skipped by any rule or header, so re-enabling it will break this check.
- **Data refresh — [.github/workflows/refresh.yml](.github/workflows/refresh.yml)** — weekly cron (Mondays 08:00 UTC, + manual `workflow_dispatch`) POSTs the Cloudflare Pages deploy hook (`CLOUDFLARE_DEPLOY_HOOK_URL` secret) to trigger a rebuild, refreshing the build-time GitHub repo/contribution data baked into `OpenSourceSection`. The run fails with an error if the secret is unset or the hook returns a non-2xx status.
- **Node version** — Node 26 is pinned in [.nvmrc](.nvmrc) and declared in `package.json` under `engines.node`. CI reads `.nvmrc` via `node-version-file`, and Cloudflare Pages reads it automatically. Keep both declarations aligned when changing the runtime.

## Architecture

### Static Export Configuration

- **Output mode**: `export` in [next.config.ts](next.config.ts)
- **Image optimization**: Disabled (`unoptimized: true`) for static hosting
- **No server-side features**: No API routes, no `getServerSideProps`, all content is static
- **Build target**: Static HTML/CSS/JS exported to `/out` directory
- **Static assets**: Images and other static files go in `/public` (referenced as `/filename` in code)
- **Security headers**: Delivered via [public/\_headers](public/_headers), served by Cloudflare Pages — this file is the **single source of truth**. `next.config.ts` intentionally has no `headers()` block (it is ignored by static export anyway). Note: the CSP keeps `'unsafe-inline'` in `script-src` on purpose (next-themes + Next inline scripts; no nonces on a static export) — see the comment in `_headers`.

### Theme System

The site uses a CSS variable-based theming system with `next-themes`:

**Key Files:**

- Theme provider: [components/theme-provider.tsx](components/theme-provider.tsx)
- Theme toggle: [components/mode-toggle.tsx](components/mode-toggle.tsx)
- CSS variables: [app/globals.css](app/globals.css)

**How it works:**

1. `ThemeProvider` wraps the app in [app/layout.tsx](app/layout.tsx) with `suppressHydrationWarning` on `<html>` tag
2. Theme state managed via `next-themes` with `attribute="class"` (adds/removes `.dark` class)
3. All colors defined as CSS custom properties in `:root` and `.dark` selectors
4. Utility classes reference variables: `text-heading`, `text-body`, `text-muted`, `card-bg-blue`

**Critical Pattern - Hydration Safety:**

The theme toggle requires a mount guard to prevent hydration mismatches. It uses `useSyncExternalStore` (not `useState` + `useEffect`) so the mounted flag has no state-update-in-effect: the store returns the server snapshot (`false`) during SSR + initial hydration, then `true` on the client.

```tsx
const emptySubscribe = () => () => {};

const mounted = React.useSyncExternalStore(
  emptySubscribe,
  () => true, // client snapshot
  () => false // server snapshot
);
if (!mounted) return <PlaceholderButton />; // Match server HTML
```

**Why**: `next-themes` reads `localStorage` client-side only. Any component using theme context must wait until mounted before rendering theme-dependent UI.

### CSS Variable System

The four accent colors (blue/green/purple/orange) are unified in a single token table, [lib/accent.ts](lib/accent.ts): `ACCENTS` / `type Accent`, `accent: Record<Accent, AccentTokens>` (`text`, `bullet`, `dot`, `ring`, `border`, `cardBg`, `badge`, `iconChip`), and `accentAt(index)` for lists with no inherent accent. Components should name an `Accent` and render it through [`<Badge accent>`](components/ui/badge.tsx) or [`<Card accent>`](components/ui/card.tsx) rather than hand-writing the pill/card class strings below — those two components are the supported way to render an accent-colored badge or card. The CSS classes in this section are what the table's `cardBg`/`badge` tokens resolve to and remain the source of truth for theming; read them directly only for tokens with no dedicated component (`text`, `dot`, `ring`, `bullet`).

**Text Hierarchy:**

- `--heading-text` / `.text-heading` - Main headings
- `--body-text` / `.text-body` - Body copy
- `--label-text` / `.text-label` - Labels/semibold text
- `--muted-text` / `.text-muted` - Secondary/muted text

There is deliberately no `.text-badge` or `.text-subheading` — both were byte-identical aliases of `.text-heading` and were removed in v1.1.27. Use `.text-heading` for a subheading, and the colored `.text-badge-*` utilities below for badge text.

**Colored Badge Text** (adapts for contrast):

- `--badge-blue-text` / `.text-badge-blue` - Blue badges (dark in light mode, light in dark mode)
- `--badge-green-text` / `.text-badge-green` - Green badges
- `--badge-purple-text` / `.text-badge-purple` - Purple badges
- `--badge-orange-text` / `.text-badge-orange` - Orange badges

**Card Backgrounds:**

- `--card-blue` / `.card-bg-blue` - Blue tinted cards
- `--card-green` / `.card-bg-green` - Green tinted cards
- `--card-purple` / `.card-bg-purple` - Purple tinted cards
- `--card-orange` / `.card-bg-orange` - Orange tinted cards
- `--card-white` / `.card-bg-white` - White/dark cards
- `--card-white-transparent` / `.card-bg-white-transparent` - Semi-transparent cards
- `--card-white-80` / `.card-bg-white-80` - 80%-opacity cards (the experience timeline)
- `--bento-gradient` / `.bento-card-bg` - Gradient fill for bento grid cards

**Section Backgrounds:**

- `.section-surface` - Standard section background (alternating; fills with `--muted`)
- `.section-surface-contrast` - Contrasting section background (fills with `--background`, used to visually alternate sections)

**Page Base** (applied to `body` in `app/globals.css`; no utility class of their own):

- `--background` - Page background, and the fill behind `.section-surface-contrast`
- `--foreground` - Default text color for the document
- `--muted` - Muted surface fill, used by `.section-surface`

**Special Backgrounds:**

- `--hero-background` / `.hero-section` - Gradient background for hero section
- `--bento-gradient` - Gradient for bento grid cards

**Decorative:**

- `.gradient-text` - Multi-color gradient text (blue to purple)
- `.gradient-text-blue` - Blue gradient text (used for the nav logo)
- `.glass` - Frosted glass effect with backdrop blur (used in navigation)

### Component Styling Pattern

**Always use the `cn()` utility from `@/lib/utils`:**

```tsx
import { cn } from "@/lib/utils";

// Good
<div className={cn("text-heading", isActive && "text-badge-blue")} />

// Bad - don't use raw string concatenation
<div className={`text-heading ${isActive ? "text-badge-blue" : ""}`} />
```

The `cn()` function merges `clsx` and `tailwind-merge` to properly handle conditional classes and Tailwind conflicts.

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root:

```typescript
import { cn } from "@/lib/utils";
import { Cta } from "@/components/ui/cta";
```

### Icon Libraries

- `lucide-react` — the single icon library for the site (Navigation, mode toggle,
  and the Projects bento grid). Import named icons directly, e.g.
  `import { Menu, X } from "lucide-react"`.

### Animation System

Custom animations defined in [app/globals.css](app/globals.css):

- `animate-fadeInUp` - 0.6s fade + translate up

Apply as Tailwind classes: `<div className="animate-fadeInUp">...</div>`

## Development Patterns

### Adding New Components

1. Create component in appropriate directory (`/components/ui/` for reusable primitives, `/components/sections/` for page sections)
2. Export from [components/sections/index.ts](components/sections/index.ts) if adding a new section
3. If the section has copy (headings, body text, list items, labels), add a typed module to [content/](content/) and import from it — don't write prose directly in the component's JSX or in a local const
4. Use `"use client"` directive if component needs client-side interactivity
5. Always use `cn()` from `@/lib/utils` for className composition
6. Use semantic color classes from CSS variables (never hardcode colors)
7. Add `transition-colors duration-300` for smooth theme transitions

### Styling Conventions

**DO:**

- Use utility classes: `text-heading`, `text-label`, `text-muted`, `card-bg-blue`
- Use `cn()` for conditional classes: `cn("base", condition && "extra")`
- Render page sections through [`<Section>`](components/ui/section.tsx) — it owns the `py-20` rhythm, the container, the `h2`, and the `.section-surface`/`.section-surface-contrast` alternation; a section takes `{ surface }: SectionSurfaceProps` and forwards it rather than picking its own surface
- Add theme transitions: `transition-colors duration-300`
- Name an `Accent` from [lib/accent.ts](lib/accent.ts) and render accent-colored badges/cards through [`<Badge accent>`](components/ui/badge.tsx) / [`<Card accent>`](components/ui/card.tsx)

**DON'T:**

- Don't use inline hex/rgb colors - all colors are CSS variables
- Don't concatenate className strings - use `cn()` helper
- Don't use `suppressHydrationWarning` except on `<html>` tag in layout
- Don't hand-write accent pill/card class strings (e.g. `bg-blue-100 dark:bg-blue-900/40 …`) — read them from the `accent` table via `<Badge>`/`<Card>` instead

### Content Structure

**Single-page application:** All content composed in [app/page.tsx](app/page.tsx)

**Content lives in [content/](content/), not in section components.** Ten typed modules hold what
the site _says_; section components import from them and render — they own no prose. The `@/*`
alias covers `content/`, so imports read `import { hero } from "@/content/hero"`.

| Module                                                   | Section(s)              | Exports                                                                                                                                                                                             |
| -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [content/hero.ts](content/hero.ts)                       | `HeroSection`           | `hero` (greeting, name, tagline, blurb, `ctas[{label,href}]`)                                                                                                                                       |
| [content/about.ts](content/about.ts)                     | `AboutSection`          | `bio` (biography paragraphs), `careerHighlights`, `technicalAchievements`, `exploringTags`, `exploringHeading`, `achievementsHeading`, plus `CareerHighlight`/`TechnicalAchievement`/`ExploringTag` |
| [content/skills.ts](content/skills.ts)                   | `SkillsSection`         | `skillCategories`, `SkillCategory`                                                                                                                                                                  |
| [content/capabilities.ts](content/capabilities.ts)       | `TechnicalCapabilities` | `capabilities`, `Capability`                                                                                                                                                                        |
| [content/problem-solving.ts](content/problem-solving.ts) | `ProblemSolving`        | `challenges`, `Challenge`, and `challengeRows` (the Challenge/Solution/Impact rows, each with icon + `bgColor`)                                                                                     |
| [content/experience.ts](content/experience.ts)           | `ExperienceSection`     | `experiences`, `Experience`                                                                                                                                                                         |
| [content/projects.ts](content/projects.ts)               | `ProjectsSection`       | `projects`, `Project`, `ProjectIcon`, `projectsSubtitle`, `confidentialLabel`                                                                                                                       |
| [content/education.ts](content/education.ts)             | `EducationSection`      | `education` (school, logoSrc, logoAlt, location, graduated, degrees, highlights), `Degree`, `Highlight`                                                                                             |
| [content/contact.ts](content/contact.ts)                 | `ContactSection`        | `contact` (subtitle, ctaLabel) — the email address itself stays in [lib/site-config.ts](lib/site-config.ts)                                                                                         |
| [content/open-source.ts](content/open-source.ts)         | `OpenSourceSection`     | `openSource` (subtitle) — the repo list itself is still fetched at build time by `lib/github.ts`                                                                                                    |

`ProjectsSection` is the one place content still needs a presentation-side lookup: content names an
icon with a `ProjectIcon` key (`"clipboard" | "file" | "signature" | "columns"`), and the section
maps that key to a Lucide component so no JSX lives in a content array; grid span is `"one" | "two"`,
mapped to `md:col-span-*`. Accent keys (`Accent` from [lib/accent.ts](lib/accent.ts)) are carried on
the content records themselves (e.g. `careerHighlights[].accent`), not looked up in the component.

A resume edit — new role, new bullet, new badge — is a one-file change in `content/`; it never
touches a section component.

Sections (in render order):

1. **Hero** — name, tagline, social links, CTA buttons (`HeroSection`)
2. **About** — bio summary (`AboutSection`)
3. **Skills** — tech stack badges (`SkillsSection`)
4. **Technical Capabilities** — architecture/perf/devops/data capabilities (`TechnicalCapabilities`)
5. **Problem-Solving Highlights** — challenge/solution/impact case studies (`ProblemSolving`)
6. **Experience** — timeline of past roles (`ExperienceSection`)
7. **Projects** — BentoGrid component (`ProjectsSection`)
8. **Open Source** — featured GitHub repos + contribution heatmap (`OpenSourceSection`, rendering `ContributionHeatmap`)
9. **Education** — NCSU degree info with logo (`EducationSection`)
10. **Contact** — email link (`ContactSection`)

Each section component lives in [components/sections/](components/sections/) and is re-exported from the index barrel. Every section except Hero renders through the shared [`<Section>`](components/ui/section.tsx) shell — `app/page.tsx` builds an ordered `bodySections` list (key + render function) and derives each section's surface from its position via `surfaceAt(index)`; a section never chooses `.section-surface` vs `.section-surface-contrast` itself, it just forwards the `surface` prop it's given. `OpenSourceSection`'s empty-repos check is applied in `app/page.tsx` before the list is built, so a section that doesn't render can't re-phase the alternation for the ones below it.

**Build-time GitHub data:** `app/page.tsx` fetches `getFeaturedRepos()` ([lib/github.ts](lib/github.ts)) and `getContributions()` ([lib/github-contributions.ts](lib/github-contributions.ts)) at build time for `OpenSourceSection`; the route is pinned `dynamic = "force-static"` so the contributions POST doesn't opt it out of static export. Both sit on [lib/github-fetch.ts](lib/github-fetch.ts), the shared build-time access policy: `githubFetch()` adds the `holland-vip-build` User-Agent and a bearer `Authorization` header when `GITHUB_TOKEN` is set, uses `cache: "force-cache"`, and throws on a non-OK response; `withFallback()` wraps that call and is what makes `getFeaturedRepos()`/`getContributions()` never throw — any failure is warned once and swallowed in favor of the committed snapshot, which `parseRepos()`/`parseCalendar()` (in the same files) validate before use — a malformed snapshot degrades to an empty list/calendar rather than throwing or rendering garbage. The GraphQL query + contribution-level map live in `lib/github-contributions-query.mjs` (plain `.mjs`, not `.ts`) so `scripts/seed-contributions.mjs` — which runs under bare `node` with no build step — can share it. The weekly [refresh.yml](.github/workflows/refresh.yml) workflow exists to keep this baked-in data fresh (see CI/CD).

**Navigation anchor IDs:** Anchor ids are typed in [components/ui/section.tsx](components/ui/section.tsx): `SECTION_IDS` is every anchorable id (`about`, `skills`, `experience`, `projects`, `open-source`, `education`, `contact`), and `NAV_SECTION_IDS` is the subset reachable from the nav — `education` is deliberately in `SECTION_IDS` but not `NAV_SECTION_IDS` (anchorable, not navigable). [components/Navigation.tsx](components/Navigation.tsx) derives its links by mapping `NAV_SECTION_IDS` through a `navLabels: Record<NavSectionId, string>`, so a label for a nonexistent id (or a missing label) is a type error. To add a new navigable section: add the id to `SECTION_IDS` (and `NAV_SECTION_IDS` if it belongs in the nav), then add its label to `navLabels`.

**Site metadata:** Update [app/layout.tsx](app/layout.tsx) `Metadata` export

**Contact info:** Email `jerry@holland.vip` lives in `siteConfig.email` in [lib/site-config.ts](lib/site-config.ts) (consumed by `HeroSection`/`Footer` for socials and by `ContactSection`'s `mailto:` link) and is tested in Playwright specs

**Social links:** GitHub (`https://github.com/jwh3times`) and LinkedIn (`https://www.linkedin.com/in/jerryhollandiii`) are defined in `socialLinks` in [lib/site-config.ts](lib/site-config.ts) and rendered by [components/sections/HeroSection.tsx](components/sections/HeroSection.tsx) and the footer

## Important Constraints

### Static Export Limitations

- **No server-side rendering**: Cannot use `getServerSideProps` or API routes
- **No image optimization**: Must use `unoptimized` prop on all `<Image>` components
- **No dynamic routes**: All routes must be known at build time
- **No runtime environment variables**: All config must be build-time

### Theme Toggle Requirements

Any component using `useTheme()` from `next-themes` must:

1. Check `mounted` state before rendering theme-dependent UI
2. Return fallback UI that matches server HTML during SSR
3. Only show actual theme UI after client-side hydration

Example from [components/mode-toggle.tsx](components/mode-toggle.tsx):

```tsx
const emptySubscribe = () => () => {};

const mounted = React.useSyncExternalStore(
  emptySubscribe,
  () => true,
  () => false
);
if (!mounted) {
  return (
    <button type="button" className={toggleBase} disabled tabIndex={-1} aria-hidden>
      <Sun className="h-5 w-5" />
    </button>
  );
}
```

### Code Quality

- Oxlint config ([.oxlintrc.json](.oxlintrc.json)) with native React Hooks and Next.js rules plus TypeScript 7-powered type-aware rules from `oxlint-tsgolint`; there are no ESLint dependencies or JavaScript-plugin bridges, and Prettier remains the standalone formatter
- Run `npm run format` before commits
- Maintain TypeScript strict mode compliance
- Unit-test coverage is gated at 95% in CI — new components generally need a test in `tests/unit/` (pure-JSX section/shell components are excluded from the gate and covered via seam tests instead; see Unit tests above)

## Agents & docs automation

The `docs-updater` subagent (`.claude/agents/docs-updater.md`) keeps CLAUDE.md, README.md, and
AGENTS.md in sync with the code. It is invoked by the [`/ship` skill](.agents/skills/ship/SKILL.md)
— scoped to the current branch's diff, not a full audit — when a branch is ready for a PR. There is
no longer a docs-freshness `Stop` hook; docs refresh only happens when `/ship` runs.

`/ship` also classifies the branch's SemVer impact, settles the major/minor release line, writes the
[CHANGELOG.md](CHANGELOG.md) entry for the exact version the merge will mint (computed by
[scripts/next-version.mjs](scripts/next-version.mjs)), formats authored files, regenerates and
verifies agent artifacts, runs lint and TypeScript checks, and opens or updates the PR.
`docs-updater` does **not** own `CHANGELOG.md` — `/ship` does.

### Agent artifact sync

Claude Code and OpenAI Codex CLI share the same skills and subagents but read them from different
paths and (for subagents) different formats. **Skills and subagents are authored in different
trees**, and [scripts/sync-agents.mjs](scripts/sync-agents.mjs) derives the other side of each:

| Authored source            | Generated artifact          | Transform                                 |
| -------------------------- | --------------------------- | ----------------------------------------- |
| `.agents/skills/<name>/**` | `.claude/skills/<name>/**`  | verbatim; banner added to `SKILL.md` only |
| `.claude/agents/<name>.md` | `.codex/agents/<name>.toml` | frontmatter → TOML                        |

**Skills are authored under `.agents/skills/`** — that is where the skill installer writes them (it
records provenance in [skills-lock.json](skills-lock.json)), so making it the source keeps installs
and updates a one-way operation. The **whole** skill directory is mirrored and drift-checked, not
just `SKILL.md`: references, `scripts/*.sh`, and `agents/openai.yaml` are covered too.

For subagents the direction is the opposite — `.claude/agents/<name>.md` is authored, and the TOML
derives `sandbox_mode` from the `tools:` list (`workspace-write` if it includes `Write`/`Edit`, else
`read-only`); `model` is omitted so Codex uses its default.

Edit **only** the authored side — never the generated `.claude/skills/`/`.codex/` files. Note that
only the mirrored `SKILL.md` files and the generated `.toml` carry a `GENERATED — do not edit`
banner; every other mirrored file (reference `.md`s, `scripts/*.sh`, `agents/openai.yaml`) is a
byte-identical copy with no in-file marker. **Absence of a banner does not mean a file is
authored** — its location in the tree is what decides, and an accidental edit under
`.claude/skills/` surfaces only as a `--check` failure. Regenerate with `npm run sync:agents`; verify with
`node scripts/sync-agents.mjs --check`. CI runs that same `--check` in the `build` job on every
push/PR (see below) and fails the build if committed artifacts are stale — this needs no secret and
runs on fork PRs too. On same-repo PRs the
[sync-agents.yml](.github/workflows/sync-agents.yml) workflow additionally regenerates and commits
any drift back to the branch once the `SYNC_PAT` repo secret is set; it is skipped for fork PRs
(their `GITHUB_TOKEN` can't push). `.prettierignore` excludes `.claude/skills/`/`.codex/` since the
generator, not Prettier, owns their formatting — Prettier formats the authored `.agents/skills/`
sources instead, so **run `npm run format` before `npm run sync:agents`**, or the mirror will be
regenerated from unformatted sources and drift again on the next format pass.

Do **not** replace the generated `.claude/skills/` tree with symlinks into `.agents/`: this repo is
developed on Windows with `core.symlinks=false`, so Git walks through them and commits duplicate file
content instead of links.

## Agent skills

### Workflow router

Use `/ask-matt` to choose among the installed engineering workflows. Most build flows end with
`/ship`, which refreshes docs, writes the required versioned changelog entry, verifies the fast CI
gates, pushes, and opens or updates the PR.

### Session close-out

`/end-session` (authored at `.agents/skills/end-session/SKILL.md`) ends a work session: it sorts
what the session produced into public guidance, the independent private repository under
`private/`, the matching GitHub Issue tracker, project memory, and local-workspace cleanup. It
checks both repositories and reports private work that is uncommitted or unpushed. User-invoked
only, and it never pushes — `/ship` still owns public shipping.

### Issue tracker

Public work lives in `jwh3times/holland-vip` Issues; confidential work lives in
`jwh3times/holland-vip-workspace` Issues. See `docs/agents/issue-tracker.md` for routing.

### Private workspace recovery

Maintainers clone `jwh3times/holland-vip-workspace` as the ignored, independent `private/`
repository. It is never a submodule or a public tracked path. `npm run bootstrap:private`
([scripts/bootstrap-private.mjs](scripts/bootstrap-private.mjs)) installs it — it reads the clone
locator from 1Password (`op://holland-vip/holland-vip-workspace/private_repo_url`), validates it
is a credential-free GitHub URL, and is a no-op when `private/.git` already exists — so run it in
every new git worktree, where the ignored `private/` is absent. Read
`docs/agents/workspace-bootstrap.md` when setting up a machine, restoring private context, or
checking whether a session is portable.

### Triage labels

The default five-role vocabulary is `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with one root `CONTEXT.md` and ADRs under `docs/adr/`. See
`docs/agents/domain.md`.
