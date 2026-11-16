import type { SectionId } from "@/components/ui/section";
import { aboutCopy, bio } from "@/content/about";

/**
 * The Biography as a README panel: the narrative after the evidence. Unnumbered and out of the
 * nav, but `#about` stays anchorable so old links still land here.
 */
export function AboutSection() {
  return (
    <section
      id={"about" satisfies SectionId}
      className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-10 pb-14"
    >
      <div className="flex flex-wrap gap-6 rounded-xl border border-line bg-panel p-6">
        <div className="flex-[1_1_200px] font-mono text-[13px] leading-[1.9]">
          <div className="text-dim">{aboutCopy.file}</div>
          <h2 className="mt-1 font-sans text-[22px] font-bold tracking-[-0.02em] text-fg">
            {aboutCopy.title}
          </h2>
        </div>
        <div className="flex min-w-0 flex-[3_1_460px] flex-col gap-3.5 text-[15px] leading-[1.65] text-pretty text-mute">
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
