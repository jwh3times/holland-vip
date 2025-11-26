import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = "https://holland.vip";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jerry Holland | Senior Software Engineer",
    template: "%s | Jerry Holland",
  },
  description:
    "Senior Software Engineer with 12+ years of experience in full-stack development, cloud architecture, and system optimization. Specializing in .NET, Java, Python, AWS, and Azure.",
  keywords: [
    "Software Engineer",
    "Full Stack Developer",
    "Cloud Architecture",
    "AWS",
    "Azure",
    ".NET",
    "Java",
    "Python",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Jerry Holland", url: siteUrl }],
  creator: "Jerry Holland",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Jerry Holland",
    title: "Jerry Holland | Senior Software Engineer",
    description:
      "Senior Software Engineer with 12+ years of experience in full-stack development, cloud architecture, and system optimization.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Jerry Holland - Senior Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jerry Holland | Senior Software Engineer",
    description:
      "Senior Software Engineer with 12+ years of experience in full-stack development, cloud architecture, and system optimization.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
