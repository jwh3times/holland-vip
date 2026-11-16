import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
  Section,
  numberAt,
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

  it("prefixes the heading with the number it is given", () => {
    render(
      <Section title="Hobby projects" number="01">
        content
      </Section>
    );
    // The number is visual ordinal, so the heading's accessible name stays the title.
    const heading = screen.getByRole("heading", { level: 2, name: "Hobby projects" });
    expect(within(heading).getByTestId("section-number")).toHaveTextContent("01");
    expect(heading).toHaveTextContent(/^01\s*Hobby projects$/);
  });

  it("renders no number when given none", () => {
    render(<Section title="About Me">content</Section>);
    expect(screen.queryByTestId("section-number")).not.toBeInTheDocument();
  });

  it("puts a heading accessory beside the heading, not inside it", () => {
    render(
      <Section title="Professional work" number="04" accessory={<span>private repos</span>}>
        content
      </Section>
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Professional work" });
    expect(screen.getByText("private repos")).toBeInTheDocument();
    expect(heading).not.toHaveTextContent("private repos");
  });

  it("renders a subtitle between the heading and the content", () => {
    render(
      <Section title="Open Source" subtitle="Pulled live from GitHub.">
        <p>body</p>
      </Section>
    );
    const subtitle = screen.getByText("Pulled live from GitHub.");
    const body = screen.getByText("body");
    expect(
      screen.getByRole("heading").compareDocumentPosition(subtitle) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(subtitle.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("switches the container width", () => {
    const { container: wide } = render(<Section title="A">body</Section>);
    expect(wide.querySelector("section > div")).toHaveClass("max-w-[1240px]");

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

describe("numberAt", () => {
  it("numbers positions from 01, two digits wide", () => {
    expect([0, 1, 2, 3].map(numberAt)).toEqual(["01", "02", "03", "04"]);
    expect(numberAt(9)).toBe("10");
  });
});

describe("section id registry", () => {
  it("exposes every nav id as a section id, so no nav link can point at a missing section", () => {
    for (const id of NAV_SECTION_IDS) {
      expect(SECTION_IDS).toContain(id);
    }
  });

  it("keeps the hero and education anchorable but deliberately out of the nav", () => {
    // Regression guard: #education used to be an orphan anchor nothing linked to.
    // It is still not in the nav — but now that is a recorded decision, not an accident.
    // #top is the hero, which the header's prompt links to rather than a nav entry.
    for (const id of ["top", "education"] as const) {
      expect(SECTION_IDS).toContain(id);
      expect(NAV_SECTION_IDS).not.toContain(id as never);
    }
  });

  it("has no duplicate ids", () => {
    expect(new Set<SectionId>(SECTION_IDS).size).toBe(SECTION_IDS.length);
  });
});
