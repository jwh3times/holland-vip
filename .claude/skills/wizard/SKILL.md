---
# GENERATED — do not edit. Source: .agents/skills/wizard/SKILL.md — regenerate with 'node scripts/sync-agents.mjs'.
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---

# Wizard

A **wizard** is a bash script that walks a human, step by step, through a manual procedure that's tedious to do by hand and tedious to re-explain to an AI every time. It opens each URL, says exactly what to click and copy, captures the values, routes each one where it belongs (`.env` for configuration, a secret store for credentials), confirms at every stage, and shows how many stages are left. It might configure third-party services, run a one-off migration, or move the project from one state to another.

The delightful UX is already solved by [template.sh](template.sh) — stage-by-stage progress, confirmation gates, cross-platform URL opening (including WSL), hidden secret entry, idempotent `.env` upserts, `gh secret`/`gh variable` writes, and a closing summary. **Your job is only to scope the procedure and author its stages.** The library above the `STAGES` marker is identical in every wizard; that consistency is the point — never hand-edit it.

## Where a captured value goes

This project's storage contract keeps credential **values** in 1Password or a deployed secret store, and prohibits resolved `.env` files. A wizard captures credentials, so the rule is load-bearing here, not background reading. A plaintext secret in `.env` is one `git add` away from being committed, and file permissions don't stop that.

| Kind of value                                                     | Where it goes                                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Non-secret configuration (a project ID, a public key, a hostname) | `write_env`                                                                                              |
| A credential CI needs                                             | `set_secret`                                                                                             |
| A credential a local command must resolve                         | `write_env_ref` with an `op://` reference, plus a stage telling the human to save the value in 1Password |
| A credential that is neither                                      | the human's 1Password only — capture it, tell them where to put it, write nothing                        |

`ask_secret` marks a key as secret for the rest of the run, and `write_env` **refuses** a marked key and aborts. So the wrong thing fails loudly rather than producing a file that looks fine. Don't work around it by passing the value through a second variable — if a value needs hiding at the prompt, it needs a secret store.

`write_env_ref` writes the reference, never the value, so the resulting `.env` is safe to read and safe to commit.

A wizard is ephemeral by default — built for one run, saved to a scratch or `scripts/` path, deleted when the job's done. Commit it only when the user wants a repeatable setup path that should live in the repo.

## Process

### 1. Scope the procedure

Work out every manual step the human must take and every value that gets captured along the way. Read the repo first — don't ask cold:

- For setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`, framework config, and `.github/workflows/*` (every `secrets.*` / `vars.*` reference is a value the wizard must produce).
- For a migration or transition: the current state, the target state, and the irreversible actions between them.

Then show the user the ordered list of stages and the values each produces, and confirm — they may add, drop, or reorder.

**Done when:** every stage is named in order, and for each captured value you know (a) where the human gets it, (b) whether it's a credential or ordinary configuration, and (c) which destination from the table above it takes — some stages are pure actions and capture nothing.

### 2. Map each stage's journey

For each stage, write the precise path a human follows: which URL to open, what to do there, where a value is shown, which variable it fills — e.g. "Dashboard → Developers → API keys → Reveal test key → copy". Where you don't actually know the current UI or the exact command, say so and ask the user or check the docs — never invent steps that may not exist.

**Done when:** every stage traces to concrete instructions a stranger could follow.

### 3. Author the wizard

Copy `template.sh` to the target path. Replace the example stage with one `stage` per step, in dependency order. Use the library helpers — `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`/`write_env_ref`, `set_secret`/`set_var`, `pause`/`confirm` — and set `TOTAL_STAGES` to the number of stages you wrote.

Hold the bar the template sets: open the URL before asking for its value, use `ask_secret` for anything secret, route each captured value by the table above, `set_secret` only the values CI actually needs, and `confirm` before any irreversible action. Each `stage` clears the screen so only the current step is visible — keep a stage to one focused task so nothing the human needs scrolls away. Don't touch the library above the marker.

The example stage in the template shows both paths on one screen — a publishable key written plainly, a secret key sent to the secret store with only an `op://` reference persisted. Follow its shape rather than inventing a third.

### 4. Verify and hand off

- `bash -n <script>`; run `shellcheck` if available.
- `chmod +x <script>`.
- Don't run it end-to-end yourself — it opens browsers and blocks on human input. Trace it statically instead: every value from step 1 is captured and lands where step 1 said, and every `set_secret` name exactly matches a `secrets.*` reference in CI.
- Check no `write_env` call receives a value captured by `ask_secret`. The library aborts on this at run time, but the human finds out mid-procedure; you can find it by reading.
- Tell the user how to run it. If it's a repeatable setup path, commit it and link it from the README so the next person runs the script instead of asking an AI.
- The wizard is not the record. Because its stages are human actions left behind by agent work, file them per "Human follow-up actions" in `docs/agents/issue-tracker.md`: a private `ready-for-human` Issue on the Holland.VIP board and a `Runbook-<slug>` page in the private wiki carrying the same step-by-step instructions in prose, linking the script if it was committed. Reference credentials by 1Password item and field, never by value.
