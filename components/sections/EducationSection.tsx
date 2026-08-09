import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section, type SectionSurfaceProps } from "@/components/ui/section";

export function EducationSection({ surface }: SectionSurfaceProps) {
  return (
    <Section id="education" title="Education" surface={surface}>
      <div className="max-w-4xl mx-auto">
        <Card padding="lg" interactive>
          <div className="flex items-start gap-6">
            {/* University Logo/Icon */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg overflow-hidden transition-colors duration-300">
                <Image
                  src="/ncsu-logo.jpg"
                  alt="NC State University"
                  width={80}
                  height={80}
                  unoptimized
                  className="object-contain p-1"
                />
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
                  <Badge accent="blue">Embedded Systems</Badge>
                  <Badge accent="purple">Software Development</Badge>
                  <Badge accent="green">Led Senior Design Project</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
