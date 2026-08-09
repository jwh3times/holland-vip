# Components Directory

Reusable React components for the Holland.VIP portfolio website.

## 📁 Structure

```text
components/
├── ui/                       # UI primitives and building blocks
│   ├── badge.tsx            # The site's pill badge (accent-aware)
│   ├── bento-grid.tsx       # Feature showcase grid component
│   ├── card.tsx             # The site's card shell (accent-aware)
│   ├── cta.tsx              # The site's call-to-action module
│   └── section.tsx          # The page-section shell (rhythm, container, h2, surface)
├── sections/                 # Page section components
│   ├── HeroSection.tsx      # Hero/intro section
│   ├── AboutSection.tsx     # About me section
│   ├── SkillsSection.tsx    # Skills showcase
│   ├── TechnicalCapabilities.tsx # Technical skills grid
│   ├── ProblemSolving.tsx   # Problem solving highlight
│   ├── ExperienceSection.tsx # Work experience timeline
│   ├── ProjectsSection.tsx  # Projects bento grid
│   ├── OpenSourceSection.tsx # Featured GitHub repos + contribution heatmap
│   ├── EducationSection.tsx # Education & certifications
│   ├── ContactSection.tsx   # Contact information
│   └── index.ts             # Section exports
├── icons/                    # Custom icon components
│   └── SocialIcons.tsx      # GitHub, LinkedIn icons
├── ContributionHeatmap.tsx  # GitHub contribution calendar (used by OpenSourceSection)
├── Navigation.tsx           # Header navigation with mobile menu
├── Footer.tsx               # Site footer with social links
├── mode-toggle.tsx          # Dark/light theme switcher
└── theme-provider.tsx       # Theme context wrapper
```

## 🧩 Current Components

### UI Components (`/ui`)

#### `badge.tsx`

The site's pill badge. Replaces five hand-written copies of the same pill class
string that had drifted into two token orderings and one variant baked into
content data.

**Props:** `children`, `accent?` (`lib/accent.ts`'s `Accent`, default `"blue"`),
`className?`.

`accent` picks the background/text pair from the accent token table; everything
else about the pill (shape, size, weight) is fixed. `className` is for layout
only.

**Usage:**

```tsx
<Badge accent="purple">Kubernetes / AKS</Badge>
```

#### `bento-grid.tsx`

Interactive grid layout for showcasing featured projects and capabilities.

**Features:**

- Responsive masonry-style layout
- Animated hover effects
- Icon support with Lucide React
- Customizable grid spans
- Dark/light theme support

**Usage:**

```tsx
<BentoGrid className="max-w-7xl mx-auto">
  <BentoGridItem
    title="Project Title"
    description="Project description"
    icon={<IconComponent />}
    className="md:col-span-2"
  />
</BentoGrid>
```

#### `card.tsx`

The site's card shell. Replaces five near-identical copies of
`rounded-2xl p-{6|8} card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg …`
that had drifted on padding and on `transition-all` vs `transition-colors`.

**Props:** `children`, `accent?` (`lib/accent.ts`'s `Accent`), `padding?`
(`"md"` p-6, default, or `"lg"` p-8), `interactive?` (adds the hover lift, off
by default), `className?`.

With no `accent`, the card uses the neutral `card-bg-white` surface; with an
`accent`, it uses that accent's tinted `cardBg` + `border` from the accent
table instead.

**Usage:**

```tsx
<Card accent="green" padding="lg" interactive>
  ...
</Card>
```

#### `cta.tsx`

The site's call-to-action module. Every CTA on the site goes through it.

**Variants:** `primary` (filled blue gradient, default) · `secondary` (outlined)

**Sizes:** `md` (px-8 py-3, default) · `lg` (px-10 py-4)

**The rendered element is derived from the props, not chosen by the caller:**

| Props               | Renders                                   |
| ------------------- | ----------------------------------------- |
| no `href`           | `<button type="button">` (pass `onClick`) |
| `href` starting `/` | `next/link` `<Link>`                      |
| any other `href`    | `<a>` (hash anchors, `mailto:`, external) |

External `http(s)` hrefs additionally get `target="_blank"` and
`rel="noopener noreferrer"`. Focus-visible rings, hover scale, and dark-mode
colours are handled internally and are not configurable. `className` is merged
last via `cn()`, so callers can add layout classes without forking the variant.

**Usage:**

```tsx
<Cta href="#projects" size="lg">View My Work</Cta>
<Cta variant="secondary" href="/">Go Home</Cta>
<Cta onClick={reset}>Try Again</Cta>
```

#### `section.tsx`

The page-section shell. Every body section renders through it.

**Props:** `title` (rendered as the section's `h2`), `children`, `id?`, `subtitle?`,
`surface?`, `width?` (`"wide"` default | `"narrow"`).

It owns the `py-20` rhythm, the centered container, the `h2`, the typed anchor id,
and the background surface. Heading margin is `mb-12`, or `mb-4` when a `subtitle`
follows — sections don't set it.

**A section never chooses its own surface.** `app/page.tsx` holds the ordered
`bodySections` list and derives each surface from position via `surfaceAt(index)`,
so adjacent sections can't collide. Sections accept `SectionSurfaceProps` and forward
it. Sections that shouldn't render are dropped from that list _before_ surfaces are
assigned, so a missing section can't re-phase the ones below it.

**Anchor ids** are typed: `SECTION_IDS` is every anchorable id, `NAV_SECTION_IDS` the
subset in the nav. `Navigation` maps a total `Record<NavSectionId, string>` of labels,
so a nav link pointing at a section that doesn't exist is a type error. `education` is
anchorable but deliberately not in the nav.

**Usage:**

```tsx
<Section id="about" title="About Me" surface={surface}>
  ...
</Section>

<Section id="contact" title="Get In Touch" surface={surface} width="narrow" subtitle={<>…</>}>
  ...
</Section>
```

### Theme Components

#### `theme-provider.tsx`

Provides theme context using `next-themes` for dark/light mode switching.

**Features:**

- System preference detection
- Persistent theme selection
- SSR-safe rendering
- Wraps the entire application

#### `mode-toggle.tsx`

User-facing toggle button for switching between light/dark themes.

**Features:**

- Sun/Moon icons (Lucide React)
- Smooth transitions
- Accessible (keyboard navigation)
- Positioned in navigation header

### Layout Components

#### `Navigation.tsx`

Responsive header navigation with mobile hamburger menu.

**Features:**

- Desktop navigation links
- Mobile hamburger menu (Menu/X icons)
- Scroll-aware sticky positioning
- Smooth transitions
- Accessible (keyboard navigation, ARIA attributes)
- Includes theme toggle

#### `Footer.tsx`

Site footer with social links and copyright.

**Features:**

- Social media links (GitHub, LinkedIn)
- Copyright notice
- Responsive layout
- Dark/light theme support

### Section Components (`/sections`)

Modular page sections for the portfolio:

| Component                   | Description                                  |
| --------------------------- | -------------------------------------------- |
| `HeroSection.tsx`           | Hero intro with name, title, and CTA buttons |
| `AboutSection.tsx`          | Personal introduction and background         |
| `SkillsSection.tsx`         | Core skills and technologies                 |
| `TechnicalCapabilities.tsx` | Technical skills in a grid layout            |
| `ProblemSolving.tsx`        | Problem-solving approach highlight           |
| `ExperienceSection.tsx`     | Work experience timeline                     |
| `ProjectsSection.tsx`       | Projects showcase using BentoGrid            |
| `OpenSourceSection.tsx`     | Featured GitHub repos + contribution heatmap |
| `EducationSection.tsx`      | Education and certifications                 |
| `ContactSection.tsx`        | Contact information and links                |

**Usage:**

```tsx
import { HeroSection, AboutSection, SkillsSection, ExperienceSection } from "@/components/sections";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
    </main>
  );
}
```

### Icon Components (`/icons`)

#### `SocialIcons.tsx`

Custom SVG icons for social media links.

**Available Icons:**

- `GitHubIcon` - GitHub logo
- `LinkedInIcon` - LinkedIn logo

**Usage:**

```tsx
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

<a href="https://github.com/username">
  <GitHubIcon className="h-6 w-6" />
</a>;
```

## 🎨 Styling Approach

All components use:

- **Tailwind CSS** for utility-first styling
- **CSS Variables** from `globals.css` for theming
- **`cn()` utility** for conditional class merging
- **Responsive design** with mobile-first breakpoints

## 🔧 Component Guidelines

When adding new components:

1. **Use TypeScript** - Define proper prop types
2. **Export interfaces** - Make prop types reusable
3. **Support theming** - Use CSS variables for colors
4. **Be accessible** - Follow ARIA best practices
5. **Stay modular** - Keep components focused and composable
6. **Document props** - Add JSDoc comments for complex components

## 📝 Example Component Template

```tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export function MyComponent({ title, description, className }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h3 className="text-heading">{title}</h3>
      {description && <p className="text-body">{description}</p>}
    </div>
  );
}
```

## 🎯 Design System

Components follow consistent patterns:

- **Text colors**: Use CSS variables (`text-heading`, `text-body`, `text-muted`)
- **Accent colors**: blue/green/purple/orange, from the single token table in
  `lib/accent.ts` — consume via `<Badge accent>` / `<Card accent>`, not
  hand-written class strings
- **Spacing**: Tailwind scale (4, 8, 12, 16, 20, 24px)
- **Borders**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-xl`
- **Transitions**: `transition-all duration-300`

## 📦 Dependencies

- **Lucide React** - Icon library (the site's single icon set)
- **next-themes** - Theme management
