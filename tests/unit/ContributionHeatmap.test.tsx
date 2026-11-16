import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { career } from "@/content/career";
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
  it("renders a labelled panel with the total and a per-day title", () => {
    render(<ContributionHeatmap calendar={calendar} />);

    expect(screen.getByText(career.contributions.command)).toBeInTheDocument();
    expect(screen.getByText("1,234 contributions")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "1,234 contributions in the last 12 months on GitHub" })
    ).toBeInTheDocument();

    expect(screen.getByTitle("0 on 2026-06-17")).toBeInTheDocument();
    expect(screen.getByTitle("1 on 2026-06-18")).toBeInTheDocument();
    expect(screen.getByTitle("5 on 2026-06-19")).toBeInTheDocument();
  });

  it("pads the first partial week so each day sits on its weekday row", () => {
    render(<ContributionHeatmap calendar={calendar} />);
    expect(screen.getAllByTestId("heat-pad")).toHaveLength(3);
  });

  it("lets a keyboard reach its sideways scroll", () => {
    render(<ContributionHeatmap calendar={calendar} />);
    expect(screen.getByRole("region", { name: "Contribution heatmap" })).toHaveAttribute(
      "tabindex",
      "0"
    );
  });

  it("renders nothing when the calendar is empty", () => {
    const { container } = render(
      <ContributionHeatmap calendar={{ totalContributions: 0, weeks: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
