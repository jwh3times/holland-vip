import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ImpactSection } from "@/components/sections";
import { capabilities } from "@/content/capabilities";
import { technicalAchievements } from "@/content/impact";
import { challenges } from "@/content/problem-solving";

function renderImpact() {
  render(<ImpactSection number="03" />);
  return within(screen.getByRole("heading", { level: 2, name: "Impact" }).closest("section")!);
}

describe("ImpactSection", () => {
  it("is the numbered #impact section", () => {
    const section = renderImpact();
    const heading = section.getByRole("heading", { level: 2 });
    expect(heading.closest("section")).toHaveAttribute("id", "impact");
    expect(within(heading).getByTestId("section-number")).toHaveTextContent("03");
  });

  // The sign is part of each claim and stored with its value: the accent only colours it, so
  // the one reduction reads as negative whatever colour its card takes.
  it("shows every Career Highlight with its signed value", () => {
    const section = renderImpact();
    const items = within(section.getByRole("list", { name: "Career Highlights" })).getAllByRole(
      "listitem"
    );

    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^\+15%Developer Productivity Increase/),
      expect.stringMatching(/^\+11%Query Performance Improvement/),
      expect.stringMatching(/^\+7%Execution Efficiency Gain/),
      expect.stringMatching(/^−83%Failure Rate Reduction/),
    ]);
  });

  it("shows each Problem-Solving Highlight as a numbered case with its metric and ERR / FIX / OK", () => {
    const section = renderImpact();
    const cases = within(
      section.getByRole("list", { name: "Problem-Solving Highlights" })
    ).getAllByRole("listitem");

    expect(cases.map((item) => within(item).getByTestId("case-header").textContent)).toEqual([
      "case #001−75%",
      "case #00245s → 3s",
      "case #003−95%",
    ]);
    for (const [index, item] of cases.entries()) {
      const { challenge, solution, impact } = challenges[index];
      expect(within(item).getByText(challenge).closest("[data-block]")).toHaveTextContent(
        `ERR${challenge}`
      );
      expect(within(item).getByText(solution).closest("[data-block]")).toHaveTextContent(
        `FIX${solution}`
      );
      expect(within(item).getByText(impact).closest("[data-block]")).toHaveTextContent(
        `OK${impact}`
      );
    }
    expect(section.queryByText(/incident/i)).toBeNull();
  });

  it("shows every Technical Capability with all of its items", () => {
    const section = renderImpact();
    const list = within(section.getByRole("list", { name: "Technical Capabilities" }));

    expect(list.getAllByRole("listitem", { name: /./ })).toHaveLength(capabilities.length);
    for (const capability of capabilities) {
      const group = within(list.getByRole("listitem", { name: capability.title }));
      for (const item of capability.items) expect(group.getByText(item)).toBeInTheDocument();
    }
  });

  it("shows every Technical Achievement with all of its items", () => {
    const section = renderImpact();
    const list = within(section.getByRole("list", { name: "Technical Achievements" }));

    expect(list.getAllByRole("listitem", { name: /./ })).toHaveLength(technicalAchievements.length);
    for (const achievement of technicalAchievements) {
      const card = within(list.getByRole("listitem", { name: achievement.title }));
      for (const item of achievement.items) expect(card.getByText(item)).toBeInTheDocument();
    }
  });
});
