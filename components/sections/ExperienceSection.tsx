const experiences = [
  {
    title: "Senior Web Developer",
    company: "Prometheus Group",
    period: "Jun 2024 - Present",
    location: "Raleigh, NC",
    isCurrent: true,
    colorClass: "blue",
    highlights: [
      "Architecting cloud-hosted web applications using .NET, AWS, Azure with EKS/AKS, RDS, RabbitMQ, and S3/Azure Blob storage",
      "Developing REST APIs with multi-threaded data processing and real-time account management",
      "Leading UI/UX redesign with Angular and TypeScript, mentoring junior developers in TDD and Agile practices",
    ],
  },
  {
    title: "Software Developer",
    company: "SAS Institute",
    period: "Aug 2017 - Apr 2024",
    location: "Cary, NC",
    isCurrent: false,
    colorClass: "purple",
    highlights: [
      "Engineered high-performance data infrastructure with 64-bit architecture upgrade enabling limitless storage capacity",
      "Achieved 11% database query performance improvement and 7% Java execution efficiency gains",
      "Automated CI/CD pipelines increasing developer productivity by 15% with reduced deployment times",
    ],
  },
  {
    title: "Electrical Engineer",
    company: "Humboldt Scientific",
    period: "Jun 2013 - Aug 2017",
    location: "Raleigh, NC",
    isCurrent: false,
    colorClass: "green",
    highlights: [
      "Developed firmware and UI/UX for embedded systems leading to global product line success",
      "Designed PID control algorithms for hydraulic, pneumatic, and motor-driven systems",
      "Reduced Li-Ion battery failure rates from 30% to 5% through optimized circuit design",
    ],
  },
];

const colorMap = {
  blue: {
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
    bullet: "text-blue-500",
  },
  purple: {
    dot: "bg-purple-500",
    ring: "ring-purple-500/20",
    bullet: "text-purple-500",
  },
  green: {
    dot: "bg-green-500",
    ring: "ring-green-500/20",
    bullet: "text-green-500",
  },
};

export function ExperienceSection() {
  return (
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

            {experiences.map((exp, index) => {
              const colors = colorMap[exp.colorClass as keyof typeof colorMap];
              return (
                <div
                  key={index}
                  className={`relative ${index < experiences.length - 1 ? "mb-12" : ""} ml-20`}
                >
                  <div
                    className={`absolute -left-[3.25rem] top-2 w-6 h-6 rounded-full ${colors.dot} border-4 border-white dark:border-slate-900 ring-4 ${colors.ring}`}
                  ></div>
                  <div className="rounded-2xl p-6 card-bg-white-80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-heading">{exp.title}</h3>
                      {exp.isCurrent && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-badge-blue rounded-full text-xs font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-base font-semibold text-label mb-2">{exp.company}</div>
                    <div className="text-sm text-muted mb-4">
                      {exp.period} • {exp.location}
                    </div>
                    <ul className="space-y-2 text-sm text-muted">
                      {exp.highlights.map((highlight, hIndex) => (
                        <li key={hIndex} className="flex items-start">
                          <span className={`mr-2 ${colors.bullet}`}>▸</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
