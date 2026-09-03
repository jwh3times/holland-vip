import { execFile } from "node:child_process";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { runProductionSmoke } from "@/scripts/check-production-smoke.mjs";

const servers: Server[] = [];
const execFileAsync = promisify(execFile);
const scriptPath = resolve("scripts/check-production-smoke.mjs");

afterEach(
  () =>
    new Promise<void>((resolve) => {
      const server = servers.pop();
      if (!server) return resolve();
      server.close(() => resolve());
    })
);

async function productionFixture({ homepageFailures = 0 } = {}) {
  let homepageAttempts = 0;
  const server = createServer((request, response) => {
    const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

    if (request.url === "/www") {
      response.writeHead(301, { location: `${origin}/` }).end();
      return;
    }

    if (request.url === "/") {
      homepageAttempts += 1;
      if (homepageAttempts <= homepageFailures) {
        response.writeHead(503).end("temporarily unavailable");
        return;
      }
      response
        .writeHead(200, {
          "content-type": "text/html",
          "content-security-policy": "default-src 'self'; frame-ancestors 'self'",
          "strict-transport-security": "max-age=31536000; includeSubDomains",
          "x-content-type-options": "nosniff",
          "x-frame-options": "SAMEORIGIN",
          "x-dns-prefetch-control": "on",
          "referrer-policy": "strict-origin-when-cross-origin",
          "permissions-policy": "camera=(), microphone=(), geolocation=()",
        })
        .end("<html><body>Jerry Holland</body></html>");
      return;
    }

    if (request.url === "/robots.txt") {
      response
        .writeHead(200, { "content-type": "text/plain" })
        .end("Sitemap: https://holland.vip/sitemap.xml\n");
      return;
    }

    if (request.url === "/sitemap.xml") {
      response
        .writeHead(200, { "content-type": "application/xml" })
        .end("<urlset><url><loc>https://holland.vip/</loc></url></urlset>");
      return;
    }

    if (request.url === "/manifest.json") {
      response
        .writeHead(200, { "content-type": "application/manifest+json" })
        .end(JSON.stringify({ name: "Jerry Holland | Senior Software Engineer" }));
      return;
    }

    if (request.url === "/og-image.png") {
      response.writeHead(200, { "content-type": "image/png" }).end("png");
      return;
    }

    if (request.url === "/.well-known/security.txt") {
      response
        .writeHead(200, { "content-type": "text/plain" })
        .end("Canonical: https://holland.vip/.well-known/security.txt\n");
      return;
    }

    response.writeHead(404, { "content-type": "text/html" }).end("<h1>404</h1>");
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  return { siteUrl: `${origin}/`, wwwUrl: `${origin}/www` };
}

describe("runProductionSmoke", () => {
  it("verifies the complete deployed portfolio contract", async () => {
    const urls = await productionFixture();

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).resolves.toBeUndefined();
  });

  it("retries a transient production response", async () => {
    const urls = await productionFixture({ homepageFailures: 2 });

    await expect(
      runProductionSmoke({ ...urls, logger: () => {}, retryDelay: async () => {} })
    ).resolves.toBeUndefined();
  });

  it("runs the deployed contract from the command line", async () => {
    const urls = await productionFixture();

    const { stdout } = await execFileAsync(process.execPath, [
      scriptPath,
      urls.siteUrl,
      urls.wwwUrl,
    ]);

    expect(stdout).toContain("Production smoke check passed.");
  });
});
