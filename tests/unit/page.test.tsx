import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";

// Stub the build-time GitHub fetch so the async page renders deterministically
// without hitting the network.
vi.mock("@/lib/github", () => ({
  getFeaturedRepos: vi.fn(async () => [
    {
      name: "apexracers",
      description: "Lap time percentile tracking",
      language: "C#",
      stars: 1,
      pushedAt: "2026-06-18T00:00:00Z",
      url: "https://github.com/jwh3times/apexracers",
    },
  ]),
}));

describe("Home page", () => {
  it("composes navigation, main content, and footer", async () => {
    const ui = await Home();
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        {ui}
      </ThemeProvider>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByText("Jerry Holland").length).toBeGreaterThan(0);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open Source" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Get In Touch" })).toBeInTheDocument();
  });
});
