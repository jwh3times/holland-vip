### Added

- `docs/agents/guard.md` lists the commands and paths the shared `scripts/guard.mjs` guard stops in
  this repository on top of its shared rules: printing the GitHub CLI token, `npx skills update`,
  force-staging or submoduling the private companion, closing a security advisory, and protected
  local paths (`private/`, env files, local Claude settings, `node_modules/`), with a Playwright
  browser install and a rebase asking first. The docs map names it. No site behavior changes.
