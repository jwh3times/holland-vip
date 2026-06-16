# Holland.VIP Personal Website Project

## Project Overview

Personal portfolio website built with **Next.js 16.2+ (App Router)**, **React 19.2+**, **TypeScript 6.0+**, and **Tailwind CSS v4**. Configured for **static export** (SSG) and deployed to **Cloudflare Pages** (custom domain `holland.vip`). The `/out` static output is portable to any static host.

**Purpose**: Professional portfolio showcasing 12+ years of software engineering experience.

## Architecture & Core Patterns

### Static Export Configuration

- **Output mode**: `export` configured in `next.config.ts`
- **Image optimization**: Disabled (`unoptimized: true`) for static hosting compatibility
- **Build output**: Generated to `/out` directory via `npm run build`
- **No server-side APIs**: All content is client-side or statically generated

### Theme System Architecture

Custom CSS variable-based theming using `next-themes`:

- Theme provider wraps entire app in `app/layout.tsx` with `suppressHydrationWarning`
- Dark/light/system modes managed via `ThemeProvider` with `attribute="class"`
- CSS custom properties defined in `app/globals.css` at `:root` and `.dark`
- Text hierarchy: `--heading-text`, `--body-text`, `--label-text`, `--muted-text`, `--badge-text`
- Colored badges with mode-aware contrast: `--badge-blue-text`, `--badge-green-text`, etc.
- Card backgrounds: `--card-blue`, `--card-green`, `--card-white-transparent`, etc.

**Pattern**: Theme toggle (`components/mode-toggle.tsx`) requires client-side mounting guard to prevent hydration mismatch. Always check `mounted` state before rendering theme-dependent content.

### Component Organization

- **UI Primitives**: `/components/ui/` - Reusable components (buttons, bento-grid)
- **Feature Components**: `/components/` - Theme providers, mode toggle
- **Utility Layer**: `/lib/utils.ts` - Contains `cn()` helper (clsx + tailwind-merge)
- **Styling Convention**: Use utility classes via `cn()` for dynamic class merging, never raw string concatenation

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root:

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

## Key Development Workflows

### Local Development

```bash
npm run dev          # Start dev server on localhost:3000
npm run lint         # ESLint check (Next.js + Prettier rules)
npm run format       # Auto-format with Prettier
npm run format:check # Verify formatting without changes
```

### Production Build

```bash
npm run build        # Generate static files to /out directory
```

**Important**: Build creates fully static site (no Node.js runtime required). `next start` does not serve the export — preview with `npx serve out`.

### Testing

```bash
npm run test:unit:coverage  # Vitest + Testing Library unit tests (V8 coverage, 80% gate)
npm run test                # Playwright E2E (auto-starts the dev server)
```

Unit tests live in `tests/unit/` (jsdom; `next/image`/`next/link` stubbed); E2E specs are `tests/*.spec.ts`. CI runs lint, format check, unit coverage, and chromium-only E2E.

### Adding New Components

1. Create component in appropriate directory (`/components/ui/` for primitives)
2. Use `"use client"` directive if component needs client-side interactivity (hooks, event handlers)
3. Always use `cn()` from `@/lib/utils` for className composition
4. Apply semantic color classes from CSS variables (e.g., `text-heading`, `text-muted`, `card-bg-blue`)

### Styling Conventions

**Do**:

- Use predefined color utility classes: `text-heading`, `text-label`, `text-muted`, `card-bg-white`
- Use `cn()` for conditional/merged classes: `cn("base-class", condition && "conditional-class")`
- Reference design tokens via utility classes, not raw HSL values

**Don't**:

- Don't use inline hex/rgb colors - all colors defined in `globals.css` CSS variables
- Don't use raw `className` strings for multiple classes - use `cn()` helper
- Don't use `suppressHydrationWarning` outside of `<html>` tag in layout

### Animation System

Custom animations defined in `globals.css`:

- `animate-fadeInUp`: 0.6s fade + translate up
- `animate-fadeIn`: 0.8s opacity fade
- `animate-slideInLeft`, `animate-slideInRight`: 0.6s directional slides
- `animate-scaleIn`: 0.5s scale + opacity

Apply directly as Tailwind classes: `<div className="animate-fadeInUp">...</div>`

## Project-Specific Gotchas

### Static Export Limitations

- No `getServerSideProps` or API routes (all content must be static)
- Images must use the `unoptimized` prop (image optimization is disabled in `next.config.ts`)
- In-page navigation uses `<a href="#section">` anchor links (correct for hash scrolling); `next/link` is used for route links in `error.tsx` / `not-found.tsx`

### Theme Toggle Pattern

`mode-toggle.tsx` uses a `useSyncExternalStore` mount guard (not `useState` + `useEffect`) to prevent hydration errors:

```tsx
const emptySubscribe = () => () => {};
const mounted = React.useSyncExternalStore(
  emptySubscribe,
  () => true,
  () => false
);
if (!mounted) return <PlaceholderButton />; // Match server HTML
```

**Why**: `next-themes` reads localStorage client-side only. The store returns the server snapshot (`false`) during SSR + hydration, then `true` on the client — no state update in an effect. Always return fallback UI before mounting.

### CSS Transition Coordination

All theme-aware elements use `transition-colors duration-300` for smooth mode switching. When adding new sections, apply same transition to maintain consistency.

## Tech Stack Details

**Core Dependencies**:

- `next@^16.2.9` - React framework with App Router
- `react@^19.2.7`, `react-dom@^19.2.7` - UI library
- `next-themes@^0.4.6` - Theme management
- `@radix-ui/react-slot@^1.3.0` - Composable component primitives
- `class-variance-authority@^0.7.1` - Typed variant styling (`Button`)
- `tailwind-merge@^3.6.0` + `clsx@^2.1.1` - Utility class merging (via `cn()`)
- `lucide-react@^1.18.0`, `@tabler/icons-react@^3.44.0` - Icon libraries

**Linting/Formatting**:

- ESLint flat config in `eslint.config.mjs` (ESLint 10) — `@eslint-react`, `typescript-eslint`, `react-hooks`, `@next/next`; `eslint-config-prettier` last so Prettier owns formatting
- Prettier config in `.prettierrc` (100-col, LF, double quotes, ES5 trailing commas)

## Content Updates

**Main portfolio content**: Edit the section components in `components/sections/` (re-exported from `components/sections/index.ts`, composed in `app/page.tsx`)

- Hero, About, Skills, Technical Capabilities, Problem-Solving, Experience, Projects (BentoGrid), Education, Contact
- Each section holds its content as module-level `const` data arrays — no CMS or markdown

**Site metadata**: Update `app/layout.tsx` `Metadata` export

- Change title, description, Open Graph tags here

**Contact info**: Email `jerry@holland.vip` hardcoded in `components/sections/ContactSection.tsx`

**Social links**: GitHub/LinkedIn URLs in `components/sections/HeroSection.tsx` and `components/Footer.tsx`
