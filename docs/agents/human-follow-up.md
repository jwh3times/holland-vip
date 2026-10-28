# Human follow-up

Required human actions left by completed agent work follow the procedure in the installed skills'
`human-follow-up` settings definition (for example
`.agents/skills/end-session/settings/human-follow-up.md`). "Human follow-up actions" in
`docs/agents/issue-tracker.md` explains why each action gets an issue and a wiki runbook.

## Follow-up destination

`jwh3times/holland-vip-workspace` — issues in the private companion, selected explicitly with
`-R`, even for follow-ups from public work.

## Follow-up label

`ready-for-human`

## Follow-up board

same as Board — `Status` `Todo` while the action waits on the human, `Blocked` when a named
prerequisite must resolve first, `Deferred` for a conditional action parked until its trigger.

## Follow-up wiki

The private companion's wiki, `https://github.com/jwh3times/holland-vip-workspace.wiki.git`
(default branch `master`), index page `human-todo`, linked from `Home`. New pages take the shared
`<Topic>-<YYYY-MM-DD>` name; existing `Runbook-` pages keep their names, since issues link to them.
Push without asking. Reference credentials by their 1Password item and field name, never by value.
