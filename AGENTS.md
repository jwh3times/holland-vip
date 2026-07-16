# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is Jerry Holland's personal portfolio site. It uses Next.js 16+ with the App
Router, React 19.2+, TypeScript 6+, and Tailwind CSS v4.

The site is configured for static export and deploys to Cloudflare Pages at
`holland.vip`. Cloudflare Pages builds directly from the repository on pushes to
`main`. The generated `out/` directory is portable to any static host.

Tailwind v4 is loaded with `@import "tailwindcss"` in `app/globals.css` and is
configured in CSS with custom properties and utility classes. There is no
`tailwind.config.ts`.

## Common Commands

### Development

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
```

`npm run build` creates the static export in `out/`.

### Unit Tests

Unit and component tests use Vitest, Testing Library, and jsdom. Tests live in
`tests/unit/` as `*.test.tsx`. `next/image` and `next/link` are stubbed through
`tests/unit/mocks/*`. CSS is not processed in unit tests.

Coverage uses V8 and is gated at 80% for statements, branches, functions, and
lines in `vitest.config.ts`.

```bash
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
```

### End-to-End Tests

Playwright tests live in `tests/`. They cover the homepage, accessibility, SEO,
theme toggling, and mobile navigation.

The Playwright config starts the dev server automatically with `npm run dev` and
waits for `localhost:3000`. Do not start a server manually before running the
standard Playwright commands unless you specifically need to inspect the app.

```bash
npm test
npm run test:ui
npm run test:headed
npm run test:debug

npx playwright test tests/homepage.spec.ts
npx playwright test -g "theme toggle"
npx playwright test --project=chromium
```

Local Playwright runs cover five projects: Desktop Chrome, Firefox, Safari,
Mobile Chrome, and Mobile Safari. CI runs only the Chromium-engine projects:
`chromium` and `Mobile Chrome`.

### Previewing Build Output

After `npm run build`, preview the static export with:

```bash
npm run preview
```

`next start` is not appropriate for this project because the production output is
a static export.

## CI/CD

- `.github/workflows/ci.yml` runs on push and PR to `main`.
- The CI build job runs `npm run lint`, `npm run format:check`, and
  `npm run build`.
- The unit job runs `npm run test:unit:coverage` and fails if coverage drops
  below the 80% thresholds.
- The Playwright job runs the Chromium-engine projects only.
- The changelog job (PR-only, skipped for Dependabot) fails the PR if the top
  `## [x.y.z]` version in `CHANGELOG.md` doesn't match the version that merging
  the PR will actually mint. Run `/ship` to write that entry; it computes the
  version with `scripts/next-version.mjs` rather than guessing.
- `.github/workflows/dependency-review.yml` fails PRs with high-severity
  dependency vulnerabilities.
- CodeQL default setup is enabled in GitHub repository settings. There is
  intentionally no `codeql.yml`.
- `.github/workflows/version.yml` creates a standard SemVer tag and GitHub
  Release on every merge to `main` in `v<major>.<minor>.<build>` format, for
  example `v1.0.3`. The build number auto-increments within the matching
  major/minor line, and `x.y.0` is preserved for a new major/minor line with no
  existing tags. The version is computed by `scripts/next-version.mjs`, the
  single source of truth shared with the CI changelog guard and `/ship`.
- Cloudflare Pages handles deployment directly from the GitHub repository. There
  is no deploy workflow in this repo.
- `.github/workflows/smoke.yml` runs daily and manually against
  `https://holland.vip`. It depends on Cloudflare Bot Fight Mode staying off for
  the zone.
- `.github/workflows/refresh.yml` runs weekly and manually to trigger the
  Cloudflare Pages deploy hook so build-time GitHub contribution data stays
  fresh.
- Node is pinned in `.nvmrc`. CI and Cloudflare Pages both use that file.

Run `npm run format` before committing because CI fails on formatting drift.

## Architecture

### Static Export

- `next.config.ts` sets `output: "export"`.
- Next image optimization is disabled with `images.unoptimized: true`.
- Do not add API routes, server-only behavior, or server-side rendering.
- All content must be compatible with static generation.
- Runtime environment variables are not available; configuration must be known at
  build time.
- Static assets belong in `public/` and are referenced from code with root paths
  like `/image.png`.
- Security headers are defined in `public/_headers`. This is the source of truth
  for Cloudflare Pages.
- Do not add a `headers()` block to `next.config.ts`; it is ignored for static
  export.

The CSP in `public/_headers` intentionally keeps `'unsafe-inline'` in
`script-src` because `next-themes` and Next inline scripts need it in this static
export setup.

### Theme System

The app uses `next-themes` with CSS variables.

Key files:

- `components/theme-provider.tsx`
- `components/mode-toggle.tsx`
- `app/globals.css`
- `app/layout.tsx`

The `ThemeProvider` wraps the app in `app/layout.tsx`. The `<html>` element has
`suppressHydrationWarning`. Theme state uses `attribute="class"`, so dark mode is
applied through the `.dark` class.

All colors are CSS custom properties in `:root` and `.dark`. Utility classes in
`app/globals.css` reference those variables.

Components that read theme state must avoid hydration mismatches. Use the
existing `useSyncExternalStore` mount guard pattern from
`components/mode-toggle.tsx`:

```tsx
const emptySubscribe = () => () => {};

const mounted = React.useSyncExternalStore(
  emptySubscribe,
  () => true,
  () => false
);

if (!mounted) return <PlaceholderButton />;
```

Do not render theme-dependent UI until the component is mounted.

### CSS Variables And Utilities

Text hierarchy:

- `--heading-text` / `.text-heading`
- `--body-text` / `.text-body`
- `--label-text` / `.text-label`
- `--muted-text` / `.text-muted`
- `--badge-text` / `.text-badge`
- `--subheading-text` / `.text-subheading`

Badge text utilities:

- `--badge-blue-text` / `.text-badge-blue`
- `--badge-green-text` / `.text-badge-green`
- `--badge-purple-text` / `.text-badge-purple`
- `--badge-orange-text` / `.text-badge-orange`

Card backgrounds:

- `--card-blue` / `.card-bg-blue`
- `--card-green` / `.card-bg-green`
- `--card-purple` / `.card-bg-purple`
- `--card-orange` / `.card-bg-orange`
- `--card-white` / `.card-bg-white`
- `--card-white-transparent` / `.card-bg-white-transparent`

Section backgrounds:

- `.section-surface`
- `.section-surface-contrast`

Special styling:

- `--hero-background` / `.hero-section`
- `--bento-gradient`
- `.gradient-text`
- `.gradient-text-blue`
- `.glass`

Animations are defined in `app/globals.css` and used as utility classes:

- `animate-fadeInUp`
- `animate-fadeIn`
- `animate-slideInLeft`
- `animate-slideInRight`
- `animate-scaleIn`

## Code Patterns

### Class Names

Always use `cn()` from `@/lib/utils` for class composition.

```tsx
import { cn } from "@/lib/utils";

<div className={cn("text-heading", isActive && "text-badge-blue")} />;
```

Do not use raw string concatenation for conditional class names.

### Imports

Use the `@/*` TypeScript path alias.

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### Icons

Use `lucide-react` as the only icon library. Import named icons directly:

```tsx
import { Menu, X } from "lucide-react";
```

### Components

When adding a component:

1. Put reusable primitives in `components/ui/`.
2. Put page sections in `components/sections/`.
3. Export new sections from `components/sections/index.ts`.
4. Add `"use client"` only when client-side interactivity is required.
5. Use `cn()` for class composition.
6. Use semantic color utilities backed by CSS variables.
7. Add `transition-colors duration-300` where theme color changes should animate.
8. Add focused tests when behavior, rendering, or accessibility changes.

### Styling

Do:

- Use semantic utilities such as `text-heading`, `text-label`, `text-muted`, and
  `card-bg-blue`.
- Use `.section-surface` and `.section-surface-contrast` to alternate sections.
- Use theme transitions where color changes across light and dark modes.

Do not:

- Hardcode inline hex or RGB colors.
- Add a Tailwind config file.
- Concatenate `className` strings manually.
- Use `suppressHydrationWarning` outside the root `<html>` element.

## Content Structure

This is a single-page application. Main page composition lives in `app/page.tsx`.

Sections render in this order:

1. Hero (`HeroSection`)
2. About (`AboutSection`)
3. Skills (`SkillsSection`)
4. Technical Capabilities (`TechnicalCapabilities`)
5. Problem-Solving Highlights (`ProblemSolving`)
6. Experience (`ExperienceSection`)
7. Projects (`ProjectsSection`)
8. Open Source (`OpenSourceSection`, `ContributionHeatmap`)
9. Education (`EducationSection`)
10. Contact (`ContactSection`)

Section components live in `components/sections/` and are re-exported from the
section index barrel.

Navigation anchor IDs must match links in `components/Navigation.tsx`:

- `#about`
- `#skills`
- `#experience`
- `#projects`
- `#open-source`
- `#contact`

When adding a navigable section, update the `navLinks` array in
`components/Navigation.tsx`.

Site metadata lives in the `Metadata` export in `app/layout.tsx`.

The contact email `jerry@holland.vip` is hardcoded in `app/page.tsx` and covered
by Playwright tests.

Social links are in `components/sections/HeroSection.tsx` and the footer:

- GitHub: `https://github.com/jwh3times`
- LinkedIn: `https://www.linkedin.com/in/jerryhollandiii`

## Build-Time GitHub Data

`app/page.tsx` fetches GitHub data at build time:

- `getFeaturedRepos()` from `lib/github.ts`
- `getContributions()` from `lib/github-contributions.ts`

The route is pinned with `dynamic = "force-static"` so the contribution POST does
not opt the page out of static export.

These calls should not throw during builds. They degrade to empty data. The
weekly refresh workflow triggers a rebuild so this static data stays current.

## Important Constraints

- Preserve static export compatibility.
- Do not introduce server-only Next.js features.
- Do not add API routes.
- Do not depend on runtime environment variables.
- Keep all routes statically known.
- Use unoptimized images for static hosting.
- Keep security headers in `public/_headers`.
- Keep CodeQL managed by default setup in GitHub settings, not a workflow file.
- Maintain strict TypeScript compliance.
- Maintain the 80% unit coverage gate.

## Documentation

Keep `AGENTS.md`, `CLAUDE.md`, and `README.md` consistent when making changes
that affect architecture, commands, deployment, testing, or project conventions.

The existing Claude docs automation lives under `.claude/`. The `/ship` skill
(`.claude/skills/ship/SKILL.md`) refreshes `CLAUDE.md` and `README.md` when a
branch is ready for a PR, by invoking the `docs-updater` subagent scoped to the
branch's diff. It runs once per ship, not on every stop — there is no longer a
docs-freshness stop hook. `/ship` also writes the `CHANGELOG.md` entry for the
version the merge will mint. `docs-updater` maintains this file too, but only
when `/ship` runs — so if you are changing agent-facing guidance outside that
flow, update `AGENTS.md` explicitly rather than assuming it will be caught.
