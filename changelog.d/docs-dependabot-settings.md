### Added

- `docs/agents/dependabot.md` gives the shared `dependabot` review skill this repository's facts:
  the stack and the Dependabot groups, where each dependency is used (the Tailwind layer in
  `app/globals.css`, the Vitest mocks over `next/*`, `public/_headers`), what a verdict must not get
  wrong (a static export with no server, CSS-first Tailwind, oxlint rather than ESLint), and the
  gates to run for each kind of major. The docs map lists it. No site behavior changes.
