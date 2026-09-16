---
# GENERATED — do not edit. Source: .agents/skills/lets-go/SKILL.md. Regenerate: npm run sync:agents
name: lets-go
description: Resume from this repository's active Proton Drive handoff, mark it consumed, and continue the work.
disable-model-invocation: true
---

# Let's go

Pick up the session that `/handoff` wrote on the other machine. `handoff_map.json` in Proton Drive
holds at most one active handoff per repository; `scripts/handoff-map.mjs` locates it on Windows and
Linux and owns every map read and write.

## Transport

Decide once, at the start, how the Handoffs folder reaches this machine:

- **Desktop client** — `~/Proton Drive` exists and the Proton Drive client keeps it in sync. Every
  step marked _(CLI mirror only)_ is skipped.
- **CLI mirror** — `command -v proton-drive` succeeds and `~/Proton Drive` is absent (Fedora: Proton
  ships no Linux sync client). `HANDOFF_DIR` names a local mirror of the cloud folder
  `/my-files/Documents/Handoffs`; nothing syncs it, so the skill pulls the map and the one document
  it names before reading them and pushes the map after clearing it. If `HANDOFF_DIR` is unset, ask
  the user for the mirror folder (for example `~/Documents/Handoffs`), `mkdir -p` it, and export the
  variable for this session; suggest they add it to their shell profile.

Every `proton-drive` command must name a conflict strategy — the CLI prompts otherwise, and a prompt
hangs an agent. Output containing `You need to login first` means the CLI session lapsed: ask the
user to run `proton-drive auth login` themselves, then retry the command.

## 1. Find the active handoff

**Pull** _(CLI mirror only)_ — refresh the local map from the cloud before reading it:

```bash
proton-drive filesystem download -f remove /my-files/Documents/Handoffs/handoff_map.json "$HANDOFF_DIR"
```

Complete when the transfer summary lists the map as downloaded and `$HANDOFF_DIR/handoff_map.json`
exists. Then:

```bash
node scripts/handoff-map.mjs get
```

- **The script cannot find the map** → Proton Drive is not synced or mounted here. Relay its message
  (a non-default mount needs `HANDOFF_DIR`) and stop.
- **`active` is `null`** → tell the user there is no active handoff for `key` and stop.
- **`exists` is `false`, CLI mirror** → download the document the map names, then rerun `get`:

  ```bash
  proton-drive filesystem download -f remove "/my-files/Documents/Handoffs/<active>" "$HANDOFF_DIR"
  ```

  If `exists` is still `false`, the cloud folder lacks the file: report the `path`, leave the map
  untouched, and stop.

- **`exists` is `false`, desktop client** → the map names a document the client has not synced here
  yet. Report the `path`, leave the map untouched, and stop so a retry after sync still works.

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

**Push** _(CLI mirror only)_ — the cleared map goes back to the cloud, so the other machine cannot
resume the same handoff a second time:

```bash
proton-drive filesystem upload -f create-new-revision -t "$HANDOFF_DIR/handoff_map.json" /my-files/Documents/Handoffs
```

Complete when the transfer summary lists the map as uploaded.

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
