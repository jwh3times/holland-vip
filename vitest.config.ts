import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Absolute, posix-normalized repo root so aliases resolve on Windows and Linux.
const root = fileURLToPath(new URL(".", import.meta.url))
  .replace(/\\/g, "/")
  .replace(/\/$/, "");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Stub Next's Image/Link so components render as plain elements in jsdom.
      { find: "next/image", replacement: `${root}/tests/unit/mocks/next-image.tsx` },
      { find: "next/link", replacement: `${root}/tests/unit/mocks/next-link.tsx` },
      // Mirror the tsconfig "@/*" path alias.
      { find: /^@\/(.*)$/, replacement: `${root}/$1` },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Unit tests only; Playwright e2e specs live in tests/*.spec.ts.
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // CSS is not processed (imports become no-ops) so Tailwind/PostCSS stay out of unit tests.
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
