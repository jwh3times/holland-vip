---
status: accepted
---

# Generate harness-specific agent artifacts from authored sources

Skills are authored under `.agents/skills/` and mirrored to `.claude/skills/`; subagents are
authored under `.claude/agents/` and transformed to `.codex/agents/`. A deterministic generator and
CI drift check replace hand-maintained copies because Claude and Codex share skill content but use
different subagent formats, and earlier text substitution corrupted valid cross-harness references.

_2026-09-25:_ The repository-specific generator (`scripts/lib/agent-sync.mjs` and its wrapper) was
replaced by the shared cross-repository `scripts/sync-agents.mjs`, tested under `node:test` by
`scripts/sync-agents.test.mjs`. The decision above is unchanged; only the implementation moved.
