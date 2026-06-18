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

describe("section components", () => {
  it("Hero renders the headline and social links", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Jerry Holland");
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("About renders the heading, career highlights, and the currently-exploring block", () => {
    render(<AboutSection />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByText("Developer Productivity Increase")).toBeInTheDocument();
    expect(screen.getByText("Currently exploring")).toBeInTheDocument();
    expect(screen.getByText("Agentic AI dev workflows")).toBeInTheDocument();
  });

  it("Skills renders the technology categories", () => {
    render(<SkillsSection />);
    expect(screen.getByRole("heading", { name: "Skills & Technologies" })).toBeInTheDocument();
    expect(screen.getByText("Languages & Frameworks")).toBeInTheDocument();
  });

  it("Technical Capabilities renders its heading", () => {
    render(<TechnicalCapabilities />);
    expect(screen.getByRole("heading", { name: "Technical Capabilities" })).toBeInTheDocument();
  });

  it("Problem Solving renders challenge entries", () => {
    render(<ProblemSolving />);
    expect(screen.getByRole("heading", { name: "Problem-Solving Highlights" })).toBeInTheDocument();
    expect(screen.getAllByText("Challenge").length).toBeGreaterThan(0);
  });

  it("Experience renders roles and marks the current one", () => {
    render(<ExperienceSection />);
    expect(screen.getByRole("heading", { name: "Professional Experience" })).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("SAS Institute")).toBeInTheDocument();
  });

  it("Projects renders as confidential professional work with the bento grid items", () => {
    render(<ProjectsSection />);
    expect(screen.getByRole("heading", { name: "Professional Work" })).toBeInTheDocument();
    expect(screen.getByText("Confidential")).toBeInTheDocument();
    expect(screen.getByText("Enterprise SaaS Platform Modernization")).toBeInTheDocument();
  });

  it("Education renders the school and logo", () => {
    render(<EducationSection />);
    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByAltText("NC State University")).toBeInTheDocument();
  });

  it("Contact renders the email link", () => {
    render(<ContactSection />);
    expect(screen.getByRole("heading", { name: "Get In Touch" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send Me an Email" })).toHaveAttribute(
      "href",
      "mailto:jerry@holland.vip"
    );
  });
});
