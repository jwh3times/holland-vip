import * as React from "react";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  TechnicalCapabilities,
  ProblemSolving,
  ExperienceSection,
  ProjectsSection,
  OpenSourceSection,
  EducationSection,
  ContactSection,
} from "@/components/sections";
import { surfaceAt, type SectionSurface } from "@/components/ui/section";
import { getFeaturedRepos } from "@/lib/github";
import { getContributions } from "@/lib/github-contributions";

// Keep the page fully static. Required because the contributions request is a POST,
// which would otherwise opt the route into dynamic rendering — not allowed under
// `output: export`. This has to live on the route segment (Next reads it here, not
// from lib/), so it is the one detail the fetch policy can't own; see the note on
// `githubFetch` in lib/github-fetch.ts.
export const dynamic = "force-static";

export default async function Home() {
  // Resolved at build time (static export). Neither call throws — both go through
  // `withFallback` in lib/github-fetch.ts, which degrades to a committed snapshot.
  const [repos, contributions] = await Promise.all([getFeaturedRepos(), getContributions()]);

  // The page's ordered body sections. Hero sits outside because it carries its own
  // background rather than one of the two alternating surfaces.
  //
  // This list is the single place section order lives, and the surface each section
  // renders on is derived from its position here — a section never picks its own.
  // Sections that don't render are dropped from the list *before* surfaces are
  // assigned, so nothing below them can be re-phased.
  const bodySections: { key: string; render: (surface: SectionSurface) => React.ReactNode }[] = [
    { key: "about", render: (surface) => <AboutSection surface={surface} /> },
    { key: "skills", render: (surface) => <SkillsSection surface={surface} /> },
    { key: "capabilities", render: (surface) => <TechnicalCapabilities surface={surface} /> },
    { key: "problem-solving", render: (surface) => <ProblemSolving surface={surface} /> },
    { key: "experience", render: (surface) => <ExperienceSection surface={surface} /> },
    { key: "projects", render: (surface) => <ProjectsSection surface={surface} /> },
    ...(repos.length > 0
      ? [
          {
            key: "open-source",
            render: (surface: SectionSurface) => (
              <OpenSourceSection surface={surface} repos={repos} contributions={contributions} />
            ),
          },
        ]
      : []),
    { key: "education", render: (surface) => <EducationSection surface={surface} /> },
    { key: "contact", render: (surface) => <ContactSection surface={surface} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <HeroSection />
        {bodySections.map(({ key, render }, index) => (
          <React.Fragment key={key}>{render(surfaceAt(index))}</React.Fragment>
        ))}
      </main>

      <Footer />
    </div>
  );
}
