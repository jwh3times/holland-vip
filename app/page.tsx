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

export default async function Home() {
  // Resolved at build time (static export); never throws — see lib/github.ts.
  const repos = await getFeaturedRepos();

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
        <OpenSourceSection repos={repos} />
        <EducationSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
