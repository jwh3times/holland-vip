import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  TechnicalCapabilities,
  ProblemSolving,
  ExperienceSection,
  ProjectsSection,
  EducationSection,
  ContactSection,
} from "@/components/sections";

// These assertions read from the content modules rather than restating their
// strings. Before the content seam existed, editing the resume broke this file.
import { hero } from "@/content/hero";
import { careerHighlights, exploringTags, exploringHeading } from "@/content/about";
import { skillCategories } from "@/content/skills";
import { capabilities } from "@/content/capabilities";
import { challenges, challengeRows } from "@/content/problem-solving";
import { experiences } from "@/content/experience";
import { projects, confidentialLabel } from "@/content/projects";
import { education } from "@/content/education";
import { contact } from "@/content/contact";
import { siteConfig } from "@/lib/site-config";

describe("section components", () => {
  it("Hero renders the headline and social links", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(hero.name);
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    for (const cta of hero.ctas) {
      expect(screen.getByRole("link", { name: cta.label })).toHaveAttribute("href", cta.href);
    }
  });

  it("About renders every career highlight and exploring tag", () => {
    render(<AboutSection />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByText(exploringHeading)).toBeInTheDocument();
    for (const highlight of careerHighlights) {
      expect(screen.getByText(highlight.title)).toBeInTheDocument();
    }
    for (const tag of exploringTags) {
      expect(screen.getByText(tag.label)).toBeInTheDocument();
    }
  });

  it("Skills renders every category and skill", () => {
    render(<SkillsSection />);
    expect(screen.getByRole("heading", { name: "Skills & Technologies" })).toBeInTheDocument();
    for (const category of skillCategories) {
      expect(screen.getByText(category.title)).toBeInTheDocument();
      for (const skill of category.skills) {
        expect(screen.getAllByText(skill).length).toBeGreaterThan(0);
      }
    }
  });

  it("Technical Capabilities renders every capability", () => {
    render(<TechnicalCapabilities />);
    expect(screen.getByRole("heading", { name: "Technical Capabilities" })).toBeInTheDocument();
    for (const capability of capabilities) {
      expect(screen.getByText(capability.title)).toBeInTheDocument();
    }
  });

  it("Problem Solving renders each challenge with all three rows", () => {
    render(<ProblemSolving />);
    expect(screen.getByRole("heading", { name: "Problem-Solving Highlights" })).toBeInTheDocument();
    for (const row of challengeRows) {
      expect(screen.getAllByText(row.title)).toHaveLength(challenges.length);
    }
    for (const item of challenges) {
      expect(screen.getByText(item.challenge)).toBeInTheDocument();
      expect(screen.getByText(item.impact)).toBeInTheDocument();
    }
  });

  it("Experience renders every role and marks the current one", () => {
    render(<ExperienceSection />);
    expect(screen.getByRole("heading", { name: "Professional Experience" })).toBeInTheDocument();
    for (const role of experiences) {
      expect(screen.getByText(role.company)).toBeInTheDocument();
    }
    const current = experiences.filter((r) => r.isCurrent);
    expect(screen.getAllByText("Current")).toHaveLength(current.length);
  });

  it("Projects renders as confidential professional work with every bento item", () => {
    render(<ProjectsSection />);
    expect(screen.getByRole("heading", { name: "Professional Work" })).toBeInTheDocument();
    expect(screen.getByText(confidentialLabel)).toBeInTheDocument();
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it("Education renders the school, logo, degrees, and highlights", () => {
    render(<EducationSection />);
    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByAltText(education.logoAlt)).toBeInTheDocument();
    expect(screen.getByText(education.school)).toBeInTheDocument();
    for (const degree of education.degrees) {
      expect(screen.getByText(degree.name)).toBeInTheDocument();
    }
    for (const highlight of education.highlights) {
      expect(screen.getByText(highlight.label)).toBeInTheDocument();
    }
  });

  it("Contact renders the email link", () => {
    render(<ContactSection />);
    expect(screen.getByRole("heading", { name: "Get In Touch" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: contact.ctaLabel })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.email}`
    );
  });
});
