# AGENTS.md

Authoritative guidance for coding agents working in this repository.

## Start here

- Inspect `package.json` and the relevant config before restating commands, versions, or thresholds.
- Read [Architecture](docs/architecture.md) when changing page composition, content ownership,
  theming, GitHub build data, testing topology, deployment, releases, or agent synchronization.
- Read [CONTEXT.md](CONTEXT.md) before naming or changing portfolio domain concepts.
- Route work through [Issue tracker](docs/agents/issue-tracker.md); its public/private boundary is
  authoritative.
- This Next.js version may differ from training data. Read the relevant guide under
  `node_modules/next/dist/docs/` before changing Next.js behavior.

## Non-negotiable constraints

- Preserve `output: "export"`; every route and feature must work as a static export.
- Keep runtime environment variables, API routes, server-only behavior, and SSR out of the app.
- Keep images compatible with `images.unoptimized: true`.
- Put static assets in `public/` and reference them with root paths.
- Define Cloudflare Pages security headers only in `public/_headers`; `headers()` in
  `next.config.ts` is ignored for this export.
- Keep CodeQL in GitHub default setup; do not add an advanced CodeQL workflow.
- Keep `.nvmrc` and `package.json#engines.node` aligned.

## Code and content boundaries

- `content/` owns portfolio prose. A resume or copy change should not require editing a section
  component.
- `components/sections/` owns rendering; export sections from `components/sections/index.ts`.
- `components/ui/` owns reusable primitives.
- `app/page.tsx` owns ordered page composition and derives body-section surfaces with
  `surfaceAt(index)`. Sections accept and forward a surface; they do not choose one.
- `components/ui/section.tsx` owns anchor IDs and the section shell. Add navigable IDs to both
  registries and their navigation label; add intentional deep-link-only IDs to `SECTION_IDS` alone.
- `lib/site-config.ts` owns the contact email and social URLs.
- `lib/accent.ts` owns the accent vocabulary and token table. Render accent pills/cards through
  `<Badge accent>` and `<Card accent>` instead of reconstructing their class strings.

## Styling and React patterns

- Compose classes with `cn()` from `@/lib/utils`; use the `@/*` path alias.
- Use semantic utilities backed by CSS variables in `app/globals.css`; keep literal color values
  out of components.
- Use Lucide React as the component icon library. The custom social marks in
  `components/icons/SocialIcons.tsx` are the intentional exception.
- Add `"use client"` only where interactivity requires it.
- Theme-dependent components use the existing `useSyncExternalStore` mount guard from
  `components/mode-toggle.tsx`; render stable placeholder UI until mounted.
- Keep `suppressHydrationWarning` limited to the root `<html>` element.

## GitHub build data

`app/page.tsx` loads featured repositories and contribution history at build time. The shared
policy in `lib/github-fetch.ts` adds the build User-Agent, optionally authenticates with
`GITHUB_TOKEN`, and degrades to committed snapshots. `parseRepos()` and `parseCalendar()` validate
snapshots; malformed snapshots degrade to empty data instead of failing the build.

Keep this path non-throwing and compatible with tokenless builds. The shared GraphQL query remains
plain `.mjs` so the bare-Node seeding script can import it.

## Verification

Use the narrowest relevant check while working, then run the affected fast gates before handoff:

```bash
npm run lint
npm run format:check
node scripts/sync-agents.mjs --check
npm run test:unit:coverage
npm run build
```

Unit/component tests live in `tests/unit/`. Coverage policy is defined only in
`vitest.config.ts`; pure-JSX sections and shells are intentionally verified through seam tests.

Playwright specs live in `tests/`. Select by role, test ID, or ARIA state rather than Tailwind
classes. Local runs cover five projects; CI downloads the build artifact and runs the Chromium
projects against `out/`. `tests/global-setup.ts` rejects a foreign server already holding port
3000—stop that server instead of weakening the check.

## CI, releases, and deployment

- `.github/workflows/ci.yml` owns lint/build, coverage, static-export Playwright, and changelog
  validation.
- `.github/workflows/version.yml` tags every merge to `main`; `scripts/next-version.mjs` is the
  version source of truth.
- `.github/workflows/smoke.yml` checks the deployed site. Cloudflare Bot Fight Mode must stay off
  for GitHub-hosted runners to reach it.
- `.github/workflows/refresh.yml` triggers the Cloudflare Pages deploy hook so baked GitHub data is
  refreshed.
- Cloudflare Pages deploys directly from GitHub. There is no deploy workflow in this repository.

## Documentation ownership

- `README.md`: concise human entry point.
- `docs/architecture.md`: stable technical explanations and pointers.
- `AGENTS.md`: authoritative agent rules; keep always-loaded guidance short.
- `CLAUDE.md` and `.github/copilot-instructions.md`: tool overlays that point here rather than
  copying the architecture.
- `CONTEXT.md`: domain glossary only.
- `CHANGELOG.md`: shipped release history.
- GitHub Issues: all live backlog and decisions requiring action; Markdown plans are not backlogs.
- `private/README.md` and `private/CURRENT.md`: confidential storage contract and current handoff.

Update the owning document when its contract changes. `/ship` invokes `docs-updater` for branch
changes and writes the changelog entry. Run `npm run format` before agent synchronization.

## Agent artifacts

Skills are authored under `.agents/skills/` and mirrored into generated `.claude/skills/`.
Subagents are authored under `.claude/agents/` and transformed into generated `.codex/agents/`.
Edit only the authored side, then run:

```bash
npm run format
npm run sync:agents
node scripts/sync-agents.mjs --check
```

The generator owns `.claude/skills/` and `.codex/`; do not replace these trees with symlinks.

## Private workspace

Maintainers install the ignored independent companion repository with
`npm run bootstrap:private`. Read [Workspace bootstrap](docs/agents/workspace-bootstrap.md) when
setting up a machine, restoring credentials, or checking portability. Public work and private work
have separate Issues, histories, commits, and pushes.

Workflow skills under `.agents/skills/` are authoritative for their flows. Use `/ask-matt` to
choose an engineering workflow, `/ship` when a branch is ready for review, and user-invoked
`/end-session` to record and tidy a session without pushing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
