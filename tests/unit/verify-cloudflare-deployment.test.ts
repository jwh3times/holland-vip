/* oxlint-disable typescript/require-await -- async test doubles intentionally resolve synchronously */
import { describe, expect, it, vi } from "vitest";
import { verifyCloudflareDeployment } from "@/scripts/verify-cloudflare-deployment.mjs";

function response(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => String(body),
  } as unknown as Response;
}

function deployment(status: string) {
  return {
    success: true,
    result: {
      id: "deployment-id",
      environment: "production",
      latest_stage: { status },
      url: "https://deployment.pages.dev/",
    },
  };
}

const options = {
  deploymentId: "deployment-id",
  accountId: "account-id",
  projectName: "holland-vip",
  apiToken: "api-token",
  delay: vi.fn(async () => {}),
};

describe("verifyCloudflareDeployment", () => {
  it("waits for the correlated deployment and verifies its artifact and production", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(deployment("active")))
      .mockResolvedValueOnce(response(deployment("success")))
      .mockResolvedValueOnce(response('data-github-data-source="live"'))
      .mockResolvedValueOnce(response('data-github-data-source="live"'));

    await expect(verifyCloudflareDeployment({ ...options, fetchImpl })).resolves.toMatchObject({
      id: "deployment-id",
    });
    expect(options.delay).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0][0]).toContain("/deployments/deployment-id");
    const request = fetchImpl.mock.calls[0][1] as { headers: Record<string, string> };
    expect(request.headers.Authorization).toBe("Bearer api-token");
  });

  it.each(["failure", "canceled"])("fails clearly when deployment status is %s", async (status) => {
    const fetchImpl = vi.fn(async () => response(deployment(status)));
    await expect(verifyCloudflareDeployment({ ...options, fetchImpl })).rejects.toThrow(status);
  });

  it("fails after the polling limit", async () => {
    const fetchImpl = vi.fn(async () => response(deployment("active")));
    await expect(
      verifyCloudflareDeployment({ ...options, fetchImpl, maxAttempts: 2 })
    ).rejects.toThrow(/timed out/);
  });

  it("rejects a successful deployment whose artifact used fallback data", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(deployment("success")))
      .mockResolvedValueOnce(response('data-github-data-source="fallback"'));
    await expect(verifyCloudflareDeployment({ ...options, fetchImpl })).rejects.toThrow(
      /did not report live GitHub data/
    );
  });
});
