import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ModeToggle } from "@/components/mode-toggle";

// Mutable theme state shared with the mocked useTheme hook.
const themeState = vi.hoisted(() => ({
  resolvedTheme: "dark",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: themeState.resolvedTheme,
    setTheme: themeState.setTheme,
  }),
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    themeState.setTheme.mockClear();
  });

  it("offers the light-mode action and switches to light when dark", () => {
    themeState.resolvedTheme = "dark";
    render(<ModeToggle />);
    const button = screen.getByRole("button", { name: "Activate light mode" });
    fireEvent.click(button);
    expect(themeState.setTheme).toHaveBeenCalledWith("light");
  });

  it("offers the dark-mode action and switches to dark when light", () => {
    themeState.resolvedTheme = "light";
    render(<ModeToggle />);
    const button = screen.getByRole("button", { name: "Activate dark mode" });
    fireEvent.click(button);
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
  });

  // The `!mounted` branch. next-themes reads localStorage client-side only, so
  // the server render must emit a theme-independent placeholder that matches
  // what the client puts down on its first paint — otherwise hydration
  // mismatches. In jsdom the store returns the client snapshot immediately, so
  // this is only reachable through an actual server render.
  it("renders an inert placeholder during server rendering", () => {
    themeState.resolvedTheme = "dark";
    const html = renderToString(<ModeToggle />);

    expect(html).toContain("disabled");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    // No theme-dependent affordance is announced before hydration.
    expect(html).not.toContain("Activate light mode");
    expect(html).not.toContain("Activate dark mode");
  });

  it("keeps the placeholder and the mounted toggle on the same base classes", () => {
    themeState.resolvedTheme = "dark";
    const serverHtml = renderToString(<ModeToggle />);
    render(<ModeToggle />);
    const client = screen.getByRole("button", { name: "Activate light mode" });

    // A shared `toggleBase` keeps the server and client markup aligned on
    // geometry and focus behaviour; drifting those apart is what produces a
    // hydration warning. Shape is deliberately not shared — the mounted toggle
    // passes `rounded-full`, and `cn()` drops the base `rounded-md` for it.
    for (const cls of ["inline-flex", "h-10", "w-10", "focus-visible:ring-2"]) {
      expect(serverHtml, `server markup missing ${cls}`).toContain(cls);
      expect(client, `client markup missing ${cls}`).toHaveClass(cls);
    }
    expect(serverHtml).toContain("rounded-md");
    expect(client).toHaveClass("rounded-full");
    expect(client).not.toHaveClass("rounded-md");
  });
});
