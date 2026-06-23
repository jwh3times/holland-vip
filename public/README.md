# Review Handoff v3 — Storybook + Figma Plan (`storybook_plan_v2.md`)

**Reviewer:** Independent review agent
**Context change:** The move to Storybook is **greenlit and funded**. Storybook core is settled. The live decision is **which addons**. Revise accordingly.

---

## Do NOT add (intentionally out of scope)

These were prior asks; they are obsolete now that the project is funded. Do not re-introduce them:

- Cost-of-status-quo / ROI / business case. The decision is made; building the case invites re-litigation.
- Whole-initiative kill/abort criteria. Storybook itself will not be aborted. (Per-phase gates still apply — keep those.)

---

## Priority 1 — Add an Addon Decision Matrix (headline change)

The plan currently asserts addon choices and buries the tradeoffs in §3. Since addons are the active debate, surface them in one decision surface near §5/§6. Suggested table:

| Addon / Tool                                      | What it buys                                         | Cost                                  | Phase | Status                                       |
| ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- | ----- | -------------------------------------------- |
| `@storybook/angular` (core)                       | Renders Angular components in isolation              | Free/OSS                              | 2     | **Settled** — non-negotiable foundation      |
| `@storybook/addon-essentials`                     | Controls, Docs, Actions, Viewport                    | Free/OSS                              | 2     | **Settled** — required for Docs/props tables |
| `@compodoc/compodoc`                              | Auto-generated input/output props tables             | Free/OSS                              | 2     | **Settled** — required for §9.5 Docs         |
| `@storybook/addon-designs`                        | Figma frame embedded beside the component            | Free/OSS                              | 2     | **Debated** — see Q1                         |
| `chromatic` vs Playwright snapshots               | Automated visual regression                          | Chromatic free→$179; PW ~$2–5 compute | 3A    | **Debated** — see Q2                         |
| `@figma/code-connect`                             | Angular selector/snippets surfaced in Figma Dev Mode | Figma Org/Enterprise + seats          | 7     | **Debated** — see Q3                         |
| Style Dictionary + `@tokens-studio/sd-transforms` | Token JSON → SCSS pipeline                           | Free/OSS (+ Tokens Studio seats)      | 5     | Gated, not an addon debate                   |

Add a short paragraph per open question so debaters argue against one surface:

- **Q1 — Is `addon-designs` durable or scaffolding?** It and Code Connect (Phase 7) are complementary, but if Code Connect lands, the Figma-embed value partly overlaps. Frame the decision: keep `addon-designs` as the permanent design-review surface, or treat it as interim until Code Connect proves out. State the recommendation and why.
- **Q2 — Chromatic vs Playwright is not only a cost decision.** The plan costs it well but uses cost-as-blocker as the sole axis. Add the DX / built-in PR-diff-UI dimension — that is the actual reason most teams pick Chromatic. Give the criterion both ways.
- **Q3 — Code Connect viability is two gates, not one.** Figma Org/Enterprise eligibility _and_ the Phase 4 proof that Angular HTML/template snippets are usable. Keep both explicit; this is the one addon that can be cut entirely if either gate fails.

---

## Priority 2 — Two correctness catches (independent of funding)

1. **Sass path inconsistency.** `preview.ts` imports `../ClientApp/styles/_sky_expansion_variables.scss`, but both `includePaths` examples (§9.6, Option 1 and 2) point to `ClientApp/app/styles`. `styles/` vs `app/styles/` will cost a dev real time on day one. Reconcile the paths, or mark one as a placeholder Phase 1 resolves and say so.

2. **Phase 5 token sync is gated on 3A but not 3B coverage.** Token regeneration rewrites `_sky_expansion_constants.scss`, which affects _every_ component — but visual regression only snapshots components that have stories. A token change can silently break uncovered shared components until 3B is substantially complete. Change the Phase 5 entry condition to require a **3B coverage threshold** (e.g., app-shared/ coverage ≥ X%), not just "3A visual regression exists."

---

## Priority 3 — Residuals (minor, survive funding)

- **Phase 6 effort = `TBD`.** Acceptable since gated, but make the wording read "cannot be sprint-planned until sized," not "small." A reader should not mistake TBD for low.
- **No glossary.** Product readers won't know "Sky Expansion," "canonical stories," "storybook-able." Cheap to add; optional.

---

## Preserve (closed well in v2 — do not regress)

Exec summary; decisions register with owners + needed-by; budget table + cost gates; relative-sprint critical-path timeline; normalized component counts (57 → 46 → 8–12 → remainder); working-group + ADO PAT promoted to named Phase 5 gates; complex-component patterns; `includePaths` config, `check:stories` spec, `.storybook-skip`, and Azure Pipelines YAML; the clean 1–7 phase renumbering.
