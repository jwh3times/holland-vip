# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jerry Holland built with Next.js 16+ (App Router), React 19.2+, TypeScript 6+, and Tailwind CSS v4. The site is configured for **static export** (SSG) and is deployed to **GitHub Pages** via GitHub Actions (the static `/out` output is portable to any static host — Netlify, Cloudflare Pages, GoDaddy, etc.).

Tailwind v4 is loaded via `@import "tailwindcss"` in [app/globals.css](app/globals.css) and configured entirely in CSS (custom properties + utility classes) — there is **no `tailwind.config.ts`**.

## Common Commands

### Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build static site to /out directory
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
```

### Testing

Playwright is used for end-to-end testing. The dev server is started automatically — `playwright.config.ts` defines a `webServer` that runs `npm run dev` and waits on `localhost:3000` (`reuseExistingServer` is on locally, off in CI). You do **not** need to start a server manually.

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

Tests run across 5 projects (Desktop Chrome/Firefox/Safari + Mobile Chrome/Safari). **CI runs chromium only** (`npm run test:e2e -- --project=chromium`), so a test that passes locally on chromium may still surface browser-specific failures only when run across all projects.

Test files are in [tests/](tests/) covering homepage, accessibility, SEO, theme toggling, and mobile navigation.

### Testing Build Output

After `npm run build`, the `/out` directory contains the complete static site. There is no production preview server — `next start` does not serve the static export. Use a local HTTP server (e.g., `npx serve out`) to preview the built output.

## CI/CD

Two GitHub Actions workflows drive validation and deployment:

- **[.github/workflows/ci.yml](.github/workflows/ci.yml)** — runs on push/PR to `main`. The `build` job runs `npm run lint`, `npm run format:check`, then `npm run build`; the `test` job (needs `build`) installs chromium and runs Playwright against chromium only. **A PR will fail CI if formatting drifts — run `npm run format` before committing.**
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** — triggered automatically after the CI workflow completes successfully on `main` (or via manual `workflow_dispatch`). It rebuilds and publishes `/out` to GitHub Pages. Deployment is gated on CI success, so a failing lint/format/build/test blocks the release.

## Architecture

### Static Export Configuration

- **Output mode**: `export` in [next.config.ts](next.config.ts)
- **Image optimization**: Disabled (`unoptimized: true`) for static hosting
- **No server-side features**: No API routes, no `getServerSideProps`, all content is static
- **Build target**: Static HTML/CSS/JS exported to `/out` directory
- **Static assets**: Images and other static files go in `/public` (referenced as `/filename` in code)
- **Security headers**: The `headers()` block in [next.config.ts](next.config.ts) is **ignored by static export** (it only applies on a Node/Vercel/Netlify server). For static hosts, headers are delivered via `public/_headers` (Netlify/Cloudflare format). Edit both to keep them in sync.

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

The theme toggle requires a mount guard to prevent hydration mismatches:

```tsx
const [mounted, setMounted] = React.useState(false);
React.useEffect(() => setMounted(true), []);
if (!mounted) return <PlaceholderButton />; // Match server HTML
```

**Why**: `next-themes` reads `localStorage` client-side only. Any component using theme context must wait until mounted before rendering theme-dependent UI.

### CSS Variable System

**Text Hierarchy:**

- `--heading-text` / `.text-heading` - Main headings
- `--body-text` / `.text-body` - Body copy
- `--label-text` / `.text-label` - Labels/semibold text
- `--muted-text` / `.text-muted` - Secondary/muted text
- `--badge-text` / `.text-badge` - Badge/pill text
- `--subheading-text` / `.text-subheading` - Subheadings (between heading and body)

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

**Section Backgrounds:**

- `.section-surface` - Standard section background (alternating)
- `.section-surface-contrast` - Contrasting section background (used to visually alternate sections)

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
import { Button } from "@/components/ui/button";
```

### Icon Libraries

Two icon libraries are available:

- `lucide-react` — used in Navigation (Menu, X icons) and general UI
- `@tabler/icons-react` — available for additional icon options

### Animation System

Custom animations defined in [app/globals.css](app/globals.css):

- `animate-fadeInUp` - 0.6s fade + translate up
- `animate-fadeIn` - 0.8s opacity fade
- `animate-slideInLeft` - 0.6s slide from left
- `animate-slideInRight` - 0.6s slide from right
- `animate-scaleIn` - 0.5s scale + opacity

Apply as Tailwind classes: `<div className="animate-fadeInUp">...</div>`

## Development Patterns

### Adding New Components

1. Create component in appropriate directory (`/components/ui/` for reusable primitives, `/components/sections/` for page sections)
2. Export from [components/sections/index.ts](components/sections/index.ts) if adding a new section
3. Use `"use client"` directive if component needs client-side interactivity
4. Always use `cn()` from `@/lib/utils` for className composition
5. Use semantic color classes from CSS variables (never hardcode colors)
6. Add `transition-colors duration-300` for smooth theme transitions

### Styling Conventions

**DO:**

- Use utility classes: `text-heading`, `text-label`, `text-muted`, `card-bg-blue`
- Use `cn()` for conditional classes: `cn("base", condition && "extra")`
- Alternate sections using `.section-surface` and `.section-surface-contrast`
- Add theme transitions: `transition-colors duration-300`

**DON'T:**

- Don't use inline hex/rgb colors - all colors are CSS variables
- Don't concatenate className strings - use `cn()` helper
- Don't use `suppressHydrationWarning` except on `<html>` tag in layout

### Content Structure

**Single-page application:** All content in [app/page.tsx](app/page.tsx)

Sections (in render order):

1. **Hero** — name, tagline, social links, CTA buttons (`HeroSection`)
2. **About** — bio summary (`AboutSection`)
3. **Skills** — tech stack badges (`SkillsSection`)
4. **Technical Capabilities** — architecture/perf/devops/data capabilities (`TechnicalCapabilities`)
5. **Problem-Solving Highlights** — challenge/solution/impact case studies (`ProblemSolving`)
6. **Experience** — timeline of past roles (`ExperienceSection`)
7. **Projects** — BentoGrid component (`ProjectsSection`)
8. **Education** — NCSU degree info with logo (`EducationSection`)
9. **Contact** — email link (`ContactSection`)

Each section component lives in [components/sections/](components/sections/) and is re-exported from the index barrel.

**Navigation anchor IDs:** Sections use `id` attributes that match the nav links: `#about`, `#skills`, `#experience`, `#projects`, `#contact`. When adding a new navigable section, add it to the `navLinks` array in [components/Navigation.tsx](components/Navigation.tsx).

**Site metadata:** Update [app/layout.tsx](app/layout.tsx) `Metadata` export

**Contact info:** Email `jerry@holland.vip` is hardcoded in [app/page.tsx](app/page.tsx) and tested in Playwright specs

**Social links:** GitHub (`https://github.com/jwh3times`) and LinkedIn (`https://www.linkedin.com/in/jerryhollandiii`) in [components/sections/HeroSection.tsx](components/sections/HeroSection.tsx) and footer

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
const [mounted, setMounted] = React.useState(false);
React.useEffect(() => setMounted(true), []);
if (!mounted)
  return (
    <Button variant="ghost" size="icon">
      ...
    </Button>
  );
```

### Code Quality

- ESLint configured with Next.js and Prettier rules
- Run `npm run format` before commits
- Maintain TypeScript strict mode compliance
