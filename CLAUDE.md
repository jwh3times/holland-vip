# CLAUDE.md

@AGENTS.md

`AGENTS.md` is the authoritative project guidance. Follow it before editing code or documentation.
Use the pointers there to load architecture, domain, issue-routing, and workspace-recovery context
only when the task reaches those branches.

Claude-specific skills and agents are generated or authored according to the source mapping in
`AGENTS.md`; edit the authored source and run `npm run sync:agents` rather than changing generated
files.
