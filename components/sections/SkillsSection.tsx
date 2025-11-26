const skillCategories = [
  {
    title: "Languages & Frameworks",
    colorClass: "text-blue-600 dark:text-blue-400",
    skills: [
      "Java",
      "C#",
      ".NET",
      "Python",
      "TypeScript",
      "JavaScript",
      "Angular",
      "Node.js",
      "React",
    ],
  },
  {
    title: "Cloud & DevOps",
    colorClass: "text-purple-600 dark:text-purple-400",
    skills: ["AWS", "Azure", "Kubernetes", "Docker", "Jenkins", "GitLab CI/CD", "Git"],
  },
  {
    title: "Databases & Messaging",
    colorClass: "text-green-600 dark:text-green-400",
    skills: ["PostgreSQL", "SQL Server", "Redis", "RabbitMQ", "Geode"],
  },
  {
    title: "Architecture & Design",
    colorClass: "text-orange-600 dark:text-orange-400",
    skills: [
      "REST APIs",
      "Microservices",
      "Multi-Tenancy",
      "Distributed Systems",
      "OAuth/OIDC",
      "Event-Driven Architecture",
    ],
  },
];

function SkillBadge({ skill }: { skill: string }) {
  return (
    <div className="rounded-xl p-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl card-bg-white-transparent ring-1 ring-inset ring-gray-200/70 dark:ring-blue-500/40">
      <p className="text-sm font-semibold text-badge">{skill}</p>
    </div>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" className="section-surface-contrast py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading">
          Skills & Technologies
        </h2>

        <div className="max-w-6xl mx-auto space-y-12">
          {skillCategories.map((category) => (
            <div key={category.title}>
              <h3 className={`text-xl font-semibold mb-4 text-center ${category.colorClass}`}>
                {category.title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
