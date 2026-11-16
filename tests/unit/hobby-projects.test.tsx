import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { HobbyProjectCard, REPLAY_STEP_MS } from "@/components/hobby-project-card";
import { HobbyProjectsSection } from "@/components/sections";
import { hobbyProjects } from "@/content/hobby-projects";
import { HOBBY_PROJECT_REPOS, type Repo } from "@/lib/github";

describe("Hobby Projects content", () => {
  // The fetch allowlist and the cards are two lists of the same four projects: adding a
  // project to one without the other must fail here, not ship a card with no data or a fetch
  // with no card.
  it("names exactly the repositories the build fetches", () => {
    expect(new Set(hobbyProjects.map((project) => project.repo))).toEqual(
      new Set(HOBBY_PROJECT_REPOS)
    );
    expect(hobbyProjects).toHaveLength(HOBBY_PROJECT_REPOS.length);
  });
});

const repo = (name: string, stars: number, pushedAt: string): Repo => ({
  name,
  description: null,
  language: null,
  stars,
  pushedAt,
  url: `https://github.com/jwh3times/${name}`,
});

const cards = () => screen.getAllByRole("article");
const card = (name: string) => screen.getByRole("article", { name });
const metaOf = (name: string) => within(card(name)).queryByText(/pushed \d{4}-\d{2}-\d{2}/);

describe("HobbyProjectsSection", () => {
  it("is the numbered #projects section with its hint and a link to everything on GitHub", () => {
    const { container } = render(<HobbyProjectsSection number="02" repos={[]} />);

    expect(container.querySelector("section#projects")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/^02\s*Hobby projects$/);
    expect(screen.getByText("hover a card to run it ↘")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "see everything on GitHub ↗" })).toHaveAttribute(
      "href",
      "https://github.com/jwh3times"
    );
    expect(container.textContent).not.toMatch(/side project/i);
  });

  it("renders each card with its status, stack, labelled sample output and outbound link", () => {
    render(<HobbyProjectsSection number="01" repos={[]} />);

    for (const project of hobbyProjects) {
      const article = within(card(project.name));
      expect(article.getByText(`● ${project.status}`)).toBeInTheDocument();
      expect(article.getByText(project.oneLiner)).toBeInTheDocument();
      expect(article.getByRole("list", { name: "Stack" }).children).toHaveLength(
        project.stack.length
      );
      expect(article.getByText("sample output")).toBeInTheDocument();
      expect(article.getByText(`$ ${project.cmd}`)).toBeInTheDocument();
      const open = article.getByRole("link", { name: new RegExp(`^open ${project.name}`) });
      expect(open).toHaveAttribute("href", project.url);
      expect(open).toHaveAttribute("target", "_blank");
      expect(open).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("shows repository metadata on every card when live data covers them all", () => {
    render(
      <HobbyProjectsSection
        number="01"
        repos={[
          repo("Nearcited", 3, "2026-11-16T10:12:50Z"),
          repo("causet", 0, "2026-11-15T04:58:40Z"),
          repo("magic-agenda", 1, "2026-10-01T00:00:00Z"),
          repo("PressGolf", 0, "2026-09-30T23:59:59Z"),
        ]}
      />
    );

    expect(cards()).toHaveLength(4);
    expect(metaOf("Nearcited")).toHaveTextContent(/^★ 3 · pushed 2026-11-16$/);
    // Stars appear only when there are any.
    expect(metaOf("causet")).toHaveTextContent(/^pushed 2026-11-15$/);
    expect(metaOf("Magic Agenda")).toHaveTextContent(/^★ 1 · pushed 2026-10-01$/);
    expect(metaOf("Press")).toHaveTextContent(/^pushed 2026-09-30$/);
    // A footer line, beside the card's "open ↗" link.
    expect(metaOf("Press")!.parentElement).toContainElement(
      within(card("Press")).getByRole("link", { name: "open Press" })
    );
  });

  // A fallback build can hold only some snapshots: the cards without one lose only their line.
  it("keeps every card when only some repositories have data", () => {
    render(
      <HobbyProjectsSection number="01" repos={[repo("causet", 2, "2026-11-01T00:00:00Z")]} />
    );

    expect(cards()).toHaveLength(4);
    expect(metaOf("causet")).toHaveTextContent("★ 2 · pushed 2026-11-01");
    expect(metaOf("Nearcited")).toBeNull();
    expect(metaOf("Magic Agenda")).toBeNull();
    expect(metaOf("Press")).toBeNull();
  });

  // Rejected or unavailable repositories never reach the page; a bad fetch removes metadata only.
  it("renders every card, with no metadata, when every repository is rejected", () => {
    render(<HobbyProjectsSection number="01" repos={[]} />);

    expect(cards()).toHaveLength(4);
    for (const project of hobbyProjects) expect(metaOf(project.name)).toBeNull();
  });
});

describe("HobbyProjectCard replay", () => {
  const project = hobbyProjects[0];
  const lineStates = () =>
    [...screen.getByTestId("sample-output").querySelectorAll("[data-line]")].map((line) =>
      line.getAttribute("data-line")
    );
  const states = (shown: number) =>
    project.log.map((_, index) => (index < shown ? "shown" : "hidden"));

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows every line, idle, before anything engages the card", () => {
    render(<HobbyProjectCard project={project} />);
    expect(lineStates()).toEqual(project.log.map(() => "idle"));
  });

  it("replays on hover, one line every 380ms, and goes idle again on leave", () => {
    render(<HobbyProjectCard project={project} />);
    const article = screen.getByRole("article", { name: project.name });

    fireEvent.mouseEnter(article);
    expect(lineStates()).toEqual(states(0));

    act(() => {
      vi.advanceTimersByTime(REPLAY_STEP_MS - 1);
    });
    expect(lineStates()).toEqual(states(0));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(lineStates()).toEqual(states(1));
    act(() => {
      vi.advanceTimersByTime(REPLAY_STEP_MS * 2);
    });
    expect(lineStates()).toEqual(states(3));
    act(() => {
      vi.advanceTimersByTime(REPLAY_STEP_MS * 10);
    });
    expect(lineStates()).toEqual(states(project.log.length));

    fireEvent.mouseLeave(article);
    expect(lineStates()).toEqual(project.log.map(() => "idle"));
  });

  it("replays when keyboard focus enters the card, and stops when it leaves", () => {
    render(<HobbyProjectCard project={project} />);
    const open = screen.getByRole("link", { name: `open ${project.name}` });

    act(() => open.focus());
    expect(lineStates()).toEqual(states(0));
    act(() => {
      vi.advanceTimersByTime(REPLAY_STEP_MS * 2);
    });
    expect(lineStates()).toEqual(states(2));

    act(() => open.blur());
    expect(lineStates()).toEqual(project.log.map(() => "idle"));
  });

  it("restarts the replay from the first line on the next hover", () => {
    render(<HobbyProjectCard project={project} />);
    const article = screen.getByRole("article", { name: project.name });

    fireEvent.mouseEnter(article);
    act(() => {
      vi.advanceTimersByTime(REPLAY_STEP_MS * 3);
    });
    fireEvent.mouseLeave(article);
    fireEvent.mouseEnter(article);
    expect(lineStates()).toEqual(states(0));
  });

  it("shows every line at once under reduced motion, with no replay", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion: reduce"),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList
    );
    render(<HobbyProjectCard project={project} />);

    fireEvent.mouseEnter(screen.getByRole("article", { name: project.name }));
    expect(lineStates()).toEqual(states(project.log.length));
    expect(vi.getTimerCount()).toBe(0);
  });
});
