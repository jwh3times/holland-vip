---
status: accepted
---

# Install the shared skills from jwh3times/skills instead of maintaining copies here

`end-session`, `handoff`, `lets-go`, `ship` and `docs-updater` install from the shared
`jwh3times/skills` repository and are never edited here; what they need to know about this
repository lives in settings files under `docs/agents/` that each skill reads when it runs.
Re-running the install is the update:

```bash
npx skills add jwh3times/skills -s end-session -s handoff -s lets-go -s ship -s docs-updater -a codex --copy -y
npm run sync:agents
```

Each of the owner's repositories carried its own hand-copied version of these skills, and every
copy had drifted, so a fix made in one reached none of the others. The `mattpocock/skills` set stays
forked and owned here. The `docs-updater` subagent becomes the shared skill, its ownership table
becomes the `Doc map` in `docs/agents/docs.md`, `scripts/handoff-map.mjs` is replaced by the copy
installed with `handoff`, and `scripts/lint-agent-neutrality.mjs` joins `scripts/sync-agents.mjs`
as a script copied verbatim from the canonical source and checked in **Build & Lint**.
