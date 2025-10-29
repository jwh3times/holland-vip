# Holland.VIP Personal Website

A modern, responsive portfolio website built with Next.js, React, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19+
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Static Export (SSG)

## 📦 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
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

### Build for Production

Build and export the static site:

```bash
npm run build
```

The static files will be generated in the `/out` directory, ready for deployment.

## 🌐 Deployment

This site is configured for static export and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- **GoDaddy** (upload the `/out` folder)

### Deploying to GoDaddy

1. Run `npm run build`
2. Upload the contents of the `/out` folder to your GoDaddy hosting
3. Point your `holland.vip` domain to the hosting

## 📝 Customization

- Edit `/app/page.tsx` to update content
- Modify `/app/globals.css` for styling changes
- Update metadata in `/app/layout.tsx`
- Add new pages by creating files in the `/app` directory

## 📄 License

MIT

## 👤 Author

Holland - Senior Software Engineer
