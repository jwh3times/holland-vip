---
name: lets-go
description: Resume from this repository's active Proton Drive handoff, mark it consumed, and continue the work.
disable-model-invocation: true
---

# Let's go

Pick up the session that `/handoff` wrote on the other machine. `handoff_map.json` in Proton Drive
holds at most one active handoff per repository; `scripts/handoff-map.mjs` locates it on Windows and
Linux and owns every map read and write.

## 1. Find the active handoff

```bash
node scripts/handoff-map.mjs get
```

- **The script cannot find the map** → Proton Drive is not synced or mounted here. Relay its message
  (a non-default mount needs `HANDOFF_DIR`) and stop.
- **`active` is `null`** → tell the user there is no active handoff for `key` and stop.
- **`exists` is `false`** → the map names a document this machine does not have yet, usually a sync
  still in flight. Report the `path`, leave the map untouched, and stop.

Otherwise the handoff is at `path`.

## 2. Read it

Read the whole document. The step is complete when you can state its objective, the branch and HEAD
SHA it names, its unmerged-work list, and its next step.

## 3. Mark it consumed

```bash
node scripts/handoff-map.mjs clear
```

The step is complete when the output shows `active: null` and `previous` equal to the document you
read. The document itself stays in the Handoffs folder as the record.

## 4. Match the workspace

```bash
git fetch --prune origin
git status -sb
git -C private fetch --prune origin
git -C private status -sb
```

- **Local uncommitted work** → show it and ask what to do; it predates the handoff.
- **The handoff names a pushed feature branch** → `git switch <branch>` then
  `git merge --ff-only origin/<branch>`.
- **Otherwise** → `npm run sync:main`.

Compare HEAD with the SHA the handoff names. Anything its unmerged-work list marks _uncommitted_,
_stashed_, or _unpushed_ stayed on the other machine — tell the user now, before work depends on it.

## 5. Proceed

GitHub owns live work state, so re-read the Issues and PRs the handoff references rather than
trusting their status as written. Give the user a short brief — objective, where things stand, any
missing work, and the next step — then invoke the suggested skills and start that next step.
