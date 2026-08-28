# Holland.VIP

Jerry Holland's professional portfolio, built as a statically exported Next.js site and deployed
to [holland.vip](https://holland.vip) through Cloudflare Pages.

## Stack

- Next.js 16+ App Router and React 19
- TypeScript 7
- Tailwind CSS v4 with CSS-defined design tokens
- Vitest and Testing Library for unit/component tests
- Playwright for end-to-end tests
- Oxlint and Prettier

The production artifact is the portable `out/` directory. The application has no API routes,
runtime server, or runtime environment-variable dependency.

## Getting started

Use the Node version pinned in `.nvmrc`:

```bash
git clone https://github.com/jwh3times/holland-vip.git
cd holland-vip
nvm use
npm ci
npm run dev
```

Open <http://localhost:3000>.

The public repository is self-contained. Maintainers restoring confidential workspace context can
install the independent private companion with:

```bash
npm run bootstrap:private
```

See [Workspace bootstrap](docs/agents/workspace-bootstrap.md) for machine recovery and credential
handling.

## Commands

| Command                      | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `npm run dev`                | Start the Next.js development server    |
| `npm run build`              | Build the static export into `out/`     |
| `npm run preview`            | Serve the built static export           |
| `npm run lint`               | Run Oxlint                              |
| `npm run lint:fix`           | Apply safe Oxlint fixes                 |
| `npm run format`             | Format the repository with Prettier     |
| `npm run format:check`       | Check formatting                        |
| `npm run test:unit`          | Run unit and component tests            |
| `npm run test:unit:coverage` | Run the gated V8 coverage suite         |
| `npm test`                   | Run all Playwright projects             |
| `npm run sync:agents`        | Regenerate Claude/Codex agent artifacts |

Playwright starts its own server. Set `E2E_TARGET=build` after `npm run build` to exercise the same
static-export target used in CI.

## Architecture

Site copy lives in typed modules under `content/`; components render it without owning prose.
`app/page.tsx` composes the ordered sections. Build-time GitHub data uses committed, validated
fallback snapshots so tokenless and offline builds still succeed.

Read [Architecture](docs/architecture.md) before changing page composition, theming, the content
boundary, GitHub data fetching, test topology, deployment, or agent-artifact synchronization.
The domain vocabulary is defined in [CONTEXT.md](CONTEXT.md).

## Editing the portfolio

- Copy, roles, skills, and project descriptions: `content/`
- Contact email and social URLs: `lib/site-config.ts`
- Metadata: `app/layout.tsx`
- Page composition: `app/page.tsx`
- Theme tokens and semantic utilities: `app/globals.css`
- Static assets and Cloudflare Pages headers: `public/`

## Deployment and releases

Cloudflare Pages builds `main` with `npm run build` and publishes `out/`. There is intentionally no
GitHub Actions deploy workflow. `public/_headers` is the source of truth for production security
headers.

Every merge to `main` creates a `v<major>.<minor>.<build>` tag and GitHub Release. The release line
comes from `package.json`; `scripts/next-version.mjs` computes the exact version shared by CI, the
release workflow, and `/ship`. Release history lives in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Bug reports, accessibility fixes, and focused improvements are welcome. See
[CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and the private
reporting process in [SECURITY.md](SECURITY.md).

## License

Licensed under the [MIT License](LICENSE).
