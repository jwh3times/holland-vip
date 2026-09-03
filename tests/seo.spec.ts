import { test, expect } from "@playwright/test";

test.describe("SEO & Metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have proper meta description", async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /Senior Software Engineer/);
  });

  test("should have Open Graph tags", async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogImage = page.locator('meta[property="og:image"]');

    await expect(ogTitle).toHaveAttribute("content", /Jerry Holland/);
    await expect(ogDescription).toHaveAttribute("content", /.+/);
    await expect(ogType).toHaveAttribute("content", "website");
    await expect(ogImage).toHaveAttribute("content", /.+/);
  });

  test("should have Twitter card tags", async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterTitle = page.locator('meta[name="twitter:title"]');

    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");
    await expect(twitterTitle).toHaveAttribute("content", /Jerry Holland/);
  });

  test("should publish canonical Person and WebSite structured data", async ({ page }) => {
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(1);

    const structuredData = JSON.parse((await scripts.textContent()) ?? "") as {
      "@context": string;
      "@graph": Record<string, unknown>[];
    };
    expect(structuredData["@context"]).toBe("https://schema.org");

    const person = structuredData["@graph"].find((entry) => entry["@type"] === "Person");
    expect(person).toEqual({
      "@type": "Person",
      "@id": "https://holland.vip/#person",
      name: "Jerry Holland",
      url: "https://holland.vip",
      email: "mailto:jerry@holland.vip",
      sameAs: ["https://github.com/jwh3times", "https://www.linkedin.com/in/jerryhollandiii"],
    });

    const website = structuredData["@graph"].find((entry) => entry["@type"] === "WebSite");
    expect(website).toEqual({
      "@type": "WebSite",
      "@id": "https://holland.vip/#website",
      name: "Jerry Holland",
      url: "https://holland.vip",
      publisher: { "@id": "https://holland.vip/#person" },
    });
  });

  test("should have canonical viewport meta", async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });

  test("should have theme-color meta tags", async ({ page }) => {
    const themeColorLight = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: light)"]'
    );
    const themeColorDark = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'
    );

    await expect(themeColorLight).toBeAttached();
    await expect(themeColorDark).toBeAttached();
  });

  test("should have manifest link", async ({ page }) => {
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.json");
  });

  test("should expose the build-time GitHub data source", async ({ page }) => {
    await expect(page.locator("main#main-content")).toHaveAttribute(
      "data-github-data-source",
      /^(live|fallback)$/
    );
  });

  test("should reference raster Apple touch and conventional favicon assets", async ({
    page,
    request,
  }) => {
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      "/apple-touch-icon.png"
    );
    await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toBeAttached();

    const [appleTouchIcon, favicon] = await Promise.all([
      request.get("/apple-touch-icon.png"),
      request.get("/favicon.ico"),
    ]);

    await expect(appleTouchIcon).toBeOK();
    expect(appleTouchIcon.headers()["content-type"]).toContain("image/png");
    await expect(favicon).toBeOK();
    expect(favicon.headers()["content-type"]).toContain("image/x-icon");
  });

  test("should expose separate any and maskable raster manifest icons", async ({ request }) => {
    const manifestResponse = await request.get("/manifest.json");
    await expect(manifestResponse).toBeOK();

    const manifest: unknown = await manifestResponse.json();
    expect(manifest).toMatchObject({
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    });
  });

  test("should publish current private vulnerability-reporting instructions", async ({
    request,
  }) => {
    const response = await request.get("/.well-known/security.txt");
    await expect(response).toBeOK();
    expect(response.headers()["content-type"]).toContain("text/plain");

    const body = await response.text();
    expect(body).toContain("Contact: mailto:jerry@holland.vip");
    expect(body).toContain(
      "Contact: https://github.com/jwh3times/holland-vip/security/advisories/new"
    );
    expect(body).toContain("Canonical: https://holland.vip/.well-known/security.txt");
    expect(body).toContain("Policy: https://github.com/jwh3times/holland-vip/security/policy");

    const expires = body.match(/^Expires: (.+)$/m)?.[1];
    expect(expires).toBeDefined();
    expect(Date.parse(expires!)).toBeGreaterThan(Date.now() + 30 * 24 * 60 * 60 * 1000);
  });
});
