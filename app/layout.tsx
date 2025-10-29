import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holland.VIP | Senior Software Engineer",
  description: "Personal portfolio website showcasing my work as a senior fullstack software engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
