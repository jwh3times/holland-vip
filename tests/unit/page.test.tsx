/* oxlint-disable typescript/require-await -- async module test doubles intentionally resolve synchronously */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";
import { getFeaturedReposWithSource } from "@/lib/github";
import { getContributionsWithSource } from "@/lib/github-contributions";

// Stub the build-time GitHub fetch so the async page renders deterministically
// without hitting the network.
vi.mock("@/lib/github", () => ({
  getFeaturedReposWithSource: vi.fn(async () => ({
    data: [
      {
        name: "apexracers",
        description: "Lap time percentile tracking",
        language: "C#",
        stars: 1,
        pushedAt: "2026-06-18T00:00:00Z",
        url: "https://github.com/jwh3times/apexracers",
      },
    ],
    source: "live",
  })),
}));

vi.mock("@/lib/github-contributions", () => ({
  getContributionsWithSource: vi.fn(async () => ({
    data: { totalContributions: 0, weeks: [] },
    source: "live",
  })),
}));

const repoFixture = {
  name: "apexracers",
  description: "Lap time percentile tracking",
  language: "C#",
  stars: 1,
  pushedAt: "2026-06-18T00:00:00Z",
  url: "https://github.com/jwh3times/apexracers",
};

/** Render the page and read the surface class of each body section, in order. */
async function renderPage() {
  const ui = await Home();
  const view = render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {ui}
    </ThemeProvider>
  );
  const surfaces = [...view.container.querySelectorAll("main > section")]
    .filter((s) => !s.classList.contains("hero-section"))
    .map((s) => (s.classList.contains("section-surface") ? "surface" : "contrast"));
  return { ...view, surfaces };
}

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(getFeaturedReposWithSource).mockResolvedValue({
      data: [repoFixture],
      source: "live",
    });
    vi.mocked(getContributionsWithSource).mockResolvedValue({
      data: { totalContributions: 0, weeks: [] },
      source: "live",
    });
  });

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

  it("marks the static page live only when both GitHub requests are live", async () => {
    const first = await renderPage();
    expect(screen.getByRole("main")).toHaveAttribute("data-github-data-source", "live");
    first.unmount();

    vi.mocked(getContributionsWithSource).mockResolvedValue({
      data: { totalContributions: 0, weeks: [] },
      source: "fallback",
    });
    await renderPage();
    expect(screen.getByRole("main")).toHaveAttribute("data-github-data-source", "fallback");
  });

  it("alternates section surfaces with no two adjacent sections matching", async () => {
    const { surfaces } = await renderPage();

    expect(surfaces.length).toBeGreaterThan(1);
    for (let i = 0; i < surfaces.length - 1; i++) {
      expect(surfaces[i], `sections ${i} and ${i + 1} collide`).not.toBe(surfaces[i + 1]);
    }
  });

  // The empty-repos path. `OpenSourceSection` used to suppress itself at render
  // time, which silently re-phased the surface alternation for every section
  // below it. The decision now lives here, before surfaces are assigned.
  it("drops the Open Source section when there are no repos", async () => {
    vi.mocked(getFeaturedReposWithSource).mockResolvedValue({ data: [], source: "fallback" });

    const { surfaces } = await renderPage();

    expect(screen.queryByRole("heading", { name: "Open Source" })).not.toBeInTheDocument();
    // The sections that remain still render, and still alternate.
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    for (let i = 0; i < surfaces.length - 1; i++) {
      expect(surfaces[i], `sections ${i} and ${i + 1} collide`).not.toBe(surfaces[i + 1]);
    }
  });

  it("renders one fewer section when Open Source drops out", async () => {
    const withRepos = await renderPage();
    const withRepoCount = withRepos.surfaces.length;
    withRepos.unmount();

    vi.mocked(getFeaturedReposWithSource).mockResolvedValue({ data: [], source: "fallback" });
    const withoutRepos = await renderPage();

    expect(withoutRepos.surfaces.length).toBe(withRepoCount - 1);
  });
});
