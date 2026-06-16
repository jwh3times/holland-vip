import { describe, it, expect } from "vitest";
import RootLayout, { metadata, viewport } from "@/app/layout";

describe("RootLayout", () => {
  it("exports site metadata", () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toContain("Senior Software Engineer");
    expect(metadata.manifest).toBe("/manifest.json");
  });

  it("exports viewport configuration", () => {
    expect(viewport.themeColor).toBeDefined();
    expect(viewport.width).toBe("device-width");
  });

  it("builds the document shell around its children", () => {
    const tree = RootLayout({ children: <div>page body</div> });
    expect(tree).toBeTruthy();
    expect(tree.type).toBe("html");
  });
});
