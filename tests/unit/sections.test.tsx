import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AboutSection,
  TechnicalCapabilities,
  ProblemSolving,
  ProjectsSection,
  ContactSection,
} from "@/components/sections";

// These assertions read from the content modules rather than restating their
// strings. Before the content seam existed, editing the resume broke this file.
import { careerHighlights } from "@/content/about";
import { capabilities } from "@/content/capabilities";
import { challenges, challengeRows } from "@/content/problem-solving";
import { projects, confidentialLabel } from "@/content/projects";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

// The hero and its terminal are covered in hero.test.tsx, and Career & stack in career.test.tsx.
describe("section components", () => {
  it("About renders every career highlight", () => {
    render(<AboutSection number="01" />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    for (const highlight of careerHighlights) {
      expect(screen.getByText(highlight.title)).toBeInTheDocument();
    }
  });

  it("Technical Capabilities renders every capability", () => {
    render(<TechnicalCapabilities number="01" />);
    expect(screen.getByRole("heading", { name: "Technical Capabilities" })).toBeInTheDocument();
    for (const capability of capabilities) {
      expect(screen.getByText(capability.title)).toBeInTheDocument();
    }
  });

  it("Problem Solving renders each challenge with all three rows", () => {
    render(<ProblemSolving number="01" />);
    expect(screen.getByRole("heading", { name: "Problem-Solving Highlights" })).toBeInTheDocument();
    for (const row of challengeRows) {
      expect(screen.getAllByText(row.title)).toHaveLength(challenges.length);
    }
    for (const item of challenges) {
      expect(screen.getByText(item.challenge)).toBeInTheDocument();
      expect(screen.getByText(item.impact)).toBeInTheDocument();
    }
  });

  it("Projects renders as confidential professional work with every bento item", () => {
    render(<ProjectsSection number="01" />);
    expect(screen.getByRole("heading", { name: "Professional Work" })).toBeInTheDocument();
    expect(screen.getByText(confidentialLabel)).toBeInTheDocument();
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  // The page numbers sections by position; a section only forwards what it is handed.
  it.each([
    ["About", AboutSection],
    ["Technical Capabilities", TechnicalCapabilities],
    ["Problem Solving", ProblemSolving],
    ["Projects", ProjectsSection],
    ["Contact", ContactSection],
  ])("%s shows the number it is given rather than choosing one", (_, NumberedSection) => {
    render(<NumberedSection number="07" />);
    expect(screen.getByTestId("section-number")).toHaveTextContent("07");
  });

  it("Contact renders the email link", () => {
    render(<ContactSection number="01" />);
    expect(screen.getByRole("heading", { name: "Get In Touch" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: contact.ctaLabel })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.email}`
    );
  });
});
