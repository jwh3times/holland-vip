import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("lists the homepage with a build-time lastModified", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(1);
    const [home] = entries;
    expect(home.url).toBe("https://holland.vip/");
    expect(home.changeFrequency).toBe("monthly");
    expect(home.priority).toBe(1.0);
    // Stamped at build time, so it should be a real Date (not the old hardcoded string).
    expect(home.lastModified).toBeInstanceOf(Date);
  });
});
