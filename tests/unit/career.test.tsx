import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect, vi, afterAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Durations run to the build date, which the section reads once on import: pin it first.
vi.hoisted(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
});

import { CareerSection } from "@/components/sections";
import { agentSkills, agentSkillsSource } from "@/content/agent-skills";
import { currentExplorations } from "@/content/about";
import { career } from "@/content/career";
import { experiences } from "@/content/experience";
import { skillCategories } from "@/content/skills";
import type { ContributionCalendar } from "@/lib/github-contributions";

const calendar: ContributionCalendar = {
  totalContributions: 42,
  weeks: [[{ date: "2026-11-15", count: 3, level: 1 }]],
};

const current = experiences.find((role) => role.end === null)!;
const sas = experiences.find((role) => role.company === "SAS Institute")!;
const humboldt = experiences.find((role) => role.company === "Humboldt Scientific")!;

function renderCareer(contributions: ContributionCalendar = calendar) {
  render(<CareerSection number="02" contributions={contributions} />);
  return {
    timeline: within(screen.getByRole("list", { name: "Career timeline" })),
    log: within(screen.getByRole("list", { name: "Career log" })),
  };
}

/** The `git log` row's toggle for a company. */
const logRow = (log: ReturnType<typeof renderCareer>["log"], company: string) =>
  log.getByRole("button", { name: new RegExp(`@ ${company}`) });

describe("CareerSection", () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  it("is the numbered #career section", () => {
    renderCareer();
    const heading = screen.getByRole("heading", { level: 2, name: career.title });
    expect(heading.closest("section")).toHaveAttribute("id", "career");
    expect(within(heading).getByTestId("section-number")).toHaveTextContent("02");
  });

  it("lists every role on the timeline, newest first, with its derived duration", () => {
    const { timeline } = renderCareer();
    const rows = timeline.getAllByRole("button");

    expect(rows.map((row) => row.textContent)).toEqual([
      "SoftPro1y",
      "Prometheus Group1y",
      "SAS Institute7y",
      "Humboldt Scientific4y",
    ]);
  });

  it("shows each role in the git log with its hash and period, and marks the current one HEAD", () => {
    const { log } = renderCareer();

    expect(logRow(log, "SoftPro")).toHaveTextContent(
      `${current.hash}Nov 2025 - Present${career.log.head}`
    );
    expect(logRow(log, "SAS Institute")).toHaveTextContent(`${sas.hash}Aug 2017 - Apr 2024`);
    expect(log.getAllByText(career.log.head)).toHaveLength(1);
  });

  it("opens the current role by default, with all five of its highlights", () => {
    const { log } = renderCareer();

    expect(logRow(log, "SoftPro")).toHaveAttribute("aria-expanded", "true");
    expect(logRow(log, "SAS Institute")).toHaveAttribute("aria-expanded", "false");
    expect(current.highlights).toHaveLength(5);
    for (const highlight of current.highlights) {
      expect(log.getByText(highlight)).toBeVisible();
    }
    expect(log.getByText(sas.highlights[0])).not.toBeVisible();
  });

  it("opens the same role in the git log when its timeline row is clicked", async () => {
    const user = userEvent.setup();
    const { timeline, log } = renderCareer();

    await user.click(timeline.getByRole("button", { name: /SAS Institute/ }));

    expect(timeline.getByRole("button", { name: /SAS Institute/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(timeline.getByRole("button", { name: /SoftPro/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(logRow(log, "SAS Institute")).toHaveAttribute("aria-expanded", "true");
    expect(logRow(log, "SoftPro")).toHaveAttribute("aria-expanded", "false");
    expect(log.getByText(sas.highlights[0])).toBeVisible();
  });

  it("closes the open role when its git log row is clicked, leaving none open", async () => {
    const user = userEvent.setup();
    const { timeline, log } = renderCareer();

    await user.click(logRow(log, "SoftPro"));

    expect(logRow(log, "SoftPro")).toHaveAttribute("aria-expanded", "false");
    expect(log.getByText(current.highlights[0])).not.toBeVisible();
    for (const row of timeline.getAllByRole("button")) {
      expect(row).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("opens one role at a time from the git log", async () => {
    const user = userEvent.setup();
    const { log } = renderCareer();

    await user.click(logRow(log, "SAS Institute"));

    expect(logRow(log, "SAS Institute")).toHaveAttribute("aria-expanded", "true");
    expect(logRow(log, "SoftPro")).toHaveAttribute("aria-expanded", "false");
  });

  it("works from the keyboard with Enter and Space", async () => {
    const user = userEvent.setup();
    const { timeline, log } = renderCareer();

    timeline.getByRole("button", { name: /Humboldt Scientific/ }).focus();
    await user.keyboard("{Enter}");
    expect(logRow(log, "Humboldt Scientific")).toHaveAttribute("aria-expanded", "true");
    expect(log.getByText(humboldt.highlights[0])).toBeVisible();

    logRow(log, "Humboldt Scientific").focus();
    await user.keyboard(" ");
    expect(logRow(log, "Humboldt Scientific")).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(logRow(log, "Humboldt Scientific")).toHaveAttribute("aria-expanded", "true");
  });

  it("ends the git log with the one-line Education root", () => {
    renderCareer();
    expect(
      screen.getByText("root: NC State · BS Electrical Eng. + BS Computer Eng. · 2013")
    ).toBeInTheDocument();
  });

  it("renders every skill category as a skills.json key with its skills", () => {
    renderCareer();
    expect(skillCategories).toHaveLength(8);
    expect(screen.getByText(`${skillCategories.length} keys`)).toBeInTheDocument();
    // Each category's title, as a JSON key.
    const keys = [
      "languages",
      "frameworks_ui",
      "cloud_devops",
      "data_messaging",
      "architecture",
      "testing_quality",
      "agentic_engineering",
      "applied_ai",
    ];
    for (const key of keys) {
      expect(screen.getByText(`"${key}"`)).toBeInTheDocument();
    }
    for (const category of skillCategories) {
      for (const skill of category.skills) {
        expect(screen.getByText(`"${skill}"`)).toBeInTheDocument();
      }
    }
  });

  it("lists the six Agent Skills and links to the repository that publishes them", () => {
    renderCareer();
    expect(agentSkills).toHaveLength(6);
    for (const skill of agentSkills) {
      expect(screen.getByText(`${skill.name}/`)).toBeInTheDocument();
      expect(screen.getByText(skill.does)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /jwh3times\/skills/ })).toHaveAttribute(
      "href",
      agentSkillsSource.href
    );
  });

  it("names only Agent Skills installed in this repository", () => {
    // A shared skill renamed upstream leaves the panel naming one that no longer installs (#301).
    // Match the directory listing, not existsSync alone: Windows and macOS match paths
    // case-insensitively, so `Open-PR` would pass there and fail on Linux.
    const skillsDir = resolve(".agents", "skills");
    const installedNames = readdirSync(skillsDir);
    const missing = agentSkills
      .map((skill) => skill.name)
      .filter(
        (name) => !installedNames.includes(name) || !existsSync(join(skillsDir, name, "SKILL.md"))
      );
    expect(installedNames).not.toHaveLength(0);
    expect(agentSkills).not.toHaveLength(0);
    expect(missing).toEqual([]);
  });

  it("marks every Current Exploration as exploratory", () => {
    renderCareer();
    expect(screen.getByText(career.exploring.heading)).toBeInTheDocument();
    for (const exploration of currentExplorations) {
      expect(screen.getByText(`[~] ${exploration.label}`)).toBeInTheDocument();
    }
  });

  it("renders the contribution heatmap", () => {
    renderCareer();
    expect(screen.getByRole("img", { name: /42 contributions/ })).toBeInTheDocument();
    expect(screen.getByTitle("3 on 2026-11-15")).toBeInTheDocument();
  });

  it("leaves the heatmap out when there is no calendar", () => {
    renderCareer({ totalContributions: 0, weeks: [] });
    expect(screen.queryByRole("img", { name: /contributions/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: career.title })).toBeInTheDocument();
  });
});
