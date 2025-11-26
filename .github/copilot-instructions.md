# Holland.VIP Personal Website Project

## Project Overview

Personal portfolio website built with **Next.js 16.0+ (App Router)**, **React 19.2+**, and **TypeScript 5.9+**. Configured for **static export** (SSG) targeting deployment on GoDaddy or similar static hosting.

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

**Important**: Build creates fully static site (no Node.js runtime required). Test build output before deployment.

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
- Images must use `unoptimized: true` in Next.js config
- Links should use Next.js `<Link>` component, not `<a>` for internal navigation (though this project uses `<a>` for simplicity)

### Theme Toggle Pattern

`mode-toggle.tsx` uses mount guard to prevent hydration errors:

```tsx
const [mounted, setMounted] = React.useState(false);
React.useEffect(() => setMounted(true), []);
if (!mounted) return <PlaceholderButton />; // Match server HTML
```

**Why**: `next-themes` reads localStorage client-side only. Always return fallback UI before mounting.

### CSS Transition Coordination

All theme-aware elements use `transition-colors duration-300` for smooth mode switching. When adding new sections, apply same transition to maintain consistency.

## Tech Stack Details

**Core Dependencies**:

- `next@^16.0.1` - React framework with App Router
- `react@^19.2.0`, `react-dom@^19.2.0` - UI library
- `next-themes@^0.4.6` - Theme management
- `@radix-ui/react-slot@^1.2.3` - Composable component primitives
- `tailwind-merge@^3.3.1` + `clsx@^2.1.1` - Utility class merging (via `cn()`)
- `lucide-react@^0.552.0`, `@tabler/icons-react@^3.35.0` - Icon libraries

**Linting/Formatting**:

- ESLint with Next.js config + Prettier integration
- Configured in `package.json` scripts, no custom config files needed

## Content Updates

**Main portfolio content**: Edit `app/page.tsx` (single-page application)

- Hero section, About, Skills, Experience timeline, Projects (BentoGrid), Education, Contact
- All content is inline JSX (no CMS or markdown)

**Site metadata**: Update `app/layout.tsx` `Metadata` export

- Change title, description, Open Graph tags here

**Contact info**: Email links hardcoded in `page.tsx` (search for `jerry@holland.vip`)

**Social links**: GitHub/LinkedIn URLs in hero and footer sections of `page.tsx`
