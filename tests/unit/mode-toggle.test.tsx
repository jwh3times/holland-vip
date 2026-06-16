import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});
