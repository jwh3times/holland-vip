# Holland.VIP Personal Website

Professional portfolio website for Jerry Holland showcasing 12 years of software engineering experience. Built with modern web technologies and optimized for performance.

## 🚀 Tech Stack

- **Framework**: Next.js 16.0+ (App Router)
- **UI Library**: React 19.2+
- **Styling**: Tailwind CSS 4.1+
- **Language**: TypeScript 5.9+
- **Icons**: Tabler Icons, Lucide React
- **Theme**: next-themes (dark/light mode support)
- **UI Components**: Radix UI primitives
- **Testing**: Playwright (E2E testing)
- **CI/CD**: GitHub Actions
- **Deployment**: Static Export (SSG)

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

- Node.js 18.17 or later
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

### Testing

Run the Playwright E2E test suite:

```bash
npm run test           # Run all tests headlessly
npm run test:headed    # Run tests with browser visible
npm run test:ui        # Open Playwright UI mode
npm run test:debug     # Debug tests with inspector
```

Tests cover:

- Homepage content and navigation
- Theme switching functionality
- Mobile navigation (hamburger menu)
- Accessibility (skip links, landmarks, ARIA)
- SEO meta tags (Open Graph, Twitter cards)

### Build for Production

Build and export the static site:

```bash
npm run build
```

The static files will be generated in the `/out` directory, ready for deployment.

## 🌐 Deployment

This site is configured for static export and can be deployed to any static hosting provider:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- **GoDaddy** or any traditional web host

### Deploying to Static Hosts

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
│   └── not-found.tsx        # 404 page
├── components/              # Reusable React components
│   ├── ui/                  # UI primitives
│   │   ├── bento-grid.tsx   # Feature showcase grid
│   │   └── button.tsx       # Button component
│   ├── sections/            # Page sections
│   │   ├── HeroSection.tsx  # Hero/intro section
│   │   ├── AboutSection.tsx # About me section
│   │   ├── SkillsSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── ...              # Other sections
│   ├── icons/               # Custom icon components
│   │   └── SocialIcons.tsx  # Social media icons
│   ├── Navigation.tsx       # Header navigation with mobile menu
│   ├── Footer.tsx           # Site footer
│   ├── mode-toggle.tsx      # Dark/light mode switcher
│   └── theme-provider.tsx   # Theme context provider
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions (cn, etc.)
├── tests/                   # Playwright E2E tests
│   ├── homepage.spec.ts     # Homepage tests
│   ├── theme.spec.ts        # Theme switching tests
│   ├── mobile-navigation.spec.ts
│   ├── accessibility.spec.ts
│   └── seo.spec.ts          # SEO meta tag tests
├── public/                  # Static assets
│   ├── icon.svg             # Favicon
│   ├── apple-touch-icon.svg # Apple touch icon
│   ├── og-image.svg         # Open Graph image
│   ├── manifest.json        # Web app manifest
│   ├── robots.txt           # Search engine directives
│   ├── sitemap.xml          # Sitemap for SEO
│   └── _headers             # Security headers (Netlify/Cloudflare)
├── .github/
│   ├── workflows/
│   │   └── ci.yml           # GitHub Actions CI pipeline
│   └── copilot-instructions.md
└── playwright.config.ts     # Playwright test configuration
```

## 🎨 Customization

### Content Updates

- **Main content**: Edit `/app/page.tsx`
- **Site metadata**: Update `/app/layout.tsx` (title, description, Open Graph)
- **Contact info**: Update email links in `/app/page.tsx`
- **Social links**: Update GitHub/LinkedIn URLs in footer

### Styling

- **CSS variables**: Modify `/app/globals.css` (design tokens for colors, spacing)
- **Tailwind config**: Adjust `tailwind.config.ts` for theme customization
- **Component styles**: Components use Tailwind utility classes

### Theme System

The site uses CSS custom properties for theming:

- Text hierarchy: `--heading-text`, `--body-text`, `--muted-text`
- Colored badges: `--badge-blue-text`, `--badge-green-text`, etc.
- Automatically adapts to light/dark mode

## 🧪 Code Quality

- **ESLint**: Configured with Next.js and Prettier rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Full type safety across the project
- **Playwright**: E2E tests across multiple browsers (Chrome, Firefox, Safari)
- **GitHub Actions**: Automated CI pipeline (build, lint, format check, tests)

## 🔒 Security

The site implements security best practices:

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

Security headers are configured in `next.config.ts` and `public/_headers`.

## 📄 License

MIT

## 👤 Author

**Jerry Holland**  
Senior Web Developer  
[GitHub](https://github.com/jwh3times) | [LinkedIn](https://www.linkedin.com/in/jerry-holland-60177a102)

---

Built with ❤️ using Next.js and React
