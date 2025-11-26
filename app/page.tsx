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
  EducationSection,
  ContactSection,
} from "@/components/sections";

export default function Home() {
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
        <EducationSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
