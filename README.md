# Holland.VIP Personal Website

Professional portfolio website for Jerry Holland showcasing over a decade of software engineering experience. Built with modern web technologies and optimized for performance.

## 🚀 Tech Stack

- **Framework**: Next.js 16.2+ (App Router)
- **UI Library**: React 19.2+
- **Styling**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`)
- **Language**: TypeScript 6.0+
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode support)
- **UI Components**: Radix UI primitives, class-variance-authority
- **Testing**: Vitest + Testing Library (unit) and Playwright (E2E)
- **CI/CD**: GitHub Actions (lint, format check, unit coverage, E2E)
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

- Node.js 24 (pinned in [.nvmrc](.nvmrc) — run `nvm use` to match CI and Cloudflare)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jwh3times/holland-vip.git
   cd holland-vip
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Other available commands:

- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

The project has two test layers: **Vitest + Testing Library** for fast unit/component tests, and **Playwright** for end-to-end browser tests.

#### Unit tests (Vitest)

```bash
npm run test:unit            # Run unit/component tests once
npm run test:unit:watch      # Watch mode
npm run test:unit:coverage   # Run with V8 coverage (enforces 80% thresholds)
```

Unit tests live in `tests/unit/` and run in jsdom. Coverage is gated at 80%
(statements/branches/functions/lines) in `vitest.config.ts`.

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
- Accessibility (skip links, landmarks, ARIA)
- SEO meta tags (Open Graph, Twitter cards)

The Playwright dev server starts automatically — `playwright.config.ts` defines a
`webServer` that runs `npm run dev`. Locally, tests fan out across 5 browser/device
projects; CI runs the Chromium-engine projects (chromium + Mobile Chrome).

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
│   │   ├── bento-grid.tsx   # Feature showcase grid
│   │   └── button.tsx       # Button component
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
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions (cn, etc.)
├── tests/                   # Tests
│   ├── homepage.spec.ts     # Playwright E2E — homepage
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
│   │   ├── ci.yml                  # CI: build/lint/format + unit coverage + E2E
│   │   ├── dependency-review.yml   # Fails PRs on high-severity vuln deps
│   │   ├── smoke.yml               # Daily smoke check against the live site
│   │   └── refresh.yml             # Weekly Cloudflare rebuild (fresh GitHub data)
│   ├── dependabot.yml              # npm + GitHub Actions update schedule
│   └── copilot-instructions.md
├── playwright.config.ts     # Playwright (E2E) configuration
├── vitest.config.ts         # Vitest (unit) configuration + coverage thresholds
└── .nvmrc                   # Pinned Node version (single source of truth)
```

> Deployment is handled by Cloudflare Pages from the dashboard — there is no
> `deploy.yml` workflow in this repo.

## 🎨 Customization

### Content Updates

- **Main content**: Edit `/app/page.tsx`
- **Site metadata**: Update `/app/layout.tsx` (title, description, Open Graph)
- **Contact info**: Update email links in `/app/page.tsx`
- **Social links**: Update GitHub/LinkedIn URLs in footer

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

- **ESLint**: Flat config (`eslint.config.mjs`) on ESLint 10 with `@eslint-react`, `typescript-eslint`, `react-hooks`, and `@next/next`; Prettier owns formatting
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Full type safety across the project (`strict: true`)
- **Vitest + Testing Library**: Unit/component tests with V8 coverage gated at 80% in CI
- **Playwright**: E2E tests across multiple browsers (Chrome, Firefox, Safari) — chromium-only in CI
- **GitHub Actions**: Automated CI pipeline (build, lint, format check, unit coverage, E2E)

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
