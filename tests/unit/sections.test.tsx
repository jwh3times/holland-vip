import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AboutSection,
  ImpactSection,
  ProjectsSection,
  ContactSection,
} from "@/components/sections";

// These assertions read from the content modules rather than restating their
// strings. Before the content seam existed, editing the resume broke this file.
import { bio } from "@/content/about";
import { careerHighlights, technicalAchievements } from "@/content/impact";
import { projects, confidentialLabel } from "@/content/projects";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

// The hero and its terminal are covered in hero.test.tsx, Career & stack in career.test.tsx, and
// Impact in impact.test.tsx.
describe("section components", () => {
  // Its Career Highlights and Technical Achievements moved to Impact.
  it("About renders the Biography and nothing that moved to Impact", () => {
    render(<AboutSection number="01" />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    for (const paragraph of bio) expect(screen.getByText(paragraph)).toBeInTheDocument();
    for (const { title } of [...careerHighlights, ...technicalAchievements]) {
      expect(screen.queryByText(title)).toBeNull();
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
    ["Impact", ImpactSection],
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
