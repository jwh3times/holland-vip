import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import type { ContributionCalendar } from "@/lib/github-contributions";

const calendar: ContributionCalendar = {
  totalContributions: 1234,
  weeks: [
    // Partial first week starting Wednesday 2026-06-17 → 3 leading pad cells.
    [
      { date: "2026-06-17", count: 0, level: 0 },
      { date: "2026-06-18", count: 1, level: 1 },
      { date: "2026-06-19", count: 5, level: 2 },
    ],
  ],
};

describe("ContributionHeatmap", () => {
  it("renders a labeled image with the total and per-day tooltips", () => {
    render(<ContributionHeatmap calendar={calendar} />);

    expect(screen.getByText("Contribution activity")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /1,234 contributions in the last year on GitHub/i })
    ).toBeInTheDocument();

    // Singular vs plural day tooltips.
    expect(screen.getByTitle("1 contribution on 2026-06-18")).toBeInTheDocument();
    expect(screen.getByTitle("5 contributions on 2026-06-19")).toBeInTheDocument();
  });

  it("renders nothing when the calendar is empty", () => {
    const { container } = render(
      <ContributionHeatmap calendar={{ totalContributions: 0, weeks: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
