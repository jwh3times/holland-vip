import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Cta } from "@/components/ui/cta";

describe("Cta", () => {
  describe("element derivation", () => {
    it("renders a <button> when no href is given", () => {
      render(<Cta onClick={() => {}}>Try Again</Cta>);
      const el = screen.getByRole("button", { name: "Try Again" });
      expect(el.tagName).toBe("BUTTON");
      expect(el).toHaveAttribute("type", "button");
    });

    it("renders a link for an internal route", () => {
      render(<Cta href="/">Back to Home</Cta>);
      const el = screen.getByRole("link", { name: "Back to Home" });
      expect(el).toHaveAttribute("href", "/");
      expect(el).not.toHaveAttribute("target");
    });

    it("renders an <a> for a hash anchor, without target", () => {
      render(<Cta href="#projects">View My Work</Cta>);
      const el = screen.getByRole("link", { name: "View My Work" });
      expect(el.tagName).toBe("A");
      expect(el).toHaveAttribute("href", "#projects");
      expect(el).not.toHaveAttribute("target");
    });

    it("renders an <a> for mailto, without target", () => {
      render(<Cta href="mailto:jerry@holland.vip">Send Me an Email</Cta>);
      const el = screen.getByRole("link", { name: "Send Me an Email" });
      expect(el).toHaveAttribute("href", "mailto:jerry@holland.vip");
      expect(el).not.toHaveAttribute("target");
    });

    it("opens external hrefs in a new tab with a safe rel", () => {
      render(<Cta href="https://example.com">External</Cta>);
      const el = screen.getByRole("link", { name: "External" });
      expect(el).toHaveAttribute("target", "_blank");
      expect(el).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("variants and sizes", () => {
    it("defaults to the primary variant at md size", () => {
      render(<Cta href="#a">Default</Cta>);
      const el = screen.getByRole("link", { name: "Default" });
      // The design primary: a solid --fg fill with --bg text, inverted by theme, in mono.
      expect(el).toHaveClass("bg-fg", "text-bg", "font-mono", "rounded-lg");
      expect(el).toHaveClass("px-[18px]", "py-3");
    });

    it("renders the secondary variant as an outline", () => {
      render(
        <Cta href="#a" variant="secondary">
          Secondary
        </Cta>
      );
      const el = screen.getByRole("link", { name: "Secondary" });
      expect(el).toHaveClass("border", "border-line2");
      expect(el).not.toHaveClass("bg-fg");
    });

    it("applies the sm size", () => {
      render(
        <Cta href="#a" size="sm">
          Small
        </Cta>
      );
      expect(screen.getByRole("link", { name: "Small" })).toHaveClass("px-3.5", "py-2");
    });

    // The Terminal buttons stay flat: no hover scale, no drop shadow.
    it("neither scales nor casts a shadow", () => {
      render(<Cta href="#a">Flat</Cta>);
      const el = screen.getByRole("link", { name: "Flat" });
      expect(el.className.split(" ").filter((c) => /scale-|shadow/.test(c))).toEqual([]);
    });

    it("carries a focus-visible ring on every variant", () => {
      render(<Cta href="#a">Focusable</Cta>);
      expect(screen.getByRole("link", { name: "Focusable" })).toHaveClass("focus-visible:ring-2");
    });
  });

  it("merges a caller className without dropping the variant", () => {
    render(
      <Cta href="#a" className="custom-class">
        Merged
      </Cta>
    );
    const el = screen.getByRole("link", { name: "Merged" });
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("bg-fg");
  });

  it("fires onClick when the button form is activated", async () => {
    const onClick = vi.fn();
    render(<Cta onClick={onClick}>Try Again</Cta>);
    await userEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
