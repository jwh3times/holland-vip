import type { MetadataRoute } from "next";

// `output: export` requires route handlers to be statically resolvable; this
// pins the sitemap to build time so `new Date()` is stamped once during the
// export rather than evaluated per-request.
export const dynamic = "force-static";

// Generated at build time (emitted to out/sitemap.xml by the static export) so
// <lastmod> always reflects the latest deploy instead of a hand-maintained date
// that silently goes stale. Add an entry here when a new indexable route ships.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://holland.vip/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
