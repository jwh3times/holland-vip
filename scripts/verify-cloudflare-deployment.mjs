const API_ROOT = "https://api.cloudflare.com/client/v4";
const PRODUCTION_URL = "https://holland.vip/";

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function jsonRequest(fetchImpl, url, token) {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Cloudflare deployment API responded ${response.status}`);
  const body = await response.json();
  if (!body.success || !body.result)
    throw new Error("Cloudflare deployment API returned no result");
  return body.result;
}

async function requireLiveMarker(fetchImpl, url, label) {
  const response = await fetchImpl(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${label} responded ${response.status}`);
  const html = await response.text();
  if (!html.includes('data-github-data-source="live"')) {
    throw new Error(`${label} did not report live GitHub data`);
  }
}

/** Waits for one correlated Pages deployment, then verifies its artifact and production alias. */
export async function verifyCloudflareDeployment({
  deploymentId,
  accountId,
  projectName,
  apiToken,
  fetchImpl = fetch,
  maxAttempts = 80,
  delay = () => new Promise((resolve) => setTimeout(resolve, 15_000)),
} = {}) {
  requireValue(deploymentId, "deployment ID");
  requireValue(accountId, "CLOUDFLARE_ACCOUNT_ID");
  requireValue(projectName, "CLOUDFLARE_PROJECT_NAME");
  requireValue(apiToken, "CLOUDFLARE_API_TOKEN");

  const endpoint = `${API_ROOT}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments/${encodeURIComponent(deploymentId)}`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const deployment = await jsonRequest(fetchImpl, endpoint, apiToken);
    if (deployment.id !== deploymentId)
      throw new Error("Cloudflare returned a different deployment");

    const status = deployment.latest_stage?.status;
    if (status === "failure" || status === "canceled") {
      throw new Error(`Cloudflare deployment ${deploymentId} ended with status ${status}`);
    }
    if (status === "success") {
      if (deployment.environment !== "production") {
        throw new Error(`Cloudflare deployment ${deploymentId} was not a production deployment`);
      }
      await requireLiveMarker(
        fetchImpl,
        requireValue(deployment.url, "deployment URL"),
        "Deployment"
      );
      await requireLiveMarker(fetchImpl, PRODUCTION_URL, "Production homepage");
      return deployment;
    }
    if (attempt < maxAttempts) await delay();
  }
  throw new Error(`Cloudflare deployment ${deploymentId} timed out`);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    const deployment = await verifyCloudflareDeployment({
      deploymentId: process.argv[2],
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      projectName: process.env.CLOUDFLARE_PROJECT_NAME,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
    });
    console.log(`Verified successful production deployment ${deployment.id}.`);
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
