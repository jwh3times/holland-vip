import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  Section,
  surfaceAt,
  NAV_SECTION_IDS,
  SECTION_IDS,
  type SectionId,
} from "@/components/ui/section";

describe("Section", () => {
  it("renders the title as the section heading", () => {
    render(<Section title="About Me">content</Section>);
    expect(screen.getByRole("heading", { level: 2, name: "About Me" })).toBeInTheDocument();
  });

  it("sets the anchor id when given one, and omits the attribute otherwise", () => {
    const { container: withId } = render(
      <Section title="About Me" id="about">
        content
      </Section>
    );
    expect(withId.querySelector("section")).toHaveAttribute("id", "about");

    const { container: withoutId } = render(<Section title="Capabilities">content</Section>);
    expect(withoutId.querySelector("section")).not.toHaveAttribute("id");
  });

  it("maps the surface prop onto the two alternating background classes", () => {
    const { container: a } = render(
      <Section title="A" surface="surface">
        content
      </Section>
    );
    expect(a.querySelector("section")).toHaveClass("section-surface");

    const { container: b } = render(
      <Section title="B" surface="contrast">
        content
      </Section>
    );
    expect(b.querySelector("section")).toHaveClass("section-surface-contrast");
  });

  it("defaults to the base surface", () => {
    const { container } = render(<Section title="A">content</Section>);
    expect(container.querySelector("section")).toHaveClass("section-surface");
  });

  it("renders a subtitle between the heading and the content, tightening the heading margin", () => {
    const { container } = render(
      <Section title="Open Source" subtitle="Pulled live from GitHub.">
        <p>body</p>
      </Section>
    );
    expect(screen.getByText("Pulled live from GitHub.")).toBeInTheDocument();
    expect(container.querySelector("h2")).toHaveClass("mb-4");
  });

  it("uses the roomier heading margin when there is no subtitle", () => {
    const { container } = render(<Section title="Education">body</Section>);
    expect(container.querySelector("h2")).toHaveClass("mb-12");
  });

  it("switches the container width", () => {
    const { container: wide } = render(<Section title="A">body</Section>);
    expect(wide.querySelector("section > div")).toHaveClass("max-w-7xl");

    const { container: narrow } = render(
      <Section title="B" width="narrow">
        body
      </Section>
    );
    expect(narrow.querySelector("section > div")).toHaveClass("max-w-3xl", "text-center");
  });

  it("renders its children", () => {
    render(
      <Section title="A">
        <p>the body</p>
      </Section>
    );
    expect(screen.getByText("the body")).toBeInTheDocument();
  });
});

describe("surfaceAt", () => {
  it("alternates, starting on the base surface", () => {
    expect([0, 1, 2, 3, 4].map(surfaceAt)).toEqual([
      "surface",
      "contrast",
      "surface",
      "contrast",
      "surface",
    ]);
  });

  it("never returns the same surface for adjacent positions", () => {
    for (let i = 0; i < 20; i++) {
      expect(surfaceAt(i)).not.toBe(surfaceAt(i + 1));
    }
  });
});

describe("section id registry", () => {
  it("exposes every nav id as a section id, so no nav link can point at a missing section", () => {
    for (const id of NAV_SECTION_IDS) {
      expect(SECTION_IDS).toContain(id);
    }
  });

  it("keeps education anchorable but deliberately out of the nav", () => {
    // Regression guard: #education used to be an orphan anchor nothing linked to.
    // It is still not in the nav — but now that is a recorded decision, not an accident.
    expect(SECTION_IDS).toContain("education");
    expect(NAV_SECTION_IDS).not.toContain("education" as never);
  });

  it("has no duplicate ids", () => {
    expect(new Set<SectionId>(SECTION_IDS).size).toBe(SECTION_IDS.length);
  });
});
