import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { accent, accentAt, ACCENTS, type AccentTokens } from "@/lib/accent";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const TOKEN_KEYS: (keyof AccentTokens)[] = [
  "text",
  "bullet",
  "dot",
  "ring",
  "border",
  "cardBg",
  "badge",
  "iconChip",
];

describe("accent table", () => {
  it("defines every token for every accent", () => {
    for (const key of ACCENTS) {
      for (const token of TOKEN_KEYS) {
        expect(accent[key][token], `${key}.${token}`).toBeTruthy();
      }
    }
  });

  it("gives each accent a distinct value for every token", () => {
    for (const token of TOKEN_KEYS) {
      const values = ACCENTS.map((key) => accent[key][token]);
      expect(new Set(values).size, `${token} collides across accents`).toBe(ACCENTS.length);
    }
  });

  it("names the accent's own colour in each token", () => {
    // Guards against a copy-paste slip like green.dot === "bg-blue-500".
    for (const key of ACCENTS) {
      for (const token of TOKEN_KEYS) {
        expect(accent[key][token], `${key}.${token}`).toContain(key);
      }
    }
  });
});

describe("accentAt", () => {
  it("cycles through the accents in order", () => {
    expect([0, 1, 2, 3, 4, 5].map(accentAt)).toEqual([
      "blue",
      "green",
      "purple",
      "orange",
      "blue",
      "green",
    ]);
  });
});

describe("Badge", () => {
  it("renders its children with the accent's badge tokens", () => {
    render(<Badge accent="purple">Software Development</Badge>);
    const el = screen.getByText("Software Development");
    expect(el).toHaveClass("rounded-full", "text-xs", "font-semibold");
    expect(el.className).toContain("purple");
  });

  it("defaults to the blue accent", () => {
    render(<Badge>Current</Badge>);
    expect(screen.getByText("Current").className).toContain("blue");
  });

  it("merges a caller className", () => {
    render(<Badge className="custom-class">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("custom-class");
  });
});

describe("Card", () => {
  it("uses the neutral surface when given no accent", () => {
    const { container } = render(<Card>body</Card>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass("card-bg-white", "rounded-2xl", "p-6");
  });

  it("swaps to the tinted surface and border when given an accent", () => {
    const { container } = render(<Card accent="green">body</Card>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass("card-bg-green");
    expect(el).not.toHaveClass("card-bg-white");
    expect(el.className).toContain("border-green-200");
  });

  it("switches padding", () => {
    const { container } = render(<Card padding="lg">body</Card>);
    expect(container.firstElementChild).toHaveClass("p-8");
  });

  it("adds the hover lift only when interactive", () => {
    const { container: plain } = render(<Card>body</Card>);
    expect(plain.firstElementChild).not.toHaveClass("hover:shadow-2xl");

    const { container: lift } = render(<Card interactive>body</Card>);
    expect(lift.firstElementChild).toHaveClass("hover:shadow-2xl");
  });

  it("renders its children", () => {
    render(
      <Card>
        <p>the body</p>
      </Card>
    );
    expect(screen.getByText("the body")).toBeInTheDocument();
  });
});
