# Components Directory

Reusable React components for the Holland.VIP portfolio website.

## 📁 Structure

```text
components/
├── ui/                       # UI primitives and building blocks
│   ├── bento-grid.tsx       # Feature showcase grid component
│   └── button.tsx           # Reusable button component
├── sections/                 # Page section components
│   ├── HeroSection.tsx      # Hero/intro section
│   ├── AboutSection.tsx     # About me section
│   ├── SkillsSection.tsx    # Skills showcase
│   ├── TechnicalCapabilities.tsx # Technical skills grid
│   ├── ProblemSolving.tsx   # Problem solving highlight
│   ├── ExperienceSection.tsx # Work experience timeline
│   ├── ProjectsSection.tsx  # Projects bento grid
│   ├── EducationSection.tsx # Education & certifications
│   ├── ContactSection.tsx   # Contact information
│   └── index.ts             # Section exports
├── icons/                    # Custom icon components
│   └── SocialIcons.tsx      # GitHub, LinkedIn icons
├── Navigation.tsx           # Header navigation with mobile menu
├── Footer.tsx               # Site footer with social links
├── mode-toggle.tsx          # Dark/light theme switcher
└── theme-provider.tsx       # Theme context wrapper
```

## 🧩 Current Components

### UI Components (`/ui`)

#### `bento-grid.tsx`

Interactive grid layout for showcasing featured projects and capabilities.

**Features:**

- Responsive masonry-style layout
- Animated hover effects
- Icon support with Tabler Icons
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

#### `button.tsx`

Flexible button component built on Radix UI with multiple variants.

**Variants:**

- `default` - Primary blue button
- `outline` - Border with transparent background
- `ghost` - Minimal styling, hover effects only

**Sizes:**

- `sm` - Small (32px height)
- `default` - Medium (40px height)
- `lg` - Large (44px height)
- `icon` - Square icon button

**Usage:**

```tsx
<Button variant="default" size="lg">
  Click Me
</Button>
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
- **Spacing**: Tailwind scale (4, 8, 12, 16, 20, 24px)
- **Borders**: `rounded-lg` (8px) or `rounded-xl` (12px)
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-xl`
- **Transitions**: `transition-all duration-300`

## 📦 Dependencies

- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Tabler Icons** - Additional icon set
- **next-themes** - Theme management
- **class-variance-authority** - Variant styling utility
