# Human follow-up

Required human actions left by completed agent work follow the procedure in the installed skills'
`human-follow-up` settings definition (for example
`.agents/skills/end-session/settings/human-follow-up.md`). "Human follow-up actions" in
`docs/agents/issue-tracker.md` explains why each action gets an issue and a wiki runbook.

## Follow-up board

same as Board — `Status` `Todo` while the action waits on the human, `Blocked` when a named
prerequisite must resolve first, `Deferred` for a conditional action parked until its trigger.
