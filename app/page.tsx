import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ModeToggle } from "@/components/mode-toggle";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

const items = [
  {
    title: "Enterprise SaaS Platform Modernization",
    description:
      "Led modernization initiative for legacy enterprise application serving Fortune 500 clients. Migrated from monolithic architecture to containerized microservices on Kubernetes, implemented modern authentication flows, and redesigned data storage architecture. Achieved zero-downtime deployment across multiple customer environments.",
    icon: <IconClipboardCopy className="h-5 w-5" />,
    className: "md:col-span-2",
  },
  {
    title: "Interactive Data Visualization Framework",
    description:
      "Developed sophisticated charting and annotation system for time-series data analysis. Built custom drawing tools, context capture functionality, and client-side image storage using IndexedDB. Enabled users to annotate trends, capture insights, and share analysis across teams.",
    icon: <IconFileBroken className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "High-Performance Data Calculation Engine",
    description:
      "Architected real-time calculation engine processing streaming data with user-defined formulas. Designed intuitive UI for formula configuration, tag mapping, and validation. Implemented multi-threaded execution pipeline ensuring sub-second calculation results.",
    icon: <IconSignature className="h-5 w-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Third-Party System Integration Platform",
    description:
      "Built flexible integration layer connecting multiple enterprise systems via REST APIs. Implemented data synchronization, transformation pipelines, and error recovery mechanisms. Reduced manual data entry by 80% through automated workflows.",
    icon: <IconTableColumn className="h-5 w-5" />,
    className: "md:col-span-2",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation - Enhanced */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold gradient-text-blue">Jerry Holland</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#about"
                className="text-label hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              >
                About
              </a>
              <a
                href="#skills"
                className="text-label hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              >
                Skills
              </a>
              <a
                href="#experience"
                className="text-label hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              >
                Experience
              </a>
              <a
                href="#projects"
                className="text-label hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              >
                Projects
              </a>
              <a
                href="#contact"
                className="text-label hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105"
              >
                Contact
              </a>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <main className="flex-grow">
        <section className="relative overflow-hidden hero-section transition-colors duration-300">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 dark:opacity-20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp text-heading">
                Hi, I'm <span className="gradient-text">Jerry Holland</span>
              </h1>
              <p className="text-2xl md:text-3xl text-subheading mb-6 animate-fadeInUp font-semibold">
                Senior Software Engineer | 12+ Years Experience
              </p>
              <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-10 animate-fadeInUp leading-relaxed">
                Building scalable, high-performance applications with expertise in full-stack
                development, cloud architecture, and system optimization.
              </p>

              {/* Social Links - Enhanced */}
              <div className="flex gap-8 justify-center mb-12 animate-fadeInUp">
                <a
                  href="https://github.com/jwh3times"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-125 transform"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/jerryhollandiii"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-125 transform"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>

              <div className="flex flex-wrap gap-4 justify-center animate-fadeInUp">
                <a
                  href="#projects"
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-10 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  View My Work
                </a>
                <a
                  href="#contact"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white px-10 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
              About Me
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-lg text-muted mb-6 leading-relaxed">
                  Senior Software Engineer with 12 years of experience spanning full-stack
                  development, back-end architecture, and embedded systems. I specialize in building
                  scalable, high-performance applications using modern cloud technologies and
                  microservices architecture.
                </p>
                <p className="text-lg text-muted mb-6 leading-relaxed">
                  Currently working on enterprise cloud infrastructure modernization, migrating
                  legacy systems to modern containerized architectures. Specializing in performance
                  optimization, real-time data processing, and building scalable SaaS solutions for
                  industrial applications. Recent work includes designing RESTful APIs serving
                  millions of daily requests, implementing message queue systems for asynchronous
                  processing, and creating interactive visualization tools for complex datasets.
                </p>
                <p className="text-lg text-muted leading-relaxed">
                  Passionate about performance tuning, system optimization, and mentoring
                  developers. I believe in test-driven development, Agile best practices, and
                  continuous learning to stay at the forefront of technology.
                </p>
              </div>

              {/* Career Highlights */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <div className="rounded-2xl p-6 border border-blue-200 dark:border-slate-700 card-bg-blue transition-colors duration-300">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    15%
                  </div>
                  <div className="text-sm font-semibold text-label mb-1">
                    Developer Productivity Increase
                  </div>
                  <div className="text-xs text-muted">
                    Through CI/CD pipeline automation and improved deployment processes
                  </div>
                </div>

                <div className="rounded-2xl p-6 border border-green-200 dark:border-slate-700 card-bg-green transition-colors duration-300">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    11%
                  </div>
                  <div className="text-sm font-semibold text-label mb-1">
                    Query Performance Improvement
                  </div>
                  <div className="text-xs text-muted">
                    Database optimization reducing execution times across the platform
                  </div>
                </div>

                <div className="rounded-2xl p-6 border border-purple-200 dark:border-slate-700 card-bg-purple transition-colors duration-300">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    7%
                  </div>
                  <div className="text-sm font-semibold text-label mb-1">
                    Execution Efficiency Gain
                  </div>
                  <div className="text-xs text-muted">
                    Java application modernization to latest LTS version
                  </div>
                </div>

                <div className="rounded-2xl p-6 border border-orange-200 dark:border-slate-700 card-bg-orange transition-colors duration-300">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    83%
                  </div>
                  <div className="text-sm font-semibold text-label mb-1">
                    Failure Rate Reduction
                  </div>
                  <div className="text-xs text-muted">
                    Li-Ion battery failures reduced from 30% to 5% through design optimization
                  </div>
                </div>
              </div>

              {/* Recent Technical Achievements */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-center mb-8 text-heading">
                  Recent Technical Achievements
                </h3>
                <div className="space-y-6">
                  <div className="rounded-2xl p-6 border border-blue-200 dark:border-slate-700 card-bg-blue transition-colors duration-300">
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                      Enterprise Cloud Platform Migration
                    </h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>
                          Architected and executed cloud infrastructure migration for multi-tenant
                          SaaS platform
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>
                          Implemented dual authentication provider system with seamless failover
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>Reduced infrastructure costs by 30% while improving scalability</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl p-6 border border-green-200 dark:border-slate-700 card-bg-green transition-colors duration-300">
                    <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">
                      Database Performance Optimization
                    </h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Identified and resolved critical query bottlenecks in high-traffic
                          application
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Optimized complex SQL queries handling 50K+ records with sub-second
                          response times
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Improved overall system performance by 15% through strategic indexing
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl p-6 border border-purple-200 dark:border-slate-700 card-bg-purple transition-colors duration-300">
                    <h4 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                      Real-Time Data Pipeline Architecture
                    </h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Built distributed data collection system processing 100K+ data points per
                          minute
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Implemented robust error handling and retry logic for industrial data
                          sources
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Designed monitoring and alerting system with predictive analytics
                          capabilities
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="section-surface-contrast py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
              Skills & Technologies
            </h2>

            <div className="max-w-6xl mx-auto space-y-12">
              {/* Languages & Frameworks */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center text-blue-600 dark:text-blue-400">
                  Languages & Frameworks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    "Java",
                    "C#",
                    ".NET",
                    "Python",
                    "TypeScript",
                    "JavaScript",
                    "Angular",
                    "Node.js",
                    "React",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40"
                    >
                      <p className="text-sm font-semibold text-badge">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud & DevOps */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center text-purple-600 dark:text-purple-400">
                  Cloud & DevOps
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {["AWS", "Azure", "Kubernetes", "Docker", "Jenkins", "GitLab CI/CD", "Git"].map(
                    (skill) => (
                      <div
                        key={skill}
                        className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40"
                      >
                        <p className="text-sm font-semibold text-badge">{skill}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Databases & Messaging */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center text-green-600 dark:text-green-400">
                  Databases & Messaging
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    "PostgreSQL",
                    "SQL Server",
                    "Redis",
                    "RabbitMQ",
                    "Geode",
                    "MongoDB",
                    "Apache Kafka",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40"
                    >
                      <p className="text-sm font-semibold text-badge">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture & Design */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center text-orange-600 dark:text-orange-400">
                  Architecture & Design
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    "REST APIs",
                    "Microservices",
                    "Multi-Tenancy",
                    "Distributed Systems",
                    "OAuth/OIDC",
                    "Event-Driven Architecture",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40"
                    >
                      <p className="text-sm font-semibold text-badge">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Capabilities Section */}
        <section className="section-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
              Technical Capabilities
            </h2>

            <div className="max-w-6xl mx-auto space-y-8">
              {/* Architecture & Design */}
              <div className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300">
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  Architecture & Design
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="mr-2 text-blue-500 text-xl">•</span>
                    <span className="text-label">
                      Microservices architecture with containerization
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-blue-500 text-xl">•</span>
                    <span className="text-label">Event-driven systems using message queues</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-blue-500 text-xl">•</span>
                    <span className="text-label">Multi-tenant SaaS platform design</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-blue-500 text-xl">•</span>
                    <span className="text-label">RESTful API development with versioning</span>
                  </div>
                </div>
              </div>

              {/* Performance Engineering */}
              <div className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                  Performance Engineering
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="mr-2 text-green-500 text-xl">•</span>
                    <span className="text-label">
                      Database query optimization and indexing strategies
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-green-500 text-xl">•</span>
                    <span className="text-label">
                      Caching layer implementation (distributed & in-memory)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-green-500 text-xl">•</span>
                    <span className="text-label">Multi-threaded data processing</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-green-500 text-xl">•</span>
                    <span className="text-label">Load balancing and horizontal scaling</span>
                  </div>
                </div>
              </div>

              {/* DevOps & Infrastructure */}
              <div className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300">
                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                  DevOps & Infrastructure
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="mr-2 text-purple-500 text-xl">•</span>
                    <span className="text-label">CI/CD pipeline automation and optimization</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-purple-500 text-xl">•</span>
                    <span className="text-label">Container orchestration (Kubernetes)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-purple-500 text-xl">•</span>
                    <span className="text-label">Cloud platform migration strategies</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-purple-500 text-xl">•</span>
                    <span className="text-label">Infrastructure as Code (IaC)</span>
                  </div>
                </div>
              </div>

              {/* Data Engineering */}
              <div className="rounded-2xl p-6 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg transition-colors duration-300">
                <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                  Data Engineering
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="mr-2 text-orange-500 text-xl">•</span>
                    <span className="text-label">Real-time data streaming and processing</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-orange-500 text-xl">•</span>
                    <span className="text-label">Time-series data storage and retrieval</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-orange-500 text-xl">•</span>
                    <span className="text-label">ETL pipeline development</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 text-orange-500 text-xl">•</span>
                    <span className="text-label">Data validation and quality assurance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem-Solving Highlights Section */}
        <section className="section-surface-contrast py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-heading">
              Problem-Solving Highlights
            </h2>

            <div className="max-w-5xl mx-auto space-y-8">
              {/* Challenge 1 */}
              <div className="rounded-2xl p-8 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Challenge</h3>
                    <p className="text-label">
                      Legacy authentication system causing frequent user lockouts and poor session
                      management
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Solution</h3>
                    <p className="text-label">
                      Implemented modern OAuth/OIDC flow with refresh token management and dual
                      authentication provider support for seamless failover
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Impact</h3>
                    <p className="text-label">
                      Reduced authentication support tickets by 75%, improved user satisfaction
                      scores, and enabled single sign-on capabilities
                    </p>
                  </div>
                </div>
              </div>

              {/* Challenge 2 */}
              <div className="rounded-2xl p-8 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Challenge</h3>
                    <p className="text-label">
                      Complex database queries timing out in production, causing application
                      slowdowns and poor user experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Solution</h3>
                    <p className="text-label">
                      Analyzed execution plans, identified bottlenecks, added strategic indexes, and
                      refactored complex CTEs for better query optimization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Impact</h3>
                    <p className="text-label">
                      Reduced query execution time from 45 seconds to under 3 seconds, dramatically
                      improved user experience and system throughput
                    </p>
                  </div>
                </div>
              </div>

              {/* Challenge 3 */}
              <div className="rounded-2xl p-8 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Challenge</h3>
                    <p className="text-label">
                      Manual data import process prone to errors, consuming significant staff time
                      and causing data quality issues
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Solution</h3>
                    <p className="text-label">
                      Built automated import system with comprehensive validation, error recovery
                      mechanisms, and transactional rollback capabilities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-heading mb-2">Impact</h3>
                    <p className="text-label">
                      Eliminated 95% of data import errors, freed up 10+ hours per week of staff
                      time, and improved data quality metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Timeline Section */}
        <section id="experience" className="section-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-heading">
              Professional Experience
            </h2>

            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>

                {/* Prometheus Group */}
                <div className="relative mb-12 ml-20">
                  <div className="absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 ring-4 ring-blue-500/20"></div>
                  <div className="rounded-2xl p-6 card-bg-white-80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-heading">Senior Web Developer</h3>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-badge-blue rounded-full text-xs font-semibold">
                        Current
                      </span>
                    </div>
                    <div className="text-base font-semibold text-label mb-2">Prometheus Group</div>
                    <div className="text-sm text-muted mb-4">Jun 2024 - Present • Raleigh, NC</div>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>
                          Architecting cloud-hosted web applications using .NET, AWS, Azure with
                          EKS/AKS, RDS, RabbitMQ, and S3/Azure Blob storage
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>
                          Developing REST APIs with multi-threaded data processing and real-time
                          account management
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-500">▸</span>
                        <span>
                          Leading UI/UX redesign with Angular and TypeScript, mentoring junior
                          developers in TDD and Agile practices
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* SAS Institute */}
                <div className="relative mb-12 ml-20">
                  <div className="absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full bg-purple-500 border-4 border-white dark:border-slate-900 ring-4 ring-purple-500/20"></div>
                  <div className="rounded-2xl p-6 card-bg-white-80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-heading mb-3">Software Developer</h3>
                    <div className="text-base font-semibold text-label mb-2">SAS Institute</div>
                    <div className="text-sm text-muted mb-4">Aug 2017 - Apr 2024 • Cary, NC</div>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Engineered high-performance data infrastructure with 64-bit architecture
                          upgrade enabling limitless storage capacity
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Achieved 11% database query performance improvement and 7% Java execution
                          efficiency gains
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-500">▸</span>
                        <span>
                          Automated CI/CD pipelines increasing developer productivity by 15% with
                          reduced deployment times
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Humboldt Scientific */}
                <div className="relative ml-20">
                  <div className="absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 ring-4 ring-green-500/20"></div>
                  <div className="rounded-2xl p-6 card-bg-white-80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-heading mb-3">Electrical Engineer</h3>
                    <div className="text-base font-semibold text-label mb-2">
                      Humboldt Scientific
                    </div>
                    <div className="text-sm text-muted mb-4">Jun 2013 - Aug 2017 • Raleigh, NC</div>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Developed firmware and UI/UX for embedded systems leading to global
                          product line success
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Designed PID control algorithms for hydraulic, pneumatic, and motor-driven
                          systems
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-green-500">▸</span>
                        <span>
                          Reduced Li-Ion battery failure rates from 30% to 5% through optimized
                          circuit design
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="section-surface-contrast py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
              Featured Projects
            </h2>
            <BentoGrid className="max-w-4xl mx-auto">
              {items.map((item, i) => (
                <BentoGridItem
                  key={i}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  className={item.className}
                />
              ))}
            </BentoGrid>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="section-surface py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-heading">
              Education
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl p-8 card-bg-white border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  {/* University Logo/Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      NC
                    </div>
                  </div>

                  {/* Education Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-heading mb-2">
                      North Carolina State University
                    </h3>
                    <div className="text-sm text-muted mb-4">Raleigh, NC • Graduated May 2013</div>

                    {/* Degrees */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <span className="font-semibold text-heading">
                            Bachelor of Science in Electrical Engineering
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <div>
                          <span className="font-semibold text-heading">
                            Bachelor of Science in Computer Engineering
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-badge-blue rounded-full text-xs font-semibold">
                          Dual Degree Program
                        </span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-badge-purple rounded-full text-xs font-semibold">
                          Engineering Focus
                        </span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-badge-green rounded-full text-xs font-semibold">
                          Computer Science
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section-surface-contrast py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-heading">Get In Touch</h2>
            <p className="text-lg text-muted mb-8">
              I'm always open to discussing new opportunities, projects, or just having a chat about
              technology.
            </p>
            <a
              href="mailto:jerry@holland.vip"
              className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Send Me an Email
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            {/* Social Links */}
            <div className="flex gap-6">
              <a
                href="https://github.com/YOUR_GITHUB_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-muted">
              &copy; {new Date().getFullYear()} Holland. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
