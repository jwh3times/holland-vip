# Work tracking: GitHub

GitHub is the canonical destination and source for every work item. Issues are the unit of work,
the [Holland.VIP board](https://github.com/users/jwh3times/projects/8) is the single cross-repository
view over them, and draft security advisories carry undisclosed vulnerabilities. Use the `gh` CLI
for all operations and route by disclosure boundary before reading or writing details.

| Information                                          | Destination                                     |
| ---------------------------------------------------- | ----------------------------------------------- |
| Public code, architecture, and contributor guidance  | Public repository                               |
| Durable private prose                                | Private companion repository                    |
| Public task or defect                                | `jwh3times/holland-vip` Issue                   |
| Confidential task, decision, or infrastructure check | `jwh3times/holland-vip-workspace` Issue         |
| Genuine undisclosed vulnerability                    | `jwh3times/holland-vip` draft security advisory |
| Credential or recovery code                          | 1Password                                       |
| Deployed credential copy                             | GitHub or Cloudflare secret store               |
| Required human action left by agent work             | Private Issue plus a private wiki runbook       |

No Markdown file in either repository holds a backlog, a next action, an active-Issue list, or a
status summary. A hand-maintained mirror of Issue state goes stale within a day and then competes
with the tracker it was meant to summarize. To learn what is in flight, query GitHub; do not read a
document about it.

## Conventions

- **Create a public issue**: `gh issue create -R jwh3times/holland-vip --title "..." --body "..."`.
- **Create a private issue**: `gh issue create -R jwh3times/holland-vip-workspace --title "..." --body "..."`.
- **Read an issue**: `gh issue view -R <owner/repo> <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list -R <owner/repo> --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable). `gh issue view <n> --json blockedBy` also lists closed blockers, so filter it: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment -R <owner/repo> <number> --body "..."`
- **Apply / remove labels**: `gh issue edit -R <owner/repo> <number> --add-label "..."` / `--remove-label "..."`

File issues only into the user's own repo. Never file into `mattpocock/skills` (the repo these skills come from) unless the user owns it. In a fork, `gh` can default to the upstream parent, so before the first `gh issue create` of a session, check the target with `gh repo view --json nameWithOwner` and confirm it with the user if it is not their repo.

- **Close**: post the explanation with `gh issue comment -R <owner/repo> <number> --body "..."`, then `gh issue close -R <owner/repo> <number>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.

Use explicit `-R` routing whenever private context is in scope. Inference from `git remote -v` is
acceptable only when the active repository and disclosure boundary are already unambiguous.

On Windows, run authenticated `gh` operations outside the native elevated sandbox so the CLI can
use the host credential manager. Never run `gh auth token`, print a token, copy one into the
workspace, or transfer the CLI login into 1Password manually.

## Project board

The private user-level Project [Holland.VIP](https://github.com/users/jwh3times/projects/8)
(`--owner jwh3times`, number `8`) spans both repositories. It is a view, not a second store: every
item is a real Issue, and closing the Issue closes the item. Add each new Issue in either repository
to the board so one query answers what is in flight.

- **Add an Issue**: `gh project item-add 8 --owner jwh3times --url <issue url>`
- **List the board**: `gh project item-list 8 --owner jwh3times --format json --jq '.items[] | "\(.status // "-")\t\(.content.url)\t\(.title)"'`
- **Read the fields**: `gh project field-list 8 --owner jwh3times`

`Status` carries five options. `Todo` means genuinely startable, so an item that cannot proceed
takes one of the two parked states instead and states its trigger in the Issue body:

| Status        | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| `Todo`        | Ready to start                                       |
| `In Progress` | Actively being worked                                |
| `Blocked`     | Cannot proceed until an external dependency resolves |
| `Deferred`    | Parked by decision; revisit on a stated trigger      |
| `Done`        | Shipped or resolved                                  |

Setting `Status` needs the GraphQL mutation `updateProjectV2ItemFieldValue` with the project id,
item id, field id, and the target option id; `gh project field-list` and `item-list` supply them.

## Human follow-up actions

Every human action agent work leaves follows [`human-follow-up.md`](./human-follow-up.md): a private
issue labelled `ready-for-human` on the board, and a private wiki page with the steps, filed before
the work is reported complete. Never leave one only in a chat report, a handoff file, a changelog
line, or a Markdown to-do. This heading stays so links to it still land.

## Security tickets

A genuine undisclosed vulnerability never becomes an Issue or a board item. Open a draft security
advisory on the public repository (`gh api repos/jwh3times/holland-vip/security-advisories`), which
keeps the report private until publication and can mint a CVE. Dependabot and CodeQL alerts are
already GitHub-native surfaces; triage them in place rather than transcribing them into Issues.
`SECURITY.md` states the reporter-facing process.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number>`, then `gh pr view <number> --comments` (off a TTY, `--comments` prints only the comments, not the body), and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub Issue in the repository selected by the routing table.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.
Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.

## Public repository

jwh3times/holland-vip

## Board

jwh3times 8

## Board fields

- `Status`: `Todo` / `In Progress` / `Blocked` / `Deferred` / `Done`. `Todo` means genuinely
  startable; a `Blocked` item waits on an external dependency and a `Deferred` one is parked by
  decision, and either states its trigger in the issue body.
