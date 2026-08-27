# Holland.VIP Personal Website

Professional portfolio website for Jerry Holland showcasing over a decade of software engineering experience. Built with modern web technologies and optimized for performance.

## 🚀 Tech Stack

- **Framework**: Next.js 16.3+ (App Router)
- **UI Library**: React 19.2+
- **Styling**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`)
- **Language**: TypeScript 7.0+
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode support)
- **UI Components**: Custom Tailwind components (no headless-UI or variant-authoring
  dependency — see `components/ui/`)
- **Testing**: Vitest + Testing Library (unit) and Playwright (E2E)
- **CI/CD**: GitHub Actions (lint, format check, unit coverage, E2E, changelog-version guard)
- **Deployment**: Static Export (SSG) → Cloudflare Pages

## ✨ Features

- 🌓 Dark/Light mode with system preference detection
- 📱 Fully responsive design with mobile navigation
- ⚡ Optimized static site generation
- 🎨 Custom CSS theming system with design tokens
- 🔍 SEO optimized with Open Graph & Twitter cards
- ♿ Accessibility focused (WCAG compliant)
- 🔒 Security headers (CSP, X-Frame-Options, etc.)
- 🎯 Performance optimized (Core Web Vitals)
- 🧪 Comprehensive E2E testing with Playwright

## 📦 Getting Started

### Prerequisites

- Node.js 26 (pinned in [.nvmrc](.nvmrc) and declared in `package.json` under
  `engines.node`; run `nvm use` to match CI and Cloudflare)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jwh3times/holland-vip.git
   cd holland-vip
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

The public clone is complete on its own. Maintainers recovering confidential workspace context clone
the independent private companion into the ignored `private/` directory with
`npm run bootstrap:private` (also the step to run in each new git worktree); see
[`docs/agents/workspace-bootstrap.md`](docs/agents/workspace-bootstrap.md). Public contributors and
CI never need that repository.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Other available commands:

- `npm run lint` - Run Oxlint to check code quality
- `npm run lint:fix` - Apply Oxlint's safe automatic fixes
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

The project has two test layers: **Vitest + Testing Library** for fast unit/component tests, and **Playwright** for end-to-end browser tests.

#### Unit tests (Vitest)

```bash
npm run test:unit            # Run unit/component tests once
npm run test:unit:watch      # Watch mode
npm run test:unit:coverage   # Run with V8 coverage (enforces 95% thresholds)
```

Unit tests live in `tests/unit/` and run in jsdom. Coverage is gated at 95%
(statements/branches/functions/lines) in `vitest.config.ts`, excluding
`components/sections/**` and the pure-JSX `ui/{section,card,badge,bento-grid}`
shells — those are covered through seam tests instead, since a single-JSX-expression
component reports 100% line coverage as soon as anything renders it.

#### End-to-end tests (Playwright)

```bash
npm run test           # Run all E2E tests headlessly
npm run test:headed    # Run tests with browser visible
npm run test:ui        # Open Playwright UI mode
npm run test:debug     # Debug tests with inspector
```

E2E tests cover:

- Homepage content and navigation
- Theme switching functionality
- Mobile navigation (hamburger menu)
- Custom 404 page behavior
- Accessibility (skip links, landmarks, ARIA)
- SEO meta tags (Open Graph, Twitter cards)

Playwright starts its server automatically. Local tests default to the Next.js dev
server and fan out across five browser/device projects. CI downloads the build
job's `out/` artifact, serves that static export, and runs the Chromium-engine
projects (chromium + Mobile Chrome), so it never tests the dev server. To exercise
the CI target locally, build first and set `E2E_TARGET=build` when invoking
Playwright:

```bash
npm run build
E2E_TARGET=build npx playwright test
```

In PowerShell, set the variable with `$env:E2E_TARGET = "build"` before the
Playwright command.

### Build for Production

Build and export the static site:

```bash
npm run build
```

The static files will be generated in the `/out` directory, ready for deployment.

## 🌐 Deployment

The site is configured for static export and deployed to **Cloudflare Pages**
(custom domain `holland.vip`, with `www` 301-redirecting to the apex). Cloudflare
builds and deploys directly from the GitHub repo on every push to `main` (build
command `npm run build`, output directory `out`).

> **There is no deploy workflow in this repo.** Deployment is configured in the
> Cloudflare Pages dashboard, not GitHub Actions. The GitHub Actions CI is a
> parallel quality gate (lint, format, unit coverage, E2E) — it does **not** deploy.

### Versioning and Releases

Every merge to `main` creates a standard SemVer tag and GitHub Release in
`v<major>.<minor>.<build>` format. The workflow reads `package.json` `version` as
the requested release line, auto-increments the build number from existing tags
in the same major/minor line, and preserves `x.y.0` when a new major/minor line
has no existing `v<x>.<y>.*` tags. The next version is computed by
`scripts/next-version.mjs`, a single source of truth shared with the CI changelog
guard and the `/ship` skill. Before calling it, `/ship` classifies the branch as a
major, minor, or build-only release and updates the package release line for a
confirmed major/minor increase.

Release history is documented in [CHANGELOG.md](CHANGELOG.md) (Keep a Changelog
format). Its top entry must name the version that the next merge to `main` will
mint — a `changelog` job in CI (PR-only, skipped for Dependabot) fails the PR if
the top `## [x.y.z]` version doesn't match `scripts/next-version.mjs`'s output.
The `.agents/skills/ship/SKILL.md` skill writes that entry for the branch and
opens or updates the PR.

Because the build is a portable static export, it can also be hosted on any other
static provider:

- **Netlify**
- **GitHub Pages**
- **GoDaddy** or any traditional web host

### Deploying Manually to a Static Host

1. Run `npm run build`
2. Upload the contents of the `/out` folder to your hosting provider
3. Configure your DNS to point to the hosting location

## 📁 Project Structure

```text
holland-vip/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Main portfolio page
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── globals.css          # Global styles and CSS variables
│   ├── loading.tsx          # Loading state component
│   ├── error.tsx            # Error boundary component
│   ├── not-found.tsx        # 404 page
│   └── sitemap.ts           # Sitemap route (build-time → out/sitemap.xml)
├── components/              # Reusable React components
│   ├── ui/                  # UI primitives
│   │   ├── badge.tsx        # Pill badge (accent-aware)
│   │   ├── bento-grid.tsx   # Feature showcase grid
│   │   ├── card.tsx         # Card shell (accent-aware)
│   │   ├── cta.tsx          # Call-to-action module (button/link/anchor)
│   │   └── section.tsx      # Section shell (rhythm, container, h2, surface alternation)
│   ├── sections/            # Page sections
│   │   ├── HeroSection.tsx  # Hero/intro section
│   │   ├── AboutSection.tsx # About me section
│   │   ├── SkillsSection.tsx
│   │   ├── TechnicalCapabilities.tsx
│   │   ├── ProblemSolving.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── OpenSourceSection.tsx  # GitHub repos + contribution heatmap
│   │   ├── EducationSection.tsx
│   │   └── ContactSection.tsx
│   ├── icons/               # Custom icon components
│   │   └── SocialIcons.tsx  # Social media icons
│   ├── ContributionHeatmap.tsx  # GitHub contribution calendar (used by OpenSourceSection)
│   ├── Navigation.tsx       # Header navigation with mobile menu
│   ├── Footer.tsx           # Site footer
│   ├── mode-toggle.tsx      # Dark/light mode switcher
│   └── theme-provider.tsx   # Theme context provider
├── content/                 # Site copy — what each section says (typed modules, no JSX)
│   ├── hero.ts              # HeroSection copy
│   ├── about.ts             # AboutSection copy (bio, highlights, achievements)
│   ├── skills.ts            # SkillsSection copy
│   ├── capabilities.ts      # TechnicalCapabilities copy
│   ├── problem-solving.ts   # ProblemSolving copy
│   ├── experience.ts        # ExperienceSection copy
│   ├── projects.ts          # ProjectsSection copy
│   ├── education.ts         # EducationSection copy
│   ├── contact.ts           # ContactSection copy (email lives in lib/site-config.ts)
│   └── open-source.ts       # OpenSourceSection copy (repo list fetched at build time)
├── lib/                     # Non-UI modules
│   ├── accent.ts            # The accent palette: Accent union + token table
│   ├── github.ts            # Featured repos, resolved at build time
│   ├── github-contributions.ts  # Contribution calendar, resolved at build time
│   ├── github-fetch.ts      # Shared GitHub fetch + degrade-to-snapshot policy
│   ├── site-config.ts       # Email, social links, years of experience
│   └── utils.ts             # Helper functions (cn, etc.)
├── scripts/                 # Standalone Node scripts (not part of the Next.js build)
│   ├── next-version.mjs     # Computes the next release version (major.minor.build)
│   ├── seed-contributions.mjs  # Seeds the GitHub contributions fallback JSON
│   ├── sync-agents.mjs      # Regenerates .claude/skills + .codex from their authored sources
│   └── lib/
│       └── agent-sync.mjs   # Transform + orchestration logic used by sync-agents.mjs
├── tests/                   # Tests
│   ├── homepage.spec.ts     # Playwright E2E — homepage
│   ├── not-found.spec.ts    # Playwright E2E — 404 page
│   ├── theme.spec.ts        # Playwright E2E — theme switching
│   ├── mobile-navigation.spec.ts
│   ├── accessibility.spec.ts
│   ├── seo.spec.ts          # Playwright E2E — SEO meta tags
│   └── unit/                # Vitest + Testing Library unit tests
│       ├── *.test.tsx       # Component/page/util tests
│       └── mocks/           # next/image + next/link stubs
├── public/                  # Static assets
│   ├── icon.svg             # Favicon
│   ├── apple-touch-icon.svg # Apple touch icon
│   ├── og-image.png         # Open Graph image (rendered; what scrapers use)
│   ├── og-image.svg         # Open Graph source artwork
│   ├── manifest.json        # Web app manifest
│   ├── robots.txt           # Search engine directives
│   └── _headers             # Security headers (served by Cloudflare Pages)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # CI: build/lint/format + agent-sync check + unit coverage + E2E + changelog guard
│   │   ├── dependency-review.yml   # Fails PRs on high-severity vuln deps
│   │   ├── smoke.yml               # Daily smoke check against the live site
│   │   ├── refresh.yml             # Weekly Cloudflare rebuild (fresh GitHub data)
│   │   ├── sync-agents.yml         # PR-only: auto-commits regenerated agent artifact drift
│   │   └── version.yml             # Tags and releases merges to main
│   ├── dependabot.yml              # npm + GitHub Actions update schedule
│   └── copilot-instructions.md
├── .agents/
│   └── skills/              # AUTHORED skills: repo `ship` skill + installs in skills-lock.json
├── skills-lock.json         # Provenance + content hashes for installed third-party skills
├── .claude/
│   ├── agents/              # AUTHORED subagents (docs-updater)
│   └── skills/              # GENERATED from .agents/skills/ — do not edit (see scripts/sync-agents.mjs)
├── .codex/                  # GENERATED from .claude/agents/ — do not edit (see scripts/sync-agents.mjs)
├── CONTEXT.md               # Shared domain language for the portfolio
├── CHANGELOG.md             # Keep a Changelog release history
├── playwright.config.ts     # Playwright (E2E) configuration
├── vitest.config.ts         # Vitest (unit) configuration + coverage thresholds
└── .nvmrc                   # Node version used by CI and Cloudflare Pages
```

> Deployment is handled by Cloudflare Pages from the dashboard — there is no
> `deploy.yml` workflow in this repo.

## 🎨 Customization

### Content Updates

- **Site copy**: Edit the typed modules in `/content/` (hero tagline, bio, skills, experience,
  projects, education, etc.) — section components in `/components/sections/` import from these
  and render them, they don't hold prose themselves. A resume edit is a one-file change.
- **Page composition**: Edit `/app/page.tsx` (section order, surface alternation)
- **Site metadata**: Update `/app/layout.tsx` (title, description, Open Graph)
- **Contact info**: Update `siteConfig.email` in `/lib/site-config.ts`
- **Social links**: Update GitHub/LinkedIn URLs in `/lib/site-config.ts`

### Styling

- **CSS variables**: Modify `/app/globals.css` (design tokens for colors, spacing)
- **Tailwind config**: Tailwind v4 uses CSS-based configuration — edit `/app/globals.css` for theme customization (no `tailwind.config.ts`)
- **Component styles**: Components use Tailwind utility classes

### Theme System

The site uses CSS custom properties for theming:

- Text hierarchy: `--heading-text`, `--body-text`, `--muted-text`
- Colored badges: `--badge-blue-text`, `--badge-green-text`, etc.
- Automatically adapts to light/dark mode

## 🧪 Code Quality

- **Oxlint**: Native React Hooks and Next.js rules plus TypeScript 7-powered type-aware rules from `oxlint-tsgolint`; the project has no ESLint dependency, and Prettier owns formatting
- **Prettier**: Code formatting with consistent style
- **TypeScript 7**: Full type safety across the project (`strict: true`), checked through Next.js's default project-local CLI path
- **Vitest + Testing Library**: Unit/component tests with V8 coverage gated at 95% in CI (pure-JSX section/shell components excluded, covered via seam tests)
- **Playwright**: E2E tests across multiple browsers (Chrome, Firefox, Safari) — chromium-only in CI
- **GitHub Actions**: Automated CI pipeline (build, lint, format check, unit coverage, E2E, changelog-version guard)

## 🔒 Security

The site implements security best practices:

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

Security headers live in `public/_headers` (served by Cloudflare Pages) — this is
the **single source of truth**. `next.config.ts` intentionally has no `headers()`
block, since it is ignored by a static export.

## 🤝 Contributing

Bug reports, accessibility fixes, and small improvements are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and local checks. By
participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Report
vulnerabilities privately per [SECURITY.md](SECURITY.md).

## 📄 License

Licensed under the [MIT License](LICENSE) — © 2026 Jerry Holland.

## 👤 Author

**Jerry Holland**  
Senior Software Engineer / Tech Lead  
[GitHub](https://github.com/jwh3times) | [LinkedIn](https://www.linkedin.com/in/jerryhollandiii)

---

Built with ❤️ using Next.js and React
