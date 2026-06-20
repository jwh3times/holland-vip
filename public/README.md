# Third-Party Review — Storybook + Figma Integration Plan

**Reviewer:** Independent review agent
**Document under review:** `storybook_plan.html` — _Figma ↔ Storybook Integration Spike_ (Yates / SoftPro)
**Intended audiences:** Product (planning + effort/cost estimation) and Engineering (implementation reference)
**Purpose of this feedback:** Revision guidance for the authoring agent. Findings are addressed to the doc, not to a reader.

**Audience tags:** **[P]** = Product/estimation gap · **[D]** = Dev-reference gap · **[B]** = Both

---

## Verdict

Strong engineering and process design; incomplete as a planning-and-estimation instrument.

The document over-invests where risk is low and feasibility is already well-established (technical rendering, steady-state governance) and under-invests in the inputs Product needs to size, fund, and schedule the work — and in a few concrete specifics Devs will need on day one. It is ready to support a Phase 0 spike. It is **not** yet ready to support a capacity/budget decision, nor to serve as a complete dev reference without the additions below.

The single highest-leverage revision: add a one-page executive summary and resolve the items currently marked _TBD_ or _open_, because the parts of this initiative most likely to fail (designer adoption, story ownership, capacity) are exactly the parts the doc defers.

---

## Preserve in revision (do not lose)

- Node 22 / Angular 15 incompatibility elevated to the **first** Phase 0 deliverable.
- Strict phase gating; each phase independently reversible; the **Phase 1.25 Code Connect proof gate** ahead of any Phase 3 commitment.
- Visual-regression cost model grounded in real component counts and Chromatic snapshot math.
- `diff = 0 at handoff` criterion for the generated SCSS, and the engineer-led SCSS→JSON baseline direction.
- Honest treatment of the React-only Code Connect limitation and the "org risk > tech risk" framing.

---

## P0 — Blocking for Product planning

**1. No business case / cost-of-status-quo. [P]**
The doc asserts pain points but never sizes them — no estimate of engineer-hours/sprint lost to manual Dev Mode extraction, no count of visual defects reaching QA/users, no break-even. Product cannot prioritize a multi-quarter, multi-team effort against other work without this.
_Directive:_ Add a "Cost of Current State" subsection with a defensible (even rough) quantification, and a payback framing tied to the Sept 2027 MVP window.

**2. Phase 2B effort is "TBD." [P]**
Designer retokenization is the token-sync linchpin and the largest unestimated chunk. A phase with a TBD core cannot be estimated or committed.
_Directive:_ Either provide a sizing model (e.g., per-component retokenization hours × in-scope component count, with a stated assumption) or explicitly scope Phase 2 to "pipeline only, retokenization sized separately after Phase 0 designer pairing," so Product knows what it is and isn't approving.

**3. No timeline / critical-path view tied to the MVP. [P]**
Per-phase day ranges exist, but there is no calendar mapping or dependency chain showing when each phase must start to avoid colliding with trust-accounting MVP delivery, and how phases interact with the Oct 2026 Angular 18 milestone.
_Directive:_ Add a critical-path/Gantt-style view (phases → earliest start → dependency → MVP impact). The existing "Phased Rollout Summary" table is the seed; extend it with sequencing against the roadmap.

**4. No consolidated decisions/dependencies register with owners + lead times. [B]**
Open decisions (Figma plan tier, Procurement on Chromatic/Tokens Studio, security review of the ADO PAT, Phase 1B ownership) are scattered across the front matter, Section 4, and the risk table. Product can't drive what it can't see in one place.
_Directive:_ Add a single "Open Decisions & External Dependencies" register: _Decision · Owner · Needed-by · Blocks which phase · Status._ Pull every open item into it.

**5. Phase 1B ownership unresolved, with no fallback. [P]**
The doc names this the #1 scheduling risk and then defers it. Option C's coverage-review-in-retro is detection, not a forcing function; the doc even admits some shared components may never get claimed.
_Directive:_ State a default owner/staffing assumption Product can plan against, and a concrete fallback if no team claims Phase 1B (e.g., a capacity carve-out, or descoping 1B to the top-N most-used components).

---

## P1 — High (materially improves usefulness)

**6. No aggregated budget ask. [P]**
Cost line items are scattered: Chromatic ($179/mo Starter, later $399 Pro), Tokens Studio (~€39/user/mo), Figma Org/Enterprise upgrade + Full/Dev seats, minimal Azure hosting. Product needs them summed with trigger conditions.
_Directive:_ Add a budget table: _Item · Cost · When it's incurred · Trigger to upgrade · Owner to approve._

**7. Sass variable resolution: risk is flagged, config is not provided. [D]**
The doc repeatedly notes the `preview.ts` global import does not expose Sass variables to component SCSS at compile time, and that `stylePreprocessorOptions.includePaths` must be configured separately — but gives no concrete config. Devs implementing 1A will hit this immediately, and if it requires real builder work it can blow the ~0.5–1 day estimate.
_Directive:_ Provide the actual `main.ts` `stylePreprocessorOptions`/`includePaths` snippet (or a worked example), and add this as an explicit, separately-estimated 1A task rather than folding it into the install estimate.

**8. Referenced-but-undefined implementation artifacts. [D]**
`npm run check:stories`, the `.storybook-skip` exclusion file, and the `azure-pipelines.yml` Storybook/Chromatic stages are all referenced as if they exist but are never specified. A reference doc must contain them.
_Directive:_ Add the `check:stories` script (or a precise spec), the `.storybook-skip` format, and the CI stage YAML snippets.

**9. Per-PR maintenance tax is unquantified and framed as pure upside. [P][D]**
Every shared-component PR now requires a full story set + argTypes + Figma URL + JSDoc, landing during the delivery-critical MVP window.
_Directive:_ Add an honest "ongoing cost per PR" estimate (e.g., minutes/PR, % overhead on shared-component work) so Product can weigh it, and so Devs know the expectation.

**10. Hard cases are deferred without a sketch. [D]**
Story examples cover only a simple button. The doc itself flags the hard ones (`ControlValueAccessor` form controls, `sky-table`) as out of POC scope, but a reference doc should at least outline the pattern for them since they dominate the top-12.
_Directive:_ Add a short "patterns for complex components" subsection (form controls with CVA, data grids, components needing projected content / form context).

**11. No kill criteria for the initiative. [P]**
Everything gates forward; nothing defines when to stop. Reversibility is praised but never operationalized.
_Directive:_ Add abort/continue criteria per phase (e.g., "if the published Storybook URL is not referenced by ≥X engineers one quarter after 1A, pause before 1B").

---

## P2 — Medium

**12. Governance group is assumed into existence. [B]**
Section 11's cadences depend on a cross-team working group with no charter, no named members, and "any 1 of N reviewers" where N is undefined.
_Directive:_ Add a "Working Group Formation" prerequisite (members, charter, approval rule) as a Phase 2 entry condition, and note it's currently unformed.

**13. Tokens Studio ADO PAT under-flagged as a security gate. [B]**
For a title/legal software company, a third-party SaaS plugin holding a PAT with write access to repo branches is a security-review item, not a sandbox checkbox.
_Directive:_ Promote PAT scope/rotation/least-privilege and a security sign-off to an explicit Phase 0/Phase 2 dependency in the decisions register.

**14. Value proposition if Phase 3 is gated out isn't carried through. [P]**
"Solves the #1 pain point" rests on Phases 2 + 3 _combined_, and Section 5 (API standardization) is justified mainly as a Phase 3 prerequisite. If 1.25 fails, the headline benefit shrinks and Section 5's rationale weakens.
_Directive:_ Add a "if Phase 3 is deferred indefinitely" paragraph stating what value the program still delivers and re-justifying Section 5 on its own merits (it does stand alone as good practice — say so).

---

## P3 — Polish / doc quality

**15. Component counts read inconsistently. [P]**
57 (raw app-shared), ~46 (storybook-able), ~34 (1B remainder), 8–12 (1A). These reconcile, but the doc sometimes says "~46 existing app-shared components" where it means storybook-able, not total. Estimators may conflate 46 and 57.
_Directive:_ State once, prominently: _57 raw → 46 storybook-able → 12 (1A) + 34 (1B)_, and use those numbers consistently.

**16. Recommendation is buried in Section 10. [P]**
Product will not read 11 sections to find the recommendation, cost, and timeline.
_Directive:_ Add a 1-page executive summary at the top: problem, recommended approach, total cost, timeline-to-MVP, decisions required. Link out to detail.

**17. No glossary. [P]**
"Sky Expansion," "app-shared," "canonical stories," "storybook-able" are codebase-internal terms product readers won't know.
_Directive:_ Add a short terms section.

**18. Version/pricing claims are dated (June 2026) and will be referenced for 12+ months. [B]**
Storybook 8 ↔ Angular 15 range, Code Connect Angular maturity, and Chromatic pricing all drift.
_Directive:_ Add a "Verify before committing" callout listing the drift-prone claims, and note that Phase 0 / Phase 1.25 are the empirical verification points for the two that matter most. Do not present these as settled facts.

---

## Revision punch list (for the authoring agent)

- [ ] Add 1-page executive summary (problem, recommendation, cost, timeline, decisions).
- [ ] Add "Cost of Current State" + payback framing.
- [ ] Resolve or explicitly bound Phase 2B (no bare TBD).
- [ ] Add critical-path/timeline view against the MVP and Angular 18 milestone.
- [ ] Add consolidated Open Decisions & Dependencies register (owner, needed-by, blocks).
- [ ] State a Phase 1B ownership default + fallback.
- [ ] Add aggregated budget table with upgrade triggers.
- [ ] Provide concrete Sass `includePaths`/`stylePreprocessorOptions` config; estimate it as its own 1A task.
- [ ] Supply `check:stories` script, `.storybook-skip` format, and CI YAML snippets.
- [ ] Quantify per-PR maintenance overhead.
- [ ] Add complex-component story patterns (CVA form controls, grids).
- [ ] Add per-phase kill/continue criteria.
- [ ] Add Working Group formation prerequisite.
- [ ] Promote ADO PAT security review to an explicit dependency.
- [ ] Add "if Phase 3 deferred" value statement; re-justify Section 5 standalone.
- [ ] Normalize component counts (57 / 46 / 12 / 34).
- [ ] Add glossary.
- [ ] Add "verify before committing" callout for drift-prone version/pricing claims.

---

_Reviewer note:_ The plan's quality is not in question — it's unusually rigorous on feasibility and steady-state operation. The revisions above shift it from "an excellent engineering design" to "a document Product can fund and schedule, and Devs can implement from without reverse-engineering the gaps."
