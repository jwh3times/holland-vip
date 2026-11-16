/* oxlint-disable typescript/require-await -- async module test doubles intentionally resolve synchronously */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "@/app/page";
import { ThemeProvider } from "@/components/theme-provider";
import { SECTION_IDS } from "@/components/ui/section";
import { getHobbyProjectReposWithSource } from "@/lib/github";
import { getContributionsWithSource } from "@/lib/github-contributions";

// Stub the build-time GitHub fetch so the async page renders deterministically
// without hitting the network.
vi.mock("@/lib/github", () => ({
  getHobbyProjectReposWithSource: vi.fn(async () => ({
    data: [
      {
        name: "causet",
        description: "An experimental causal source-control layer over Git",
        language: "Rust",
        stars: 1,
        pushedAt: "2026-11-16T00:00:00Z",
        url: "https://github.com/jwh3times/causet",
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
  name: "causet",
  description: "An experimental causal source-control layer over Git",
  language: "Rust",
  stars: 1,
  pushedAt: "2026-11-16T00:00:00Z",
  url: "https://github.com/jwh3times/causet",
};

/** Render the page and read each numbered section heading, in page order. */
async function renderPage() {
  const ui = await Home();
  const view = render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {ui}
    </ThemeProvider>
  );
  const numbered = screen
    .getAllByTestId("section-number")
    .map((number) => [number.textContent, number.closest("h2")?.textContent?.slice(2)]);
  return { ...view, numbered };
}

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(getHobbyProjectReposWithSource).mockResolvedValue({
      data: [repoFixture],
      source: "live",
    });
    vi.mocked(getContributionsWithSource).mockResolvedValue({
      data: { totalContributions: 0, weeks: [] },
      source: "live",
    });
  });

  it("composes navigation, main content, and the status bar", async () => {
    const ui = await Home();
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        {ui}
      </ThemeProvider>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByText("Jerry Holland").length).toBeGreaterThan(0);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/UTF-8 · LF/);
    expect(screen.queryByText(/All rights reserved/i)).toBeNull();
    expect(screen.getByRole("heading", { name: /Hobby projects/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Open Source/ })).not.toBeInTheDocument();
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

  it("numbers the four body sections 01–04 in page order, with About and Contact after them", async () => {
    const { numbered } = await renderPage();

    // The hero, About and Contact carry no number.
    expect(numbered).toEqual([
      ["01", "Hobby projects"],
      ["02", "Career & stack"],
      ["03", "Impact"],
      ["04", "Professional work"],
    ]);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings.slice(-2)).toEqual(["About", "Contact"]);
    expect(
      within(screen.getByRole("heading", { level: 1 })).queryByTestId("section-number")
    ).toBeNull();
  });

  // A bad fetch removes repository metadata, never a section or a card.
  it("keeps Hobby projects and all four cards when no repository data is available", async () => {
    vi.mocked(getHobbyProjectReposWithSource).mockResolvedValue({ data: [], source: "fallback" });

    const { numbered } = await renderPage();

    expect(numbered.map(([, title]) => title)).toContain("Hobby projects");
    const section = screen.getByRole("heading", { name: /Hobby projects/ }).closest("section")!;
    expect(within(section).getAllByRole("article")).toHaveLength(4);
    expect(within(section).queryByText(/pushed \d{4}/)).toBeNull();
  });

  it("gives #projects to Hobby projects, #work to Professional work and #about to the Biography", async () => {
    const { container } = await renderPage();

    expect(container.querySelector("section#projects h2")).toHaveTextContent("Hobby projects");
    expect(container.querySelector("section#work h2")).toHaveTextContent("Professional work");
    expect(container.querySelector("section#about h2")).toHaveTextContent("About");
    expect(container.querySelector("section#about")).toHaveTextContent("# README.md");
    expect(container.querySelector("#open-source")).toBeNull();
  });

  it("anchors every nav and deep-link-only id to a rendered section", async () => {
    const { container } = await renderPage();
    for (const id of SECTION_IDS) {
      expect(container.querySelector(`section#${id}`), `no section for #${id}`).not.toBeNull();
    }
  });

  // The header's nav and prompt, and the hero's two buttons.
  it("links every in-page anchor to a section rendered on the page", async () => {
    const { container } = await renderPage();
    const hrefs = [...container.querySelectorAll('a[href^="#"]')].map((link) =>
      link.getAttribute("href")
    );

    expect(hrefs.length).toBeGreaterThan(1);
    for (const href of hrefs) {
      expect(container.querySelector(`section${href}`), `no section for ${href}`).not.toBeNull();
    }
  });

  it("counts the hero's contribution stats from the build-time calendar", async () => {
    vi.mocked(getContributionsWithSource).mockResolvedValue({
      data: {
        totalContributions: 4321,
        weeks: [[{ date: "2026-11-15", count: 7, level: 2 }]],
      },
      source: "fallback",
    });
    await renderPage();

    const hero = within(screen.getByRole("heading", { level: 1 }).closest("section")!);
    expect(hero.getByText("contributions / 12mo").previousElementSibling).toHaveTextContent(
      "4,321"
    );
    expect(hero.getByText("contributions / 30d").previousElementSibling).toHaveTextContent("7");
  });
});
