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

Coverage uses V8 and is gated at 95% for statements, branches, functions, and
lines in `vitest.config.ts`. `components/sections/**` and the pure-JSX
`components/ui/{section,card,badge,bento-grid}.tsx` shells are excluded from
that gate — a component whose body is a single JSX expression reports 100%
coverage as soon as anything renders it, so line coverage says nothing useful
about them. Their behavior is asserted through seam tests instead
(`section.test.tsx`, `sections.test.tsx`, `accent.test.tsx`).

```bash
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage
```

### End-to-End Tests

Playwright tests live in `tests/`. They cover the homepage, accessibility, SEO,
theme toggling, mobile navigation, and the 404 page.

The Playwright config starts a server automatically and waits for
`localhost:3000`. The default local target runs `npm run dev`; CI and local runs
with `E2E_TARGET=build` run `npx serve out --listen 3000 --no-clipboard` against
the static export. CI downloads the build job's `out/` artifact before running
the Chromium-engine projects, so CI never exercises the dev server. To reproduce
that path locally, run `npm run build`, set `E2E_TARGET=build` in your shell, and
run Playwright. Do not start a server manually before the standard Playwright
commands unless you specifically need to inspect the app.

`reuseExistingServer` is on locally, and it accepts whatever already holds port
3000 — the Next.js default, so another project's dev server can claim it.
`tests/global-setup.ts` probes `baseURL` before the suite and aborts if the
server answering is not this site, checked against `siteConfig.url` and
`siteConfig.name`. Nothing listening is fine; only a foreign server is rejected.
If you see that error, stop whatever holds the port rather than editing the
check.

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

Select elements by role, test id (`data-testid`), or ARIA attribute, not by
Tailwind utility classes — a class-name selector still matches once the class
list is reordered or renamed even if the styling it implies no longer holds.

### Previewing Build Output

After `npm run build`, preview the static export with:

```bash
npm run preview
```

`next start` is not appropriate for this project because the production output is
a static export.

## CI/CD

- `.github/workflows/ci.yml` runs on push and PR to `main`.
- The CI build job runs `npm run lint`, `npm run format:check`,
  `node scripts/sync-agents.mjs --check`, and `npm run build`.
- The unit job runs `npm run test:unit:coverage` and fails if coverage drops
  below the 95% thresholds, excluding `components/sections/**` and the
  pure-JSX `ui/{section,card,badge,bento-grid}` shells, which are covered
  through seam tests instead.
- The Playwright job downloads the build job's `out/` artifact and runs the
  Chromium-engine projects against that static export only.
- The changelog job (PR-only, skipped for Dependabot) fails the PR if the top
  `## [x.y.z]` version in `CHANGELOG.md` doesn't match the version that merging
  the PR will actually mint. Run `/ship` to classify the branch as major, minor,
  or build-only, settle the `package.json` release line, and write that entry; it
  computes the exact version with `scripts/next-version.mjs` rather than guessing.
- `.github/workflows/sync-agents.yml` runs on same-repo pull requests. It
  regenerates the agent artifacts from their authored sources and auto-commits
  any drift back to the branch. It needs the `SYNC_PAT` repo secret and is
  skipped for fork PRs and when the secret is unset — see "Keeping agent
  artifacts in sync" below for the artifact mapping and the secret-free
  `--check` gate that also runs in the build job.
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

The four accent colors (blue/green/purple/orange) are unified in one token table,
`lib/accent.ts`: `ACCENTS` / `type Accent`, `accent: Record<Accent, AccentTokens>`
(`text`, `bullet`, `dot`, `ring`, `border`, `cardBg`, `badge`, `iconChip`), and
`accentAt(index)` for lists with no inherent accent. Name an `Accent` and render
it through `<Badge accent>` (`components/ui/badge.tsx`) or `<Card accent>`
(`components/ui/card.tsx`) instead of hand-writing the pill/card class strings
below — those are the supported components for an accent-colored badge or card.
The utilities below are what the table's `cardBg`/`badge` tokens resolve to and
remain the source of truth for theming; read them directly only for tokens with
no dedicated component (`text`, `dot`, `ring`, `bullet`).

Text hierarchy:

- `--heading-text` / `.text-heading`
- `--body-text` / `.text-body`
- `--label-text` / `.text-label`
- `--muted-text` / `.text-muted`

There is no `.text-badge` or `.text-subheading`; both were byte-identical aliases
of `.text-heading` and were removed in v1.1.27. Use `.text-heading` for a
subheading and the colored `.text-badge-*` utilities below for badge text.

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
- `--card-white-80` / `.card-bg-white-80`
- `--bento-gradient` / `.bento-card-bg`

Section backgrounds:

- `.section-surface`
- `.section-surface-contrast`

Page base variables, applied to `body` with no utility class of their own:

- `--background` — page background and `.section-surface-contrast` fill
- `--foreground` — default document text color
- `--muted` — muted fill used by `.section-surface`

Special styling:

- `--hero-background` / `.hero-section`
- `--bento-gradient`
- `.gradient-text`
- `.gradient-text-blue`
- `.glass`

Animations are defined in `app/globals.css` and used as utility classes:

- `animate-fadeInUp`

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
import { Cta } from "@/components/ui/cta";
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
4. If the section has copy (headings, body text, list items, labels), add a typed module under
   `content/` and import from it rather than writing prose in the component. See "Content
   Structure" below.
5. Add `"use client"` only when client-side interactivity is required.
6. Use `cn()` for class composition.
7. Use semantic color utilities backed by CSS variables.
8. Add `transition-colors duration-300` where theme color changes should animate.
9. Add focused tests when behavior, rendering, or accessibility changes.

### Styling

Do:

- Use semantic utilities such as `text-heading`, `text-label`, `text-muted`, and
  `card-bg-blue`.
- Render page sections through `<Section>` (`components/ui/section.tsx`). It owns
  the vertical rhythm, the container, the `h2`, and the `.section-surface` /
  `.section-surface-contrast` alternation. A section takes a `{ surface }:
SectionSurfaceProps` prop and forwards it — it never decides its own surface.
- Use theme transitions where color changes across light and dark modes.
- Name an `Accent` from `lib/accent.ts` and render accent-colored badges/cards
  through `<Badge accent>` / `<Card accent>`.

Do not:

- Hardcode inline hex or RGB colors.
- Add a Tailwind config file.
- Concatenate `className` strings manually.
- Use `suppressHydrationWarning` outside the root `<html>` element.
- Hand-write accent pill/card class strings (e.g.
  `bg-blue-100 dark:bg-blue-900/40 …`) — read them from the `accent` table via
  `<Badge>`/`<Card>` instead.

## Content Structure

This is a single-page application. Main page composition lives in `app/page.tsx`.

Site copy lives in `content/`, not in the section components. Ten typed modules hold what the
site says; section components import from them and render — they own no prose. The `@/*` alias
covers `content/`, so imports read `import { hero } from "@/content/hero"`.

- `content/hero.ts` — `hero` (greeting, name, tagline, blurb, `ctas`) for `HeroSection`.
- `content/about.ts` — `bio`, `careerHighlights`, `technicalAchievements`, `exploringTags`, plus
  their headings, for `AboutSection`.
- `content/skills.ts` — `skillCategories` for `SkillsSection`.
- `content/capabilities.ts` — `capabilities` for `TechnicalCapabilities`.
- `content/problem-solving.ts` — `challenges` and `challengeRows` (the Challenge/Solution/Impact
  row labels, icon, and `bgColor`) for `ProblemSolving`.
- `content/experience.ts` — `experiences` for `ExperienceSection`.
- `content/projects.ts` — `projects`, `ProjectIcon`, `projectsSubtitle`, `confidentialLabel` for
  `ProjectsSection`.
- `content/education.ts` — `education` for `EducationSection`.
- `content/contact.ts` — `contact` (subtitle, ctaLabel) for `ContactSection`; the email address
  itself stays in `lib/site-config.ts`.
- `content/open-source.ts` — `openSource` (subtitle) for `OpenSourceSection`; the repo list is
  still fetched at build time by `lib/github.ts`.

`ProjectsSection` is the one place a content record still needs a presentation-side lookup:
content names an icon with a `ProjectIcon` key (`"clipboard" | "file" | "signature" |
"columns"`), and the section maps that key to a Lucide component, so no JSX lives in a content
array. Grid span is `"one" | "two"`, mapped to `md:col-span-*`. Accent keys (`Accent` from
`lib/accent.ts`) are unchanged from before this split — content records carry `accent: Accent`
directly.

A resume edit (new role, new bullet, new badge) is a one-file change in `content/` and never
touches a section component.

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
section index barrel. Every section except Hero renders through the shared
`<Section>` shell. `app/page.tsx` builds an ordered `bodySections` list (key +
render function) and derives each section's surface from its position with
`surfaceAt(index)` — a section never picks `.section-surface` vs
`.section-surface-contrast` for itself. `OpenSourceSection`'s empty-repos check
runs in `app/page.tsx` before that list is built, so a section that doesn't
render can't shift the alternation for the sections after it.

Anchor ids are typed in `components/ui/section.tsx`: `SECTION_IDS` is every
anchorable id (`about`, `skills`, `experience`, `projects`, `open-source`,
`education`, `contact`), and `NAV_SECTION_IDS` is the subset reachable from the
nav — `education` is intentionally anchorable but not navigable, so it is in
`SECTION_IDS` but not `NAV_SECTION_IDS`. `components/Navigation.tsx` derives its
links by mapping `NAV_SECTION_IDS` through a `navLabels: Record<NavSectionId,
string>`, so a label for an id that doesn't exist (or a missing label) fails to
compile. To add a navigable section: add the id to `SECTION_IDS` (and
`NAV_SECTION_IDS` if it should appear in the nav), then add its label to
`navLabels`.

Site metadata lives in the `Metadata` export in `app/layout.tsx`.

The contact email `jerry@holland.vip` lives in `siteConfig.email` in
`lib/site-config.ts` (used by `HeroSection`/`Footer` for socials and by
`ContactSection`'s `mailto:` link) and is covered by Playwright tests.

Social links are defined in `socialLinks` in `lib/site-config.ts` and rendered by
`components/sections/HeroSection.tsx` and the footer:

- GitHub: `https://github.com/jwh3times`
- LinkedIn: `https://www.linkedin.com/in/jerryhollandiii`

## Build-Time GitHub Data

`app/page.tsx` fetches GitHub data at build time:

- `getFeaturedRepos()` from `lib/github.ts`
- `getContributions()` from `lib/github-contributions.ts`

The route is pinned with `dynamic = "force-static"` so the contribution POST does
not opt the page out of static export.

Both functions sit on `lib/github-fetch.ts`, the shared build-time access
policy: `githubFetch()` adds the `holland-vip-build` User-Agent and a bearer
`Authorization` header when `GITHUB_TOKEN` is set, uses `cache: "force-cache"`,
and throws on a non-OK response; `withFallback()` wraps that call, warns once,
and returns a committed snapshot on any failure — this is what keeps
`getFeaturedRepos()`/`getContributions()` non-throwing. The shared GraphQL
query and contribution-level map live in `lib/github-contributions-query.mjs`
(plain `.mjs`) so `scripts/seed-contributions.mjs`, which runs under bare
`node` with no build step, can import it too.

These calls never throw during builds. They degrade to the committed fallback
JSON in `lib/`, validated by `parseRepos()` (`lib/github.ts`) and
`parseCalendar()` (`lib/github-contributions.ts`) rather than cast — a
malformed snapshot degrades further, to an empty list/calendar, instead of
throwing or rendering garbage. The weekly refresh workflow triggers a rebuild
so this static data stays current.

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
- Maintain the 95% unit coverage gate (pure-JSX section/shell components are
  excluded from it and covered through seam tests instead).

## Documentation

Keep `AGENTS.md`, `CLAUDE.md`, and `README.md` consistent when making changes
that affect architecture, commands, deployment, testing, or project conventions.

The existing Claude docs automation lives under `.claude/`. The `/ship` skill
(`.agents/skills/ship/SKILL.md`) refreshes `CLAUDE.md` and `README.md` when a
branch is ready for a PR, by invoking the `docs-updater` subagent scoped to the
branch's diff. It runs once per ship, not on every stop — there is no longer a
docs-freshness stop hook. `/ship` also classifies the branch's SemVer impact and
writes the `CHANGELOG.md` entry for the version the merge will mint. `docs-updater`
maintains this file too, but only when `/ship` runs — so if you are changing
agent-facing guidance outside that flow, update `AGENTS.md` explicitly rather
than assuming it will be caught.

## Keeping agent artifacts in sync

Skills and subagents are authored in **different** trees, and each generates its counterpart:

- **Skills** are authored in `.agents/skills/<name>/**` (where the skill installer writes them; see
  `skills-lock.json`). `.claude/skills/<name>/**` is the **generated** mirror Claude Code reads —
  the entire directory, not just `SKILL.md`, so references, `scripts/*.sh`, and `agents/*.yaml` are
  drift-checked too.
- **Subagents** are authored in `.claude/agents/<name>.md`. `.codex/agents/<name>.toml` is the
  **generated** artifact Codex reads.

Do not edit generated files by hand. Only mirrored `SKILL.md` files and generated `.toml` files
carry a `GENERATED — do not edit` banner; other mirrored references, scripts, and assets are
byte-identical copies with no in-file warning. The tree location, not a banner, identifies the
authored side. Edit the authored side, then run `npm run sync:agents` to regenerate.
`node scripts/sync-agents.mjs --check` verifies the artifacts match their sources without writing;
CI runs this check on every push/PR (including fork PRs, since it needs no secret) and fails the
build if the artifacts are stale. On same-repo pull requests only, a separate workflow additionally
regenerates and commits any drift automatically once the `SYNC_PAT` secret is set; it is skipped for
fork PRs, which get a read-only token.

`.prettierignore` excludes `.claude/skills/` and `.codex/` — the generator, not Prettier, owns their
formatting. Prettier does format the authored `.agents/skills/` sources, so run `npm run format`
**before** `npm run sync:agents`; regenerating first just mirrors unformatted content and drifts
again on the next format pass.

Never swap the generated `.claude/skills/` tree for symlinks into `.agents/`. This repo is developed
on Windows with `core.symlinks=false`, so Git follows them and commits duplicated file content
rather than links, and `listDirs()` in `scripts/lib/agent-sync.mjs` skips symlinked entries — which
would make every mirrored file look extraneous and get pruned.

## Agent skills

### Workflow router

Use `/ask-matt` to choose among the installed engineering workflows. Most build flows end with
`/ship`, which refreshes docs, writes the required versioned changelog entry, verifies the fast CI
gates, pushes, and opens or updates the PR.

### Issue tracker

Issues live in GitHub Issues for jwh3times/holland-vip, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one CONTEXT.md + docs/adr/ at the repo root. See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
