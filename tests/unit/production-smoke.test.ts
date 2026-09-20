import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import {
  runProductionSmoke,
  parseCsp,
  cspFromHeadersFile,
  parseSecurityTxt,
} from "@/scripts/check-production-smoke.mjs";

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

/** The policy production is expected to serve, read from the live source of truth. */
const INTENDED_CSP = cspFromHeadersFile(readFileSync(resolve("public/_headers"), "utf8"));

const VALID_SECURITY_TXT = [
  "Contact: mailto:jerry@holland.vip",
  "Expires: 2099-08-31T23:59:59Z",
  "Canonical: https://holland.vip/.well-known/security.txt",
  "Policy: https://github.com/jwh3times/holland-vip/security/policy",
  "",
].join("\n");

async function productionFixture({
  homepageFailures = 0,
  csp = INTENDED_CSP,
  securityTxt = VALID_SECURITY_TXT,
} = {}) {
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
          "content-security-policy": csp,
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
      response.writeHead(200, { "content-type": "text/plain" }).end(securityTxt);
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

/**
 * The reproduction from the security review: a response that keeps the two
 * substrings the old check looked for while opening the policy wide.
 */
describe("Content-Security-Policy verification", () => {
  it("rejects a widened script-src that retains the expected substrings", async () => {
    const urls = await productionFixture({
      csp:
        "default-src 'self'; script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; " +
        "connect-src *; frame-ancestors 'self'",
    });

    const run = runProductionSmoke({ ...urls, logger: () => {} });
    await expect(run).rejects.toThrow(/script-src widened with .*\*/);
    // Both widened directives are named, so one report covers the whole policy.
    await expect(run).rejects.toThrow(/connect-src widened with \*/);
  });

  it("rejects a directive the intended policy does not declare", async () => {
    const urls = await productionFixture({ csp: `${INTENDED_CSP}; object-src *` });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /unexpected directive object-src/
    );
  });

  it("rejects a dropped directive", async () => {
    const urls = await productionFixture({
      csp: INTENDED_CSP.split("; ")
        .filter((directive) => !directive.startsWith("frame-ancestors"))
        .join("; "),
    });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /missing directive frame-ancestors/
    );
  });

  it("rejects a missing header outright", async () => {
    const urls = await productionFixture({ csp: "" });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /missing security header content-security-policy/
    );
  });

  it("accepts reordered directives and differing case", async () => {
    const reordered = INTENDED_CSP.split("; ").reverse().join("; ").toUpperCase();
    const urls = await productionFixture({ csp: reordered });

    // Directive names and keyword sources are case-insensitive, and order is
    // not meaningful, so neither should be a smoke-test failure.
    await expect(runProductionSmoke({ ...urls, logger: () => {} })).resolves.toBeUndefined();
  });
});

describe("security.txt verification", () => {
  it("rejects a body missing its Contact field", async () => {
    const urls = await productionFixture({
      securityTxt: VALID_SECURITY_TXT.split("\n")
        .filter((line) => !line.startsWith("Contact:"))
        .join("\n"),
    });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /is missing contact/
    );
  });

  it("rejects a body missing its Policy field", async () => {
    const urls = await productionFixture({
      securityTxt: VALID_SECURITY_TXT.split("\n")
        .filter((line) => !line.startsWith("Policy:"))
        .join("\n"),
    });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /is missing policy/
    );
  });

  it("rejects an expiry in the past", async () => {
    const urls = await productionFixture({
      securityTxt: VALID_SECURITY_TXT.replace("2099-08-31T23:59:59Z", "2000-01-01T00:00:00Z"),
    });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(/expired at/);
  });

  it("rejects an unparseable expiry", async () => {
    const urls = await productionFixture({
      securityTxt: VALID_SECURITY_TXT.replace("2099-08-31T23:59:59Z", "whenever"),
    });

    await expect(runProductionSmoke({ ...urls, logger: () => {} })).rejects.toThrow(
      /unparseable Expires/
    );
  });

  it("fails once the committed expiry passes, not only when it is malformed", async () => {
    const urls = await productionFixture();

    // The failure mode that arrives with no deploy to notice it.
    await expect(
      runProductionSmoke({ ...urls, logger: () => {}, now: new Date("2100-01-01T00:00:00Z") })
    ).rejects.toThrow(/expired at/);
  });
});

describe("parsers", () => {
  it("reads the CSP out of a _headers file", () => {
    const text = ["/*", "  X-Frame-Options: SAMEORIGIN", "  Content-Security-Policy: a; b"].join(
      "\n"
    );
    expect(cspFromHeadersFile(text)).toBe("a; b");
  });

  it("throws when a _headers file declares no policy", () => {
    expect(() => cspFromHeadersFile("/*\n  X-Frame-Options: SAMEORIGIN")).toThrow(
      /declares no Content-Security-Policy/
    );
  });

  it("parses directives into sorted, lowercased source lists", () => {
    const parsed = parseCsp("Default-Src 'SELF'; img-src  data:   'self' ;");
    expect(parsed.get("default-src")).toEqual(["'self'"]);
    expect(parsed.get("img-src")).toEqual(["'self'", "data:"]);
  });

  it("keeps repeated security.txt fields rather than overwriting them", () => {
    const parsed = parseSecurityTxt("Contact: mailto:a@b.c\nContact: https://example.test\n# note");
    expect(parsed.get("contact")).toEqual(["mailto:a@b.c", "https://example.test"]);
  });
});
