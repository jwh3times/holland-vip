import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpenSourceSection } from "@/components/sections";
import type { Repo } from "@/lib/github";

const repos: Repo[] = [
  {
    name: "apexracers",
    description: "Lap time percentile tracking for iRacing",
    language: "C#",
    stars: 3,
    pushedAt: "2026-06-18T04:32:11Z",
    url: "https://github.com/jwh3times/apexracers",
  },
  {
    name: "GuardianTracker",
    description: null,
    language: "Go",
    stars: 0,
    pushedAt: "2026-01-02T00:00:00Z",
    url: "https://github.com/jwh3times/GuardianTracker",
  },
];

describe("OpenSourceSection", () => {
  it("renders the heading and one outbound card per repo", () => {
    render(<OpenSourceSection repos={repos} />);

    expect(screen.getByRole("heading", { name: "Open Source" })).toBeInTheDocument();

    const apex = screen.getByRole("link", { name: /apexracers/i });
    expect(apex).toHaveAttribute("href", "https://github.com/jwh3times/apexracers");
    expect(apex).toHaveAttribute("target", "_blank");
    expect(apex).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows description, language, stars, and a build-time updated date", () => {
    render(<OpenSourceSection repos={repos} />);

    expect(screen.getByText("Lap time percentile tracking for iRacing")).toBeInTheDocument();
    expect(screen.getByText("C#")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Updated Jun 2026")).toBeInTheDocument();
  });

  it("omits the description for a repo that has none", () => {
    render(<OpenSourceSection repos={[repos[1]]} />);

    expect(screen.getByRole("link", { name: /GuardianTracker/i })).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.queryByText(/Lap time/i)).not.toBeInTheDocument();
  });

  it("renders nothing when there are no repos", () => {
    const { container } = render(<OpenSourceSection repos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
