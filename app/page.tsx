/* oxlint-disable react/no-danger -- Next.js requires serialized JSON-LD in a native script. */
import * as React from "react";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  HeroSection,
  AboutSection,
  CareerSection,
  TechnicalCapabilities,
  ProblemSolving,
  ProjectsSection,
  HobbyProjectsSection,
  ContactSection,
} from "@/components/sections";
import { numberAt } from "@/components/ui/section";
import { getHobbyProjectReposWithSource } from "@/lib/github";
import { getContributionsWithSource } from "@/lib/github-contributions";
import { siteConfig, socialLinks } from "@/lib/site-config";

// Keep the page fully static. Required because the contributions request is a POST,
// which would otherwise opt the route into dynamic rendering — not allowed under
// `output: export`. This has to live on the route segment (Next reads it here, not
// from lib/), so it is the one detail the fetch policy can't own; see the note on
// `githubFetch` in lib/github-fetch.ts.
export const dynamic = "force-static";

const personId = `${siteConfig.url}/#person`;
const homepageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      url: siteConfig.url,
      email: `mailto:${siteConfig.email}`,
      sameAs: socialLinks.map(({ href }) => href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      publisher: { "@id": personId },
    },
  ],
};

// Next.js recommends a native script for JSON-LD and escaping markup-significant
// characters before injecting the serialized payload.
const serializedStructuredData = JSON.stringify(homepageStructuredData).replace(/</g, "\\u003c");

export default async function Home() {
  // Resolved at build time (static export). Neither call throws — both go through
  // `withFallback` in lib/github-fetch.ts, which degrades to a committed snapshot.
  const [repoResult, contributionResult] = await Promise.all([
    getHobbyProjectReposWithSource(),
    getContributionsWithSource(),
  ]);
  const repos = repoResult.data;
  const contributions = contributionResult.data;
  const githubDataSource =
    repoResult.source === "live" && contributionResult.source === "live" ? "live" : "fallback";

  // The page's numbered body sections, in order. Hero sits outside: it carries
  // no number. Until the redesign's later slices replace them, every other
  // section is numbered.
  //
  // This list is the single place section order lives, and each section's number
  // is derived from its position here — a section never picks its own. Every
  // section always renders: missing GitHub data removes only the metadata it feeds.
  const numberedSections: { key: string; render: (number: string) => React.ReactNode }[] = [
    { key: "about", render: (number) => <AboutSection number={number} /> },
    {
      key: "hobby-projects",
      render: (number) => <HobbyProjectsSection number={number} repos={repos} />,
    },
    {
      key: "career",
      render: (number) => <CareerSection number={number} contributions={contributions} />,
    },
    { key: "capabilities", render: (number) => <TechnicalCapabilities number={number} /> },
    { key: "problem-solving", render: (number) => <ProblemSolving number={number} /> },
    { key: "work", render: (number) => <ProjectsSection number={number} /> },
    { key: "contact", render: (number) => <ContactSection number={number} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedStructuredData }}
      />
      <Navigation />

      <main
        id="main-content"
        className="flex-grow"
        tabIndex={-1}
        data-github-data-source={githubDataSource}
      >
        <HeroSection contributions={contributions} />
        {numberedSections.map(({ key, render }, index) => (
          <React.Fragment key={key}>{render(numberAt(index))}</React.Fragment>
        ))}
      </main>

      <Footer />
    </div>
  );
}
