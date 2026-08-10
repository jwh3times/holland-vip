---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work. Address every accepted finding and rerun the
relevant checks before committing; code-review reports findings but does not apply fixes.

Commit your work to the current branch.

When this completes the branch, invoke /ship. It refreshes the repo docs, writes the changelog
entry required by CI, regenerates agent artifacts, runs the fast gates, and opens or updates the PR.
