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
- **Deployment**: Static Export (SSG)

## ✨ Features

- 🌓 Dark/Light mode with system preference detection
- 📱 Fully responsive design (mobile-first)
- ⚡ Optimized static site generation
- 🎨 Custom CSS theming system with design tokens
- 🔍 SEO optimized
- ♿ Accessibility focused
- 🎯 Performance optimized (Core Web Vitals)

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

```
holland-vip/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main portfolio page
│   ├── layout.tsx         # Root layout with metadata
│   ├── globals.css        # Global styles and CSS variables
│   └── favicon.ico        # Site favicon
├── components/            # Reusable React components
│   ├── ui/               # UI primitives
│   │   ├── bento-grid.tsx  # Feature showcase grid
│   │   └── button.tsx      # Button component
│   ├── mode-toggle.tsx   # Dark/light mode switcher
│   └── theme-provider.tsx # Theme context provider
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions (cn, etc.)
├── public/               # Static assets
└── .github/              # GitHub configuration
    └── copilot-instructions.md
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

## 📄 License

MIT

## 👤 Author

**Jerry Holland**  
Senior Web Developer  
[GitHub](https://github.com/jwh3times) | [LinkedIn](https://www.linkedin.com/in/jerry-holland-60177a102)

---

Built with ❤️ using Next.js and React
