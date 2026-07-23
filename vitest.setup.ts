import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Unmount React trees between tests so queries don't see stale DOM.
afterEach(() => cleanup());

// jsdom doesn't implement matchMedia, which next-themes calls on mount.
// Guarded: tests that opt into `// @vitest-environment node` (e.g. pure lib
// tests with no DOM) run this setup file too, but have no `window` global.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}
