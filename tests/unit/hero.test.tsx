import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";

import { HeroSection } from "@/components/sections";
import { hero } from "@/content/hero";
import type { ContributionCalendar, ContributionDay } from "@/lib/github-contributions";
import { yearsOfExperience } from "@/lib/site-config";

/** 35 consecutive days whose counts run 1..35, in weeks of seven. */
function calendarOf(totalContributions: number): ContributionCalendar {
  const days: ContributionDay[] = Array.from({ length: 35 }, (_, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, "0")}`,
    count: i + 1,
    level: 1,
  }));
  const weeks = Array.from({ length: 5 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  return { totalContributions, weeks };
}

const calendar = calendarOf(1234);
const emptyCalendar: ContributionCalendar = { totalContributions: 0, weeks: [] };

/** The whole script as the terminal shows it once typing has finished. */
const fullScript = hero.terminal.script.map((line) => line.text).join("");

/** A `matchMedia` stub whose `prefers-reduced-motion: reduce` query answers `reduce`. */
function stubReducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

/** The statistic whose label is `label`: the value sits just before it. */
function stat(label: string) {
  return screen.getByText(label).previousElementSibling?.textContent;
}

describe("HeroSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the name, status, lead and both links from content", () => {
    render(<HeroSection contributions={calendar} />);

    expect(screen.getByRole("heading", { level: 1, name: hero.name })).toBeInTheDocument();
    expect(screen.getByText(hero.status)).toBeInTheDocument();
    expect(screen.getByText(hero.lead)).toBeInTheDocument();
    for (const cta of hero.ctas) {
      expect(screen.getByRole("link", { name: cta.label })).toHaveAttribute("href", cta.href);
    }
  });

  it("shows years of experience and contribution counts from the calendar", () => {
    render(<HeroSection contributions={calendar} />);

    expect(stat(hero.stats.years)).toBe(`${yearsOfExperience}y`);
    expect(stat(hero.stats.contributionsYear)).toBe("1,234");
    // The last 30 of 35 days, whose counts are 6..35.
    expect(stat(hero.stats.contributionsMonth)).toBe("615");
  });

  it("labels the counts as contributions, never commits", () => {
    render(<HeroSection contributions={calendar} />);

    expect(screen.getByText(hero.stats.contributionsYear)).toHaveTextContent(/contributions/);
    expect(screen.getByText(hero.stats.contributionsMonth)).toHaveTextContent(/contributions/);
    expect(screen.queryByText(/commit/i)).not.toBeInTheDocument();
  });

  it("shows a dash rather than zero when there is no calendar", () => {
    render(<HeroSection contributions={emptyCalendar} />);

    expect(stat(hero.stats.contributionsYear)).toBe("—");
    expect(stat(hero.stats.contributionsMonth)).toBe("—");
  });

  it("hides the terminal from assistive technology and exposes the static summary", () => {
    render(<HeroSection contributions={calendar} />);

    expect(screen.getByTestId("hero-terminal")).toHaveAttribute("aria-hidden", "true");
    const summary = screen.getByText(hero.terminal.summary);
    expect(summary.closest("[aria-hidden='true']")).toBeNull();
  });
});

describe("hero terminal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 16, 9, 5, 7));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the full script at once under reduced motion", () => {
    stubReducedMotion(true);
    render(<HeroSection contributions={calendar} />);

    expect(screen.getByTestId("terminal-output")).toHaveTextContent(fullScript, {
      normalizeWhitespace: false,
    });
  });

  it("types the script two characters every 28ms", () => {
    stubReducedMotion(false);
    render(<HeroSection contributions={calendar} />);
    const output = screen.getByTestId("terminal-output");

    expect(output).toHaveTextContent("");
    act(() => {
      vi.advanceTimersByTime(28 * 3);
    });
    expect(output.textContent).toBe(fullScript.slice(0, 6));

    act(() => {
      vi.advanceTimersByTime(28 * fullScript.length);
    });
    expect(output.textContent).toBe(fullScript);
  });

  it("shows a 24-hour clock once mounted", () => {
    stubReducedMotion(false);
    render(<HeroSection contributions={calendar} />);

    expect(screen.getByTestId("terminal-clock")).toHaveTextContent("09:05:07");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("terminal-clock")).toHaveTextContent("09:05:08");
  });

  it("renders no clock or typed text on the server, so hydration matches", () => {
    stubReducedMotion(false);
    const html = renderToString(<HeroSection contributions={calendar} />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const clock = container.querySelector("[data-testid='terminal-clock']");
    const output = container.querySelector("[data-testid='terminal-output']");
    expect(clock?.textContent).toBe("");
    expect(output?.textContent).toBe("");

    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const recoverable = vi.fn();
    act(() => {
      hydrateRoot(container, <HeroSection contributions={calendar} />, {
        onRecoverableError: recoverable,
      });
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(clock?.textContent).toBe("09:05:07");
    container.remove();
  });
});
