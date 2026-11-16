import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { StatusBar } from "@/components/status-bar";

// The theme next-themes has painted, shared with the mocked hook.
const themeState = vi.hoisted(() => ({ resolvedTheme: "dark" as string | undefined }));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme }),
}));

describe("StatusBar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is the page's footer: branch, host, the build year's copyright and the encoding", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-03-01T12:00:00Z"));
    // The year is fixed when the module loads, so load a fresh copy under the faked clock.
    vi.resetModules();
    const { StatusBar: BuiltIn2031 } = await import("@/components/status-bar");
    render(<BuiltIn2031 />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent("● main");
    expect(footer).toHaveTextContent("holland.vip");
    expect(footer).toHaveTextContent("© 2031 Holland");
    expect(footer).toHaveTextContent("UTF-8 · LF · dark");
  });

  it("names the resolved theme, and follows it when the toggle changes it", () => {
    themeState.resolvedTheme = "dark";
    const { rerender } = render(<StatusBar />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/UTF-8 · LF · dark$/);

    themeState.resolvedTheme = "light";
    rerender(<StatusBar />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/UTF-8 · LF · light$/);
  });

  // The static HTML can't know the visitor's theme, so it must not guess one.
  it("names no theme in the server render, before it has mounted", () => {
    themeState.resolvedTheme = "dark";
    const html = renderToString(<StatusBar />);
    expect(html).toContain("UTF-8 · LF");
    expect(html).not.toMatch(/\b(dark|light)\b/);
  });
});
