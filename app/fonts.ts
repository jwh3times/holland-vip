import localFont from "next/font/local";

/**
 * The Terminal design's two faces, both from the `geist` package and both served
 * through `next/font/local`: self-hosted under /_next/static/media, nothing
 * fetched at build time, and inside the `font-src 'self'` CSP. Each exposes a
 * CSS variable that app/globals.css maps to the `--font-sans` / `--font-mono`
 * Tailwind theme variables.
 */

/** Geist Sans: the body face, preloaded because it paints the hero's LCP text. */
export { GeistSans as geistSans } from "geist/font/sans";

/**
 * Geist Mono, declared here rather than taken from `geist/font/mono` so it can
 * skip the preload that package hard-codes. A preloaded 70 KB face competes
 * with the LCP text on a throttled connection whether or not anything renders
 * in it; unpreloaded, the browser fetches it only once mono text is laid out.
 * The options otherwise match the package's own.
 */
export const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
});
