import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
import { projects, projectsCopy } from "@/content/projects";
import { contact } from "@/content/contact";
import { siteConfig, socialLinks } from "@/lib/site-config";

// The hero and its terminal are covered in hero.test.tsx, Career & stack in career.test.tsx, and
// Impact in impact.test.tsx.
describe("section components", () => {
  // Career Highlights and Technical Achievements belong to Impact, not the Biography.
  it("About renders the Biography as an unnumbered README panel at #about", () => {
    const { container } = render(<AboutSection />);
    const heading = screen.getByRole("heading", { level: 2, name: "About" });
    expect(heading.closest("section")).toHaveAttribute("id", "about");
    expect(screen.getByText("# README.md")).toBeInTheDocument();
    expect(screen.queryByTestId("section-number")).toBeNull();

    expect(bio).toHaveLength(3);
    const paragraphs = [...container.querySelectorAll("p")].map((p) => p.textContent);
    expect(paragraphs).toEqual(bio);
    // The README is the narrative after the evidence: the agent workflow, not the old résumé lead.
    expect(bio[2]).toMatch(/^Off the clock I keep a steady stream of hobby projects going/);
    for (const { title } of [...careerHighlights, ...technicalAchievements]) {
      expect(screen.queryByText(title)).toBeNull();
    }
  });

  it("Professional work renders each project as a private/{slug} cell under the private-repos pill", () => {
    render(<ProjectsSection number="04" />);
    const heading = screen.getByRole("heading", { level: 2, name: projectsCopy.title });
    // The pill sits beside the heading, not inside it.
    expect(heading).not.toHaveTextContent(projectsCopy.privateLabel);
    expect(screen.getByText(projectsCopy.privateLabel)).toBeInTheDocument();
    expect(screen.getByText(projectsCopy.subtitle)).toBeInTheDocument();

    const cells = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(cells).toHaveLength(projects.length);
    cells.forEach((cell, i) => {
      const { slug, title, description } = projects[i];
      expect(cell).toHaveTextContent(`private/${slug}`);
      expect(within(cell).getByRole("heading", { level: 3 })).toHaveTextContent(title);
      expect(cell).toHaveTextContent(description);
    });
    expect(projects.map(({ slug }) => slug)).toEqual([
      "enterprise-saas-platform-modernization",
      "interactive-data-visualization-framework",
      "high-performance-data-calculation-engine",
      "third-party-system-integration-platform",
    ]);
  });

  // The page numbers sections by position; a section only forwards what it is handed.
  it.each([
    ["Impact", ImpactSection],
    ["Projects", ProjectsSection],
  ])("%s shows the number it is given rather than choosing one", (_, NumberedSection) => {
    render(<NumberedSection number="07" />);
    expect(screen.getByTestId("section-number")).toHaveTextContent("07");
  });

  it("Contact is an unnumbered #contact prompt with a large email link and two social buttons", () => {
    render(<ContactSection />);
    const heading = screen.getByRole("heading", { level: 2, name: "Contact" });
    const section = heading.closest("section")!;
    expect(section).toHaveAttribute("id", "contact");
    expect(screen.queryByTestId("section-number")).toBeNull();
    expect(section).toHaveTextContent("$ ./contact.sh");
    expect(screen.getByText(contact.subtitle)).toBeInTheDocument();

    // The ↗ is decoration: the link is named by the address alone.
    expect(screen.getByRole("link", { name: siteConfig.email })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.email}`
    );

    const social = [
      ["github/jwh3times", "https://github.com/jwh3times"],
      ["linkedin/jerryhollandiii", "https://www.linkedin.com/in/jerryhollandiii"],
    ];
    expect(socialLinks.map(({ label, href }) => [label, href])).toEqual(social);
    for (const [label, href] of social) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
    }
  });
});
