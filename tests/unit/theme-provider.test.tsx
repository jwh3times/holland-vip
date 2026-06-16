import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";

describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <span>themed child</span>
      </ThemeProvider>
    );
    expect(screen.getByText("themed child")).toBeInTheDocument();
  });
});
