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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <TechnicalCapabilities />
        <ProblemSolving />
        <ExperienceSection />
        <ProjectsSection />
        <OpenSourceSection repos={repos} contributions={contributions} />
        <EducationSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
