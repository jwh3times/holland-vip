---
status: accepted
---

# Track every work item in GitHub rather than in Markdown

GitHub is the canonical destination and source for work state across both repositories: Issues are
the unit of work, the private cross-repository `Holland.VIP` Project board is the only aggregating
view, and draft security advisories carry undisclosed vulnerabilities. The previous handoff file
`private/CURRENT.md` enumerated the active Issues, the next action, and the last verified commits,
which meant a second copy of work state that drifted from the tracker within a day and then had to
be reconciled by hand. Deleting that mirror — rather than refreshing it — removes the drift at its
source, and the board's `Blocked` and `Deferred` statuses carry the parked-work nuance that the
handoff prose previously existed to explain.
