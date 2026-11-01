# Development flow

The flow itself is `.agents/skills/ship/settings/dev-flow.md`, and `AGENTS.md` summarizes it. This file holds what this repository
adds.

## Docs and agent config

- `.github/ISSUE_TEMPLATE/`

## `content/` is code

`content/` is code even for a copy edit, Markdown included, because it compiles into the shipped site.

## `/ship` and `/implement`

`/ship` closes `/implement`, which invokes it once the branch is complete; it ends the branch rather
than opening a new phase.
