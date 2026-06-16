import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";

describe("Home page", () => {
  it("composes navigation, main content, and footer", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <Home />
      </ThemeProvider>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByText("Jerry Holland").length).toBeGreaterThan(0);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Get In Touch" })).toBeInTheDocument();
  });
});
