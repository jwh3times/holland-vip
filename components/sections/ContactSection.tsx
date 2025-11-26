export function ContactSection() {
  return (
    <section id="contact" className="section-surface-contrast py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-heading">Get In Touch</h2>
        <p className="text-lg text-muted mb-8">
          I&apos;m always open to discussing new opportunities, projects, or just having a chat
          about technology.
        </p>
        <a
          href="mailto:jerry@holland.vip"
          className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Send Me an Email
        </a>
      </div>
    </section>
  );
}
