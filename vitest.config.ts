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
      // Pure-JSX modules are excluded on purpose. A component whose body is a
      // single JSX expression is one statement to V8, so it reports 100% the
      // moment anything renders it — `components/ui/section.tsx` scored 4/4 over
      // 118 physical lines. Including them inflated the total while measuring
      // almost nothing: across the old scope, V8 instrumented 180 lines out of
      // 2,023 physical (9%).
      //
      // These modules are not untested. Their behaviour is asserted through the
      // seams instead — surface alternation and the anchor registry in
      // section.test.tsx, rendered copy in sections.test.tsx, accents in
      // accent.test.tsx — which is where those invariants actually live.
      exclude: [
        "**/*.d.ts",
        "components/sections/**",
        "components/ui/{section,card,badge,bento-grid}.tsx",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
