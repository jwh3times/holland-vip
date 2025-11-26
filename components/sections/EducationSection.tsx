export function EducationSection() {
  return (
    <section id="education" className="section-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-heading">Education</h2>

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
  );
}
