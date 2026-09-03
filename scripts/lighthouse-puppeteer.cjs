/**
 * Keep Lighthouse CI on its Puppeteer-managed browser path.
 *
 * chrome-launcher can race Chromium profile cleanup on Windows after a successful
 * audit. Supplying a Puppeteer hook makes LHCI reuse one browser for collection,
 * which avoids that platform-specific teardown path. No page preparation is
 * otherwise required for this public static site.
 */
module.exports = async function prepareLighthousePage() {};
