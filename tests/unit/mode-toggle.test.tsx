import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ModeToggle } from "@/components/mode-toggle";

// Mutable theme state shared with the mocked useTheme hook. `theme` is the stored
// choice ("system" when there is none); `resolvedTheme` is what is painted.
const themeState = vi.hoisted(() => ({
  theme: "system" as string | undefined,
  resolvedTheme: "dark" as string | undefined,
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme: themeState.setTheme,
  }),
}));

function renderAt(theme: string | undefined, resolvedTheme: string | undefined) {
  themeState.theme = theme;
  themeState.resolvedTheme = resolvedTheme;
  render(<ModeToggle />);
  return screen.getByRole("button", { name: /^Theme:/ });
}

describe("ModeToggle", () => {
  beforeEach(() => {
    themeState.setTheme.mockClear();
  });

  it.each([
    // stored choice, OS-resolved theme, visible label, accessible name, next choice
    ["system", "dark", "◒ auto", "Theme: auto (dark). Switch to dark.", "dark"],
    ["system", "light", "◒ auto", "Theme: auto (light). Switch to dark.", "dark"],
    // Before next-themes has read the OS scheme, auto names no resolved theme.
    ["system", undefined, "◒ auto", "Theme: auto. Switch to dark.", "dark"],
    ["dark", "dark", "◐ dark", "Theme: dark. Switch to light.", "light"],
    ["light", "light", "◑ light", "Theme: light. Switch to auto.", "system"],
  ])("at %s (%s) shows %s, names %s, and moves to %s", (theme, resolved, label, name, next) => {
    const button = renderAt(theme, resolved);
    expect(button).toHaveTextContent(label);
    expect(button).toHaveAccessibleName(name);

    fireEvent.click(button);
    expect(themeState.setTheme).toHaveBeenCalledWith(next);
  });

  it("treats a missing stored choice as auto", () => {
    const button = renderAt(undefined, "light");
    expect(button).toHaveTextContent("◒ auto");
  });

  // The `!mounted` branch. next-themes reads localStorage client-side only, so
  // the server render must emit a theme-independent placeholder that matches
  // what the client puts down on its first paint — otherwise hydration
  // mismatches. In jsdom the store returns the client snapshot immediately, so
  // this is only reachable through an actual server render.
  it("renders an inert, label-free placeholder during server rendering", () => {
    themeState.theme = "dark";
    const html = renderToString(<ModeToggle />);

    expect(html).toContain("disabled");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    // No theme-dependent state is shown or announced before hydration.
    expect(html).not.toMatch(/Theme:|auto|dark|light/);
  });

  it("gives the placeholder and the mounted toggle the same fixed width", () => {
    themeState.theme = "light";
    themeState.resolvedTheme = "light";
    const serverHtml = renderToString(<ModeToggle />);
    const client = renderAt("light", "light");

    // A shared `toggleBase` keeps the pill the same size before and after mount,
    // so the header's nav row does not shift when the label appears.
    const width = /\bw-\[[^\]]+\]/.exec(client.className)?.[0];
    expect(width).toBeDefined();
    expect(serverHtml).toContain(width);
  });
});
