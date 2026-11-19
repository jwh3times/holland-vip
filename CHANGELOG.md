# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via the
`v<major>.<minor>.<build>` tags minted by `.github/workflows/version.yml`. Branches never edit this
file: each writes its entries to `changelog.d/`, and the workflow stamps them into the section for
the version its merge mints.

_Releases before 1.1.0 used a legacy 4-part `v1.0.0.x` tag scheme and predate this changelog._

## [Unreleased]

No unreleased changes.

## [1.6.10] - 2026-11-19

### Changed

- Branches no longer predict the version their merge will mint. Each writes its changelog entries
  to its own `changelog.d/<branch-slug>.md` fragment and never edits `CHANGELOG.md`. After a merge,
  `version.yml` runs `scripts/stamp-changelog.mjs`, which turns the fragments that merge added (or,
  with none, its PR title) into the dated section for its version, pushes that as a
  `chore(release)` commit through a release GitHub App, and tags the merge commit itself
  (ADR 0006, `docs/adr/0006-stamp-changelog-on-tag.md`, superseding ADR 0001).
- Open PRs now merge in any order. A merge no longer invalidates every other PR's changelog
  section, a Dependabot merge still gets a section from its PR title, and nothing is backfilled.
- The CI `Changelog Version` check is now `Changelog`: it checks that each fragment holds only
  Keep a Changelog category headings and their entries, and that the branch edits no released
  section, no `Unreleased` entry and no fragment already on `main`.
- The shared `ship`, `docs-updater`, `end-session`, `handoff`, `lets-go` and `what-next` skills are
  reinstalled from `jwh3times/skills` with `stamp-on-tag` support, and the release docs, merge
  guidance and doc map describe the new scheme.

## [1.6.9] - 2026-11-18

### Changed

- The project permission allowlist in `.claude/settings.json` now allows the read-only
  `gh project item-list`, `gh project field-list`, `gh label list` and `nslookup` commands, so
  reading the board, its fields and the repository's labels no longer prompts. The rules come from
  a scan of recent agent sessions; commands that write or run code stay behind a prompt.

## [1.6.8] - 2026-11-18

### Added

- `docs/agents/merging.md` covers the path from an open PR to a finished merge: re-deriving state
  when parallel sessions move `main`, why a green `Changelog Version` check is provisional, reading
  red Playwright and Lighthouse runs, diffing `package-lock.json` past its `-diff` attribute, and
  the board and advisory checks after a merge.
- `docs/agents/local-runs.md` records the development machine's traps: only Chromium is installed
  for Playwright, there is no `shellcheck`, a credential helper is tested against a canary value
  rather than printed, no agent credential reads the Cloudflare zone's settings, and how a hobby
  project screenshot is recaptured.

### Changed

- `AGENTS.md` and the doc map point agents at the two new files. These lessons used to live in one
  harness's private memory, where Codex and other machines couldn't read them.
- `docs/agents/issue-tracker.md` says the board needs `gh auth refresh -s project` after a token
  rotation, and that `gh issue view --comments` omits the issue body off a terminal.

## [1.6.7] - 2026-11-17

### Changed

- Bumped `@playwright/test` from 1.65.0 to 1.65.1 (Dependabot, #268).

## [1.6.6] - 2026-11-16

### Changed

- The Hobby Project cards show real screenshots in place of their placeholders (#253), completing
  the Terminal redesign. Each image is described by alt text from `content/`, keeps the status pill
  over it, and loads lazily into a reserved 16:8 box, so it shifts nothing:
  - **Nearcited:** the locations dashboard for three demo businesses, from mock providers.
  - **causet:** a terminal running `cst merge-plan` on a demo repository.
  - **Magic Agenda:** a cork-theme board of sample tasks.
  - **Press:** the home, scoring and settlement screens on three phones.

### Removed

- The screenshot placeholder and the `cardBg` accent token that only it used.

## [1.6.5] - 2026-11-16

### Changed

- `docs/agents/releases.md` now records how PRs merge into `main` (#263). `main`'s required checks
  are strict, so each merge leaves the other open PRs behind. A feature PR catches up by merging
  `main`, never by rebasing, and a Dependabot PR through `@dependabot rebase`. Beside a Dependabot
  PR, the feature PR merges first so its changelog section keeps the version it mints.
  `CONTRIBUTING.md` says a PR must be up to date with `main` to merge.

## [1.6.4] - 2026-11-16

### Fixed

- The homepage now renders without JavaScript (#259). A loading boundary used to put the whole page
  in a hidden block behind a "Loading..." spinner, revealed only by a script, so a visitor or
  crawler without JavaScript saw nothing but the spinner. The spinner is gone and the prerendered
  page is the document.

## [1.6.3] - 2026-11-16

### Changed

- The final slice of the Terminal redesign (#252):
  - **Professional work** (now `04`) shows each anonymized project as a `private/{slug}` cell on a
    hairline grid, under a "🔒 private repos · anonymized" pill.
  - **About** becomes an unnumbered README-style panel holding a rewritten three-paragraph
    Biography.
  - **Contact** becomes an unnumbered `$ ./contact.sh` prompt with the address as one large email
    link and bordered `github/jwh3times` and `linkedin/jerryhollandiii` buttons.
- The header's nav is now `projects/`, `career.log`, `impact.diff`, `work/` and `contact.sh`. About
  left the nav, but `#about` still lands on the Biography, so old links keep working.
- An editor-style status bar replaces the footer: `● main`, `holland.vip`, `© {year} Holland`, and
  `UTF-8 · LF · {theme}` naming the theme actually painted, which follows the theme toggle.
- Every button shares the Terminal style (mono text, 8px radius, no hover scale or shadow),
  including the hero's two, the 404 page's and the error page's.

### Removed

- The pre-Terminal colour token aliases and the utility classes built on them, the unused card,
  badge and bento-grid components, the old footer and its social icons, and the `lucide-react`
  dependency. The design uses text glyphs, so the site no longer ships an icon library.

## [1.6.2] - 2026-11-16

### Changed

- Bumped `lucide-react` from 1.71.0 to 1.72.0, `@lhci/cli` from 0.16.0 to 0.16.1,
  `@testing-library/user-event` from 14.6.9 to 14.6.10, `jsdom` from 31.0.0 to 31.0.1,
  `oxlint-tsgolint` from 7.0.2006 to 7.0.2007, `prettier` from 3.9.10 to 3.10.1 and `serve` from
  14.2.7 to 14.2.8 (Dependabot, #260).

## [1.6.1] - 2026-11-16

### Changed

- The sixth slice of the Terminal redesign (#251): a numbered **Impact** section at `#impact`,
  reached from the header's new `impact.diff` link, brings the evidence of impact into one place.
  - The four Career Highlights lead it, each figure shown with its sign (`+15%` … `−83%`, the
    failure-rate reduction being the one negative).
  - The three Problem-Solving Highlights follow as `case #001`–`#003`. Each case has a headline
    metric (`−75%`, `45s → 3s`, `−95%`) and ERR / FIX / OK blocks for the problem, the response and
    the result.
  - Technical Capabilities are four columns of `├─` items, and Technical Achievements three cards of
    `▸` items.
- About now shows only the Biography; its Career Highlights and Technical Achievements are part of
  Impact.

### Removed

- The standalone Technical Capabilities and Problem-Solving Highlights sections, which Impact
  replaces. Neither had an anchor, so no link breaks.

## [1.6.0] - 2026-11-16

### Added

- The fifth slice of the Terminal redesign (#250): a numbered **Hobby projects** section at
  `#projects`, reached from the header's `projects/` link and the hero's `./see-projects` button.
  Four cards (Nearcited, causet, Magic Agenda and Press) are introduced as picked for range, with a
  link to everything on GitHub. Each card shows a status pill over a placeholder screenshot area,
  the project's kind and one-liner, stack chips, and an `open ↗` link to the live site or repository.
- Each card holds a mini terminal labelled "sample output". Hovering a card, or tabbing into it,
  replays its lines one every 380ms; at rest every line shows dimmed. With reduced motion there is
  no replay and the card does not lift.
- When GitHub supplies the project's repository, its card shows `★ n · pushed YYYY-MM-DD`, with the
  star count only when there are any.

### Changed

- Professional Work moves to `#work`, and the header's `work/` link follows it. Its intro now
  points up to the Hobby projects rather than down to Open Source.
- The build fetches the four Hobby Projects' repositories instead of the old featured four, through
  the same anonymous requests, snapshot fallback and public-identity check. The committed snapshot
  is refreshed for them. A missing, unavailable or rejected repository now removes only that card's
  metadata line: the section and all four cards always render.

### Removed

- The Open Source section, with its `#open-source` anchor and nav link. An old link to it still
  loads the page.

## [1.5.0] - 2026-11-16

### Added

- The fourth slice of the Terminal redesign (#249): a numbered **Career & stack** section at
  `#career`, reached from the header's `career.log` link and the hero's `cat career.log` button. A
  timeline draws one bar per role from 2013 to now. Clicking a company opens the same role in a
  `git log` view below it, where each role's highlights expand one at a time. The current role
  starts open and is marked `(HEAD → main)`. Both are keyboard-operable buttons that report what they
  have opened.
- Beside the log: a `skills.json` inventory in eight categories, an Agent Skills panel listing six
  published skills with a link to `jwh3times/skills`, and the Current Explorations, each marked
  `[~]` as exploratory.

### Changed

- Each role's period, duration (`Ny`, or `Nmo` under a year) and timeline position are all derived
  from one stored start and end month, so they can never disagree. The current role runs to the
  build date. SoftPro gains two highlights, for five in all.
- The skills are reorganised into eight categories and the Current Explorations list is refreshed.
  Both now live in Career & stack rather than in separate Skills and About blocks.
- The Contribution Activity heatmap moves from Open Source to the foot of Career & stack and is
  restyled. Each day's tooltip reads "N on YYYY-MM-DD". On a phone it scrolls sideways at a readable
  size, and the scroll area can be reached from the keyboard.
- Education is now a single line at the root of the `git log`.
- First load does less work. Sections well below the fold skip layout and paint until they near the
  viewport, and the heatmap's cells carry only their level, filled by one stylesheet rule. The page
  is about 37KB smaller and stays within the Lighthouse total-blocking-time budget.

### Removed

- The Professional Experience, Skills & Technologies and Education sections, with their
  `#experience`, `#skills` and `#education` anchors and nav links. An old link to one of them still
  loads the page. The NC State logo and the two card utilities only those sections used are gone
  too.

## [1.4.91] - 2026-11-16

### Changed

- The third slice of the Terminal redesign (#248): the hero is rebuilt as a two-column opening
  screen. It has a pulsing `Tech Lead @ SoftPro · Raleigh, NC` status line, a `Jerry Holland_`
  heading, a one-paragraph lead, and `./see-projects` and `cat career.log` buttons that jump to the
  work and career sections. A stats row shows years of experience and two contribution counts,
  "contributions / 12mo" and "contributions / 30d", both taken from the build-time contribution
  calendar, live or snapshot. An empty calendar shows a dash rather than zero.
- Beside it, a terminal window types out a short `whoami` / `uptime` / `ls` / `cat now.txt`
  session with a blinking cursor and a live 24-hour clock. It reserves its finished height, so
  typing never moves the page. Under reduced motion it appears fully typed, with no blinking or
  pulsing. Screen readers skip the window and hear a one-paragraph summary of it instead. The hero
  is still server-rendered, so its heading and stats are in the static HTML; only the terminal runs
  in the browser.

### Removed

- The hero's GitHub and LinkedIn icon links (the footer keeps them), its grid background, and the
  `.hero-section`, `--hero-background` and `.animate-fadeInUp` styles that only the old hero used.

## [1.4.90] - 2026-11-16

### Changed

- The second slice of the Terminal redesign (#247): the navigation bar is a sticky 52px header. A
  `jerry@holland.vip:~` prompt, built from the contact address in `lib/site-config.ts`, returns to
  the top of the page, and the section links read as paths (`about.md`, `skills.json`,
  `career.log`, `work/`, `open-source/`, `contact.sh`). On a narrow screen the links scroll
  sideways in the header instead of opening a menu, so every link stays one tap away. The skip
  link is unchanged.
- The theme toggle is a pill that cycles auto → dark → light → auto, labelled `◒ auto`, `◐ dark`
  and `◑ light`, so a visitor can return to following their OS scheme after overriding it. Its
  accessible name states the current theme and what activating it does ("Theme: auto (dark).
  Switch to dark."). With no stored choice the site still follows the OS.
- Body sections are numbered `01`, `02`, … in page order, the number set in mono before each
  heading, and sit on the page background instead of alternating bands. `app/page.tsx` derives each
  number from the section's position with `numberAt`, after dropping a section that has nothing to
  show, so the numbers never skip; a section only displays the number it is handed. Section
  headings are left-aligned over a rule.

### Removed

- The mobile menu button, the alternating section surfaces (`.section-surface`,
  `.section-surface-contrast`, `surfaceAt`) and the unused `.gradient-text-blue` utility.

## [1.4.89] - 2026-11-16

### Added

- Geist and Geist Mono set the site's type, self-hosted from the `geist` package through
  `next/font/local` in `app/fonts.ts`: no font is downloaded at build time or requested from a font
  CDN, and the CSP is unchanged. Only Geist Sans is preloaded, because nothing renders in the mono
  face yet and preloading it delayed the largest contentful paint.

### Changed

- The first slice of the Terminal redesign (#246): the site takes the Terminal palette, light by
  default and dark under the theme toggle. Its tokens (`--bg`, `--panel`, `--panel2`, `--line`,
  `--line2`, `--fg`, `--mute`, `--dim`, the four `--a-*` accents and `--heat0`) live in
  `app/globals.css` and reach components as Tailwind utilities such as `bg-panel`, `text-mute` and
  `text-a-green`. Every old token name stays as an alias resolved through the new tokens, so
  sections the later slices redesign already render in the new palette.
- `--dim`, the dark theme's `--mute` and the four light-theme accents depart from the design
  handoff's values so that every text colour meets WCAG AA (4.5:1) on every surface, and each
  accent on its own tint. A unit test holds every text token to that bar in both themes.
- The accent table in `lib/accent.ts` keeps its four accents and colours each from its `--a-*`
  token, tinted with `color-mix` at 12% for chips and cards and 30% for rings and borders, and gains
  `bar` (14%) and `glow` (55%) tokens.
- Cards, the call-to-action buttons, the bento grid, the navigation and footer, and the error,
  loading and 404 pages use the new tokens; the primary button is now a solid foreground fill. The
  browser's theme colour matches each theme's background, and a test keeps the two in step.
- The domain glossary in `CONTEXT.md` adds **Agent Skill** and **Hobby Project**, retires **Open
  Source** and **Featured Repository**, and counts every kind of contribution in **Contribution
  Activity**.

### Removed

- The unused `.text-badge-*` and `.card-bg-{blue,green,purple,orange}` utilities and the
  `.dark .glass` override.

### Fixed

- The Playwright accessibility check waits for entrance animations to finish before running axe,
  so it no longer measures a colour halfway through a fade-in.

## [1.4.88] - 2026-11-13

### Changed

- Bumped `lucide-react` from 1.70.0 to 1.71.0, `next` from 16.4.5 to 16.4.6,
  `@testing-library/user-event` from 14.6.8 to 14.6.9 and `oxlint` from 1.92.0 to 1.93.0
  (Dependabot, #244).

## [1.4.87] - 2026-11-12

### Changed

- `/what-next` puts an active handoff first: when `handoff_map.json` names one for this repository,
  the report leads with it and recommends `/lets-go`, and one whose document has not reached this
  machine is shown as pending. It still changes nothing, and a machine without the handoffs config
  skips the check.

## [1.4.86] - 2026-11-12

### Added

- `/what-next`, a shared skill from `jwh3times/skills`, reports what to work on next. It reads the
  open issues, open PRs and the board, and ranks the work by the board's manual order, per the new
  `Priority order` setting in `docs/agents/issue-tracker.md`. It names one item and the command
  that takes it, and changes nothing on GitHub. The development flow's routing points at it when
  nothing is chosen yet.

## [1.4.85] - 2026-11-12

### Changed

- Bumped `@vitejs/plugin-react` from 6.2.1 to 6.3.0 (Dependabot, #241).

## [1.4.84] - 2026-11-10

### Changed

- The installed-skills check (`scripts/check-skills.mjs`) reads the version 2 `skills-lock.json`
  that `skills` CLI 1.8.0 writes, whose hashes no longer depend on line endings, so the shared
  skills install with the current CLI instead of a pinned 1.7.4 (#239). The lock is now version 2;
  no skill's content changed.

## [1.4.83] - 2026-11-10

### Changed

- Bumped `@tailwindcss/postcss` from 4.3.4 to 4.3.5, `oxlint` from 1.91.0 to 1.92.0 and `serve`
  from 14.2.6 to 14.2.7, with a transitive lockfile update (Dependabot, #238).

## [1.4.82] - 2026-11-09

### Changed

- Bumped `jsdom` from 30.1.3 to 31.0.0 (Dependabot, #237).

## [1.4.81] - 2026-11-09

### Changed

- Bumped `lucide-react` from 1.67.0 to 1.70.0, `next` from 16.4.4 to 16.4.5, `@playwright/test`
  from 1.64.1 to 1.65.0, `oxlint` from 1.90.0 to 1.91.0 and `oxlint-tsgolint` from 7.0.2005 to
  7.0.2006 (Dependabot, #236).

## [1.4.80] - 2026-11-06

### Changed

- Bumped the transitive `minimatch` and `@sentry/node` in the lockfile (Dependabot, #235).

## [1.4.79] - 2026-11-06

### Changed

- Bumped `lucide-react` from 1.66.0 to 1.67.0, `next` from 16.4.3 to 16.4.4, `@lhci/cli` from
  0.15.1 to 0.16.0, `@tailwindcss/postcss` from 4.3.3 to 4.3.4 and `@vitest/coverage-v8` from
  5.0.5 to 5.1.0, with transitive lockfile updates (Dependabot, #234).

## [1.4.78] - 2026-11-05

### Changed

- Bumped `@vitejs/plugin-react` from 6.1.2 to 6.2.1 (Dependabot, #233).

## [1.4.77] - 2026-11-03

### Changed

- Bumped `lucide-react` from 1.65.0 to 1.66.0 (Dependabot, #232).

## [1.4.76] - 2026-11-02

### Changed

- `end-session` now closes every session with the same report: what it did, the docs it searched and
  updated, open PRs and security alert counts, and the human steps owed before the next session.

## [1.4.75] - 2026-11-02

### Changed

- Bumped `lucide-react` from 1.62.0 to 1.65.0 and `@types/node` from 26.6.5 to 26.6.6 (Dependabot).

## [1.4.74] - 2026-11-01

### Added

- `THIRD_PARTY_NOTICES.md` carries the MIT license notice of the installed `mattpocock/skills`
  skills, which install without it.

## [1.4.73] - 2026-11-01

### Changed

- Every `mattpocock/skills` skill now installs from one snapshot pinned by commit, the same in every
  repository that shares `jwh3times/skills`, and `resolving-merge-conflicts` is gone.
  `scripts/check-skills.mjs` fails CI when an installed skill differs from `skills-lock.json`, and
  the rules local edits carried moved to `AGENTS.md` or `docs/agents/`.

## [1.4.72] - 2026-10-31

### Changed

- The development flow and shared-skills text in `AGENTS.md` now come from `jwh3times/skills`:
  `scripts/sync-agents.mjs` writes them between marked lines, and its check fails when they drift.
  `docs/agents/dev-flow.md` and `docs/agents/triage-labels.md` hold only what this repository adds
  to the shared defaults, and the shared skills are refreshed to match.

## [1.4.71] - 2026-10-31

### Changed

- The version, changelog, docs and sync scripts are now the canonical ones from `jwh3times/skills`,
  and the shared skills are refreshed to match. **Changelog Version** also requires a section for
  every released build, so a Dependabot merge must be backfilled by the next human PR. CI now runs
  `node scripts/check-docs.mjs`: local links and anchors must resolve, and the doc map must list
  every document.

## [1.4.70] - 2026-10-30

### Changed

- Bumped `lucide-react` from 1.61.0 to 1.62.0 and `oxlint` from 1.89.0 to 1.90.0 (Dependabot).

## [1.4.69] - 2026-10-30

### Changed

- The doc map now covers `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE` and the issue templates, so
  `/docs-updater` audits them too. `/end-session` deletes the build output it lists instead of
  leaving it by default, and handles worktrees and scratch files through its own rules. The human
  follow-up section of `docs/agents/issue-tracker.md` points at `human-follow-up.md` instead of
  restating it.

## [1.4.68] - 2026-10-30

### Changed

- The shared agent skills are refreshed from `jwh3times/skills`, which now give most settings a
  default, so the ones that matched leave `docs/agents/`. `/end-session` runs the generated-config
  check every time, not only when agent sources changed, and ends by proving both repositories
  clean and pushed. `/ship` bumps with `--allow-same-version`, so a re-run lands on the same
  version; `/handoff` names `npm run bootstrap:private` for a machine without `private/`, and
  `/lets-go` offers it.

## [1.4.67] - 2026-10-30

### Changed

- The shared agent skills are refreshed from `jwh3times/skills`. Agents commit in `private/` only
  after asking, by one procedure every repository shares, which also confirms the companion is
  private before pushing; `Companion commit policy` leaves `docs/agents/workspace.md`. `/ship`
  reports an open PR that claims the same version again, and `/lets-go` installs from a changed
  lockfile.

## [1.4.66] - 2026-10-28

### Changed

- The shared agent skills are refreshed from `jwh3times/skills`: code spans that broke across a
  line in the skills and their settings now stay on one line. No behavior changes.

## [1.4.65] - 2026-10-28

### Changed

- The shared agent skills are refreshed from `jwh3times/skills`, which gives some settings a shared
  default: `docs/agents/releases.md` drops the release commit message and `Unreleased` placeholder
  it no longer needs to state. New human follow-up pages in the private wiki are named
  `<Topic>-<YYYY-MM-DD>` and indexed from a `human-todo` page linked from `Home`; existing
  `Runbook-` pages keep their names. `docs/agents/ship.md` names the suites that run only in CI.

## [1.4.64] - 2026-10-27

### Changed

- The shared agent skills are refreshed from `jwh3times/skills`: `/end-session` records work it
  discovers as an issue on the board, per the new `New work` setting in
  `docs/agents/issue-tracker.md`, and `npm run lint:agents`' script also lints another checkout
  when given its root, and names the root it linted.

## [1.4.63] - 2026-10-27

### Changed

- Bumped `qs` from 6.16.0 to 6.17.0 (Dependabot).

## [1.4.62] - 2026-10-27

### Changed

- The `ship`, `end-session`, `handoff` and `lets-go` agent skills now install from the shared
  `jwh3times/skills` repository instead of being maintained here, and the `docs-updater` subagent
  becomes a skill installed the same way (ADR-0005; the `mattpocock/skills` set stays forked here).
  What the skills need to know about this repository lives in settings files under `docs/agents/`,
  which each skill proposes on its first run. `/handoff` and `/lets-go` read how the Handoffs folder
  reaches each machine from that machine's `~/.config/handoffs/config`, and
  `scripts/handoff-map.mjs` is gone.
- The Build & Lint check now also runs `npm run lint:agents`, which rejects agent and skill sources
  that would read wrongly from their mirrored copies.

## [1.4.61] - 2026-10-27

### Changed

- Bumped `next` from 16.4.2 to 16.4.3 (Dependabot).

## [1.4.60] - 2026-10-26

### Changed

- The Matt Pocock skill flow is now the binding development process for agents. Every code change
  starts from a ready Issue (a `ready-for-agent` spec, ticket, or triage brief, or a bug worked
  through `/diagnosing-bugs`); without one, the agent stops before its first edit and routes the
  user to the right skill. The flow skills stay user-invoked, so the human starts every phase.
  Dependency bumps, docs- and agent-config-only changes, release prep, and an explicit user waiver
  are exempt. `AGENTS.md` states the rules and the new `docs/agents/dev-flow.md` holds routing,
  exemptions, and which paths count as code.
- Branches are named `<type>/<issue#>-<slug>`, and PR bodies open with `Closes #N` or `Part of #N`.
  The PR template, `CONTRIBUTING.md`, and `/ship` now follow that rule.

## [1.4.59] - 2026-10-26

### Changed

- Bumped `lucide-react` from 1.60.0 to 1.61.0 and `oxlint-tsgolint` from 7.0.2004 to 7.0.2005
  (Dependabot).

## [1.4.58] - 2026-10-25

### Changed

- Bumped `lucide-react` from 1.58.0 to 1.60.0 and `oxlint` from 1.88.0 to 1.89.0 (Dependabot).

## [1.4.57] - 2026-10-22

### Security

- `npm audit` reports no vulnerabilities again. `package.json#overrides` now pins `compression` to
  `^1.8.2` (GHSA-vc2v-76pw-4v95) and `basic-ftp` to `^6.2.3` (GHSA-c475-qrg2-pj4r), because no
  upstream release reaches either fix: `serve@14.2.6` pins `compression@1.8.1`, and every `get-uri`
  release, which `@lhci/cli` reaches through `proxy-agent`, still requires `basic-ftp@^5`. The
  transitive `fast-uri` (3.1.9) and `ip-address` (10.7.4) also move to patched releases. Both
  overridden packages are confined to Lighthouse CI and the local `serve` of `out/`; the deployed
  static site is unchanged.

## [1.4.56] - 2026-10-22

### Changed

- Bumped `vite` from 8.0.16 to 8.3.5 (Dependabot).

## [1.4.55] - 2026-10-22

### Changed

- Bumped `lucide-react` from 1.56.0 to 1.58.0, `next` from 16.4.0 to 16.4.2, `react` and
  `react-dom` from 19.3.0 to 19.3.1, `@axe-core/playwright` from 4.13.0 to 4.14.0,
  `@playwright/test` from 1.64.0 to 1.64.1, `@vitest/coverage-v8` and `vitest` from 5.0.4 to 5.0.5,
  `jsdom` from 30.1.2 to 30.1.3, and `oxlint` from 1.87.0 to 1.88.0 (Dependabot).

## [1.4.54] - 2026-10-16

### Changed

- Bumped `lucide-react` from 1.55.0 to 1.56.0, `@testing-library/user-event` from 14.6.7 to
  14.6.8, and `@vitest/coverage-v8` and `vitest` from 5.0.3 to 5.0.4 (Dependabot).

## [1.4.53] - 2026-10-14

### Changed

- Bumped `lucide-react` from 1.54.0 to 1.55.0, `oxlint-tsgolint` from 7.0.2003 to 7.0.2004, and
  `prettier` from 3.9.9 to 3.9.10 (Dependabot).

## [1.4.52] - 2026-10-13

### Changed

- Bumped `lucide-react` from 1.52.0 to 1.54.0, `next` from 16.3.8 to 16.4.0, `@playwright/test`
  from 1.63.0 to 1.64.0, and `@types/node` from 26.6.4 to 26.6.5 (Dependabot).

## [1.4.51] - 2026-10-13

### Changed

- Bumped the pinned GitHub Actions `actions/setup-node` from 7.0.0 to 7.1.0,
  `actions/upload-artifact` from 7.0.1 to 7.0.2, and `actions/download-artifact` from 8.0.1 to
  8.0.2 (Dependabot).

## [1.4.50] - 2026-10-09

### Changed

- Bumped `@vitejs/plugin-react` from 6.1.1 to 6.1.2 and `oxlint` from 1.86.0 to 1.87.0
  (Dependabot).

## [1.4.49] - 2026-10-08

### Changed

- Bumped `lucide-react` from 1.51.0 to 1.52.0 and `jsdom` from 30.1.1 to 30.1.2 (Dependabot).

## [1.4.48] - 2026-10-07

### Changed

- Bumped the transitive `sharp` from 0.35.4 to 0.35.5, with its bundled libvips from 1.3.3 to
  1.3.4 (Dependabot).

## [1.4.47] - 2026-10-07

### Changed

- Bumped the transitive `source-map-js` from 1.2.1 to 1.2.2 (Dependabot).

## [1.4.46] - 2026-10-07

### Changed

- Bumped the transitive `proxy-addr` from 2.0.7 to 2.0.8 (Dependabot).

## [1.4.45] - 2026-10-07

### Changed

- Bumped `lucide-react` from 1.49.0 to 1.51.0 (Dependabot).

## [1.4.44] - 2026-10-05

### Changed

- Bumped `lucide-react` from 1.48.0 to 1.49.0, `next` from 16.3.7 to 16.3.8, `@types/node` from
  26.6.3 to 26.6.4, and `@vitest/coverage-v8` and `vitest` from 5.0.2 to 5.0.3 (Dependabot).

## [1.4.43] - 2026-10-02

### Changed

- Bumped `next` from 16.3.6 to 16.3.7 and `oxlint` from 1.85.0 to 1.86.0 (Dependabot).

## [1.4.42] - 2026-09-30

### Changed

- Bumped the transitive `brace-expansion` from 1.1.18 to 1.1.21 (Dependabot).

## [1.4.41] - 2026-09-30

### Changed

- Bumped the transitive `ip-address` from 10.7.0 to 10.7.2 (Dependabot).

## [1.4.40] - 2026-09-29

### Changed

- Bumped `@types/node` from 26.6.2 to 26.6.3 (Dependabot).

## [1.4.39] - 2026-09-28

### Changed

- Bumped `lucide-react` from 1.47.0 to 1.48.0, `next` from 16.3.5 to 16.3.6,
  `@vitest/coverage-v8` and `vitest` from 5.0.1 to 5.0.2, `oxlint-tsgolint` from 7.0.2002 to
  7.0.2003, and `prettier` from 3.9.8 to 3.9.9 (Dependabot).

## [1.4.38] - 2026-09-25

### Changed

- The agent-artifact generator is now the shared cross-repository `scripts/sync-agents.mjs`, with
  its `node:test` suite `scripts/sync-agents.test.mjs` running in CI beside the drift check. It
  replaces `scripts/lib/agent-sync.mjs` and its Vitest tests. Generated banners now read
  `regenerate with 'node scripts/sync-agents.mjs'`. A generated Codex agent carries
  `sandbox_mode = "read-only"` only when its `tools:` list names no writing tool; otherwise the line is
  omitted and Codex uses the session sandbox, so `docs-updater` no longer pins `workspace-write`.
  Quoted frontmatter values are unquoted before being written to TOML. `npm run sync:agents:check`
  runs the drift check.

## [1.4.37] - 2026-09-25

### Changed

- Bumped `jsdom` from 30.1.0 to 30.1.1 and `oxlint` from 1.83.0 to 1.85.0 (Dependabot).

## [1.4.36] - 2026-09-22

### Security

- `npm run bootstrap:private` now installs a `gitleaks` pre-commit hook in the private companion,
  which refuses any commit whose staged changes contain a credential. GitHub offers no secret
  scanning for a personally owned private repository, so this local hook is that repository's scan.
  Git does not version hooks, so the bootstrap writes one on every run, including over an existing
  checkout: re-run it on each machine to add the hook. The hook refuses every commit when `gitleaks`
  is not installed rather than silently skipping the scan. A different existing `pre-commit` hook is
  reported and left in place.

## [1.4.35] - 2026-09-22

### Changed

- Bumped `@types/node` from 26.6.1 to 26.6.2 (Dependabot).

## [1.4.34] - 2026-09-21

### Changed

- Bumped `lucide-react` from 1.46.0 to 1.47.0, `@types/node` from 26.5.1 to 26.6.1, `jsdom` from
  30.0.1 to 30.1.0, `oxlint-tsgolint` from 7.0.2001 to 7.0.2002, and `prettier` from 3.9.6 to 3.9.8
  (Dependabot).

## [1.4.33] - 2026-09-20

### Security

- The agent-sync workflow no longer keeps its push credential in the workspace while dependencies
  install and artifacts regenerate. The checkout no longer persists a credential at all, and the
  token is supplied to the push step alone, through a credential helper that reads it from the
  environment so the value never reaches a command line.

### Changed

- The `ship` skill now warns that the version script reads local tags, so a merge that landed
  moments earlier may not have minted its tag yet — and shows how to confirm before trusting the
  number.

## [1.4.32] - 2026-09-20

### Changed

- The workspace bootstrap guide now loads credentials from one reference-only template per task,
  so a command receives what it uses and nothing else. The combined template it previously named
  resolved every stored credential into every command that used it.

## [1.4.31] - 2026-09-20

### Added

- The Content-Security-Policy now sets `base-uri 'self'`, `object-src 'none'`, and
  `form-action 'none'`, closing the injection sinks that an inline-script allowance would otherwise
  leave reachable. No route contains a form, base, object, or embed element, so nothing changes for
  visitors.

### Changed

- `SECURITY.md` no longer claims the project has no released versions or tags; every merge to
  `main` mints one. It now says only the deployed `main` is supported, that tags mark what shipped
  rather than separately maintained lines, and how a reporter should identify an affected version.
- `public/_headers` no longer asserts that the site has no XSS vector or cites an external grade as
  justification. It describes `'unsafe-inline'` as an accepted limitation with its actual cause.

## [1.4.30] - 2026-09-20

### Changed

- The workspace bootstrap guide now describes what the script actually does with a 1Password
  service-account token: it is held by the bootstrap process itself, not confined to an `op` child,
  and clearing the local copies afterwards is tidiness rather than erasure. Nothing prints it or
  writes it to disk.
- The guide also states that the already-installed shortcut checks presence, not identity — a
  re-run over a wrong or renamed companion still reports success — and gives the one-line remote
  check to confirm a recovery. Adding that check to the script is deliberately declined, because
  the shortcut's value is running before any credential read.

## [1.4.29] - 2026-09-20

### Security

- The daily production check now compares the deployed Content-Security-Policy directive by
  directive against the policy declared in `public/_headers`, instead of testing for two
  substrings. A response that kept `default-src 'self'` while opening `script-src` to a wildcard
  previously passed; it now fails, naming the widened directive. Because the comparison reads the
  repository's own policy, a deployment serving something other than what the repository declares
  also fails.
- The same check now verifies the live `security.txt` carries a contact, canonical URL, policy
  link, and an expiry still in the future, rather than matching a single line. An expiry lapses
  without any deploy to notice it.

## [1.4.28] - 2026-09-20

### Security

- Generated setup wizards no longer write captured credentials into a plaintext `.env`. A value
  entered at a hidden prompt is marked secret for the run, and the wizard now aborts rather than
  persisting it as text, directing it to a GitHub secret or to 1Password with only an unresolved
  `op://` reference written to `.env`. Hidden prompts also stopped offering a stored value as
  their default, which had read a saved secret back out of the file.
- The repository now ignores every `.env` file, re-admitting only `.env.example` and `.env.tpl`.
  The previous `.env*.local` rule left `.env` and `.env.production` committable.

## [1.4.27] - 2026-09-20

### Security

- Contribution snapshots are now validated by value, not just by shape. Totals and daily counts
  must be finite non-negative integers within a sane bound, and each day must carry an ISO
  `YYYY-MM-DD` date naming a real calendar day, so negative, fractional, `NaN`, `Infinity`, and
  impossible-date values can no longer reach the contribution heatmap.
- Build-time GitHub requests now carry a 10-second deadline. A stalled connection degrades to the
  reviewed committed snapshot through the existing fallback path instead of holding the build open
  until CI's own timeout. A timed-out repository keeps its committed data rather than being dropped,
  which remains reserved for repositories GitHub reports as gone or ineligible.

## [1.4.26] - 2026-09-20

### Security

- Agent artifact generation now refuses to follow a symlink in either the authored or the generated
  tree, failing with the offending path instead of copying the link target's bytes. A link under
  `.agents/skills/` or `.claude/agents/` previously had its target read and republished into
  `.claude/skills/` or `.codex/`, which could carry a file across the private/public boundary.

## [1.4.25] - 2026-09-20

### Security

- Every GitHub Actions reference in CI is now pinned to an immutable full commit SHA with a
  trailing version comment, so a retagged or compromised upstream action can no longer reach a
  workflow run. `actions/dependency-review-action` had been resolving through a mutable `v5`
  branch rather than a tag; it now names the commit behind `v5.0.0`. Dependabot continues to
  propose updates, refreshing each SHA and its version comment together.
- A check now fails the build if any workflow reference reverts to a mutable tag or branch, so the
  pinning cannot regress unnoticed.

## [1.4.24] - 2026-09-18

### Changed

- Dependency maintenance: `lucide-react` 1.45.0 to 1.46.0, `oxlint` 1.82.0 to 1.83.0, and
  `vitest` with `@vitest/coverage-v8` 5.0.0 to 5.0.1.

## [1.4.23] - 2026-09-16

### Changed

- The handoff mirror is now configured with `HANDOFFS_DIR`, the name every repository shares.
  `scripts/handoff-map.mjs` reads `HANDOFFS_DIR` first and still falls back to `HANDOFF_DIR`, and
  `/handoff`, `/lets-go`, and the workspace bootstrap guide name `HANDOFFS_DIR`.

## [1.4.22] - 2026-09-16

### Changed

- `/handoff` and `/lets-go` now work without the Proton Drive desktop client: on a machine with only
  the `proton-drive` CLI, `HANDOFF_DIR` is a local mirror that the skills pull from and push to the
  cloud Handoffs folder at the points where the map or a document is read or written.

## [1.4.21] - 2026-09-16

### Changed

- Bumped `tailwind-merge` from 3.6.0 to 3.7.0 (Dependabot).

## [1.4.20] - 2026-09-15

### Changed

- Bumped `next` from 16.3.4 to 16.3.5 and `lucide-react` from 1.44.0 to 1.45.0 (Dependabot).

## [1.4.19] - 2026-09-15

### Added

- A `/lets-go` skill that resumes this repository's active handoff from Proton Drive, marks it
  consumed in `handoff_map.json`, brings the checkout to the branch the handoff names, and continues
  from its next step.
- `scripts/handoff-map.mjs`, which locates the Proton Drive Handoffs folder on Windows and Linux
  (overridable with `HANDOFF_DIR`) and reads, records, or clears a repository's active handoff while
  preserving the other entries.

### Changed

- `/handoff` now moves a session between machines: it alerts on uncommitted, stashed, unpushed, or
  unmerged work in both repositories, writes the handoff document to Proton Drive instead of the OS
  temporary directory, registers it in `handoff_map.json`, and closes out with `end-session`.
- `end-session` can now be invoked by agents and other skills, and routes conversation reasoning
  for the next machine to the Proton Drive handoff document.

## [1.4.18] - 2026-09-14

### Changed

- Bumped `react` and `react-dom` from 19.2.8 to 19.3.0, `lucide-react` from 1.42.0 to 1.44.0,
  `@types/react` from 19.2.18 to 19.3.0, `@types/react-dom` from 19.2.7 to 19.3.0, and
  `@types/node` from 26.5.0 to 26.5.1.

## [1.4.17] - 2026-09-11

### Changed

- Bumped `lucide-react` from 1.41.0 to 1.42.0, `@types/node` from 26.4.1 to 26.5.0, and `oxlint`
  from 1.81.0 to 1.82.0.

## [1.4.16] - 2026-09-09

### Fixed

- Removed the hard-coded project memory directory slug from the `end-session` skill, which named
  one Windows checkout and was therefore wrong on any other machine, path, or git worktree. The
  skill now relies solely on the memory directory the harness names in the session's system prompt.

## [1.4.15] - 2026-09-08

### Changed

- Bumped the transitive `baseline-browser-mapping` dependency from 2.10.24 to 2.11.21.

## [1.4.14] - 2026-09-08

### Fixed

- Removed the manually embedded Cloudflare Web Analytics beacon so Cloudflare Pages supplies the
  site's single beacon instead of producing duplicate real-user monitoring submissions.

### Added

- Added a scheduled Chromium production check that rejects duplicate or manually embedded
  Analytics scripts, missing RUM delivery, browser errors, and failed requests.

## [1.4.13] - 2026-09-08

### Changed

- Recorded the decision to keep the portfolio focused without a notes or blog section until the
  owner wants one and can sustain a defined publication cadence; the existing `Currently
exploring` content remains the signal for active learning.

## [1.4.12] - 2026-09-08

### Changed

- Updated `@playwright/test` from 1.62.1 to 1.63.0.

## [1.4.11] - 2026-09-07

### Changed

- Updated `vitest` from 4.1.9 to 5.0.0 and `@vitest/coverage-v8` from 4.1.11 to 5.0.0.

## [1.4.10] - 2026-09-07

### Changed

- Updated `lucide-react` from 1.38.0 to 1.41.0, `@testing-library/user-event` from 14.6.6 to
  14.6.7, `@types/node` from 26.4.0 to 26.4.1, `@types/react-dom` from 19.2.5 to 19.2.7, and
  `oxlint` from 1.80.0 to 1.81.0.

## [1.4.9] - 2026-09-07

### Changed

- Required human actions left behind by agent work now have a fixed home: a `ready-for-human`
  Issue on the private Holland.VIP board plus a step-by-step runbook page in the private wiki,
  linked from the Issue. The rule lives in the work-tracking guide, and the docs-updater agent
  along with the end-session, ship, wizard, and handoff skills file or verify both records instead
  of leaving the action in a report, handoff, changelog line, or Markdown to-do.

## [1.4.8] - 2026-09-06

### Changed

- Recorded the decision to keep Lighthouse budgets advisory after reviewing 60 measurements from
  12 CI runs, including the evidence, maintainer report-review responsibility, and criteria for
  reconsidering merge enforcement. Existing budgets and workflow behavior remain unchanged.

## [1.4.7] - 2026-09-06

### Security

- Require a supported GitHub HTTPS or SSH locator before cloning the private companion, rejecting
  plain HTTP, embedded credentials, unexpected ports, query strings, fragments, and malformed
  repository paths. Normalize accepted HTTPS locators before passing them to Git.

## [1.4.6] - 2026-09-05

### Security

- Fetch featured repository metadata anonymously and require an explicitly public response with
  the expected GitHub identity before including it in the portfolio or refreshed snapshots.
- Omit unavailable or rejected repositories without restoring their old snapshots, while retaining
  reviewed fallback data for transient failures and preserving non-throwing static builds.

## [1.4.5] - 2026-09-04

### Changed

- Made GitHub the canonical destination and source for every work item: Issues are the unit of
  work, a private cross-repository Project board is the single aggregating view, and draft security
  advisories carry undisclosed vulnerabilities. Recorded the decision in ADR 0004 and rewrote the
  work-tracking guide around it.

### Removed

- Removed the private handoff file that mirrored active Issues, the next action, and last verified
  commits, along with the guidance and bootstrap output that pointed at it. The mirror drifted from
  the tracker within a day; querying GitHub replaces it.

## [1.4.4] - 2026-09-04

### Changed

- Updated `next` from 16.3.3 to 16.3.4.

## [1.4.3] - 2026-09-03

### Changed

- Updated `lucide-react` from 1.37.0 to 1.38.0.

## [1.4.2] - 2026-09-03

### Added

- Added a reproducible five-run Lighthouse command with versioned performance and best-practices
  budgets against the static export, plus an advisory CI job that retains diagnostic reports.

### Fixed

- Made Lighthouse collection portable across Windows and Linux by using Playwright's managed
  Chromium through Puppeteer, while overriding stale CLI transitive dependencies with audited
  versions.

## [1.4.1] - 2026-09-02

### Added

- Added weekly and manually dispatchable Firefox and WebKit end-to-end coverage against one
  reusable static export, with independent browser jobs and engine-specific diagnostic reports.

### Fixed

- Kept the skip link first in WebKit keyboard navigation by declaring its intended tab stop
  explicitly.

## [1.4.0] - 2026-09-02

### Added

- Published a static schema.org `Person` and `WebSite` graph on the homepage so search engines and
  AI systems can connect the portfolio's canonical identity, contact address, and social profiles.

## [1.3.3] - 2026-09-02

### Added

- Added a locally reproducible production smoke command that verifies the homepage, complete
  security-header contract, public metadata and security artifacts, 404 behavior, and www-to-apex
  redirect with retries and contract-specific diagnostics.
- Expanded the daily and manually dispatchable production smoke workflow to run the complete
  deployed HTTP contract.

## [1.3.2] - 2026-09-02

### Security

- Updated the transitive development dependency `fast-uri` from 3.1.5 to 3.1.7 to incorporate its
  security fixes.

## [1.3.1] - 2026-09-02

### Added

- Added one root command to move the public repository and optional private companion to `main`
  and fast-forward each from `origin/main`, while refusing dirty or divergent worktrees.

## [1.3.0] - 2026-09-02

### Added

- Published an RFC 9116 security contact document at `/.well-known/security.txt`, with canonical,
  policy, language, and expiration metadata.
- Added an HTTP-level regression check for the exported security contact document and documented
  its annual renewal policy, including the CI warning window.

### Fixed

- Preserved the hidden `.well-known` directory when transferring the static export between CI
  jobs, so Playwright verifies the same security contact document that is deployed.

## [1.2.0] - 2026-09-02

### Added

- Added one validated command to refresh both committed GitHub fallback snapshots through
  process-scoped credentials, sharing the production query and normalization contracts.
- Added a non-sensitive live-versus-fallback marker to the static homepage so automated checks can
  detect degraded GitHub data without visible UI noise.

### Changed

- The scheduled Cloudflare refresh now follows the deploy-hook response through the corresponding
  Pages deployment, fails on provider failure or timeout, and verifies live GitHub data on both the
  deployment artifact and production homepage before reporting success.

## [1.1.50] - 2026-09-01

### Changed

- Updated `lucide-react` from 1.35.0 to 1.37.0.

## [1.1.49] - 2026-09-01

### Changed

- Updated `lucide-react` from 1.34.0 to 1.35.0, `next` from 16.3.2 to 16.3.3,
  `@testing-library/react` from 16.3.2 to 16.3.3, `@types/node` from 26.3.0 to 26.4.0, and
  `@vitejs/plugin-react` from 6.1.0 to 6.1.1.

## [1.1.48] - 2026-08-29

### Fixed

- Added compatible raster icons for Apple touch devices, conventional favicon consumers, and the
  web manifest, including separate `any` and `maskable` variants for platform-appropriate display.

## [1.1.47] - 2026-08-28

### Added

- Added a stable architecture reference and concise ADRs for release prediction, agent-artifact
  synchronization, and the independent private-workspace boundary.

### Changed

- Consolidated coding-agent guidance into authoritative `AGENTS.md` rules with thin Claude and
  Copilot overlays, and updated the docs-updater agent to route each fact to one owning document.
- Updated the CSS documentation guard to validate the single owning architecture reference
  instead of requiring duplicated utility catalogs in tool overlays.
- Shortened the human README, corrected contributor guidance to the 95% coverage contract, and
  moved the surviving derived backlog into public Issues #121–#129.
- Updated the workspace bootstrap guide for the private repository's reorganized settings example.

### Removed

- Removed redundant directory READMEs and completed planning, design, and research documents whose
  durable decisions now live in ADRs and whose work state now lives in GitHub Issues.
- Removed the unrelated `public/README.md` handoff so it is no longer copied into the deployed
  static export.

## [1.1.46] - 2026-08-28

### Changed

- Updated `lucide-react` from 1.33.0 to 1.34.0, `@types/node` from 26.2.0 to 26.3.0, and
  `oxlint` from 1.79.0 to 1.80.0.

## [1.1.45] - 2026-08-27

### Changed

- `CONTRIBUTING.md` now tells contributors to install with `npm ci`, matching the README, the
  workspace bootstrap guide, and CI, so a first install reproduces the locked dependency tree
  instead of potentially rewriting `package-lock.json`.

## [1.1.44] - 2026-08-27

### Added

- Added `npm run bootstrap:private` (`scripts/bootstrap-private.mjs`), which installs the private
  companion repository into the ignored `private/` directory on a fresh machine or new git
  worktree: it reads the clone locator from 1Password, accepts only a credential-free GitHub URL,
  and exits without changes when the companion is already installed.

### Changed

- The workspace bootstrap guide now leads with the bootstrap script, documents its `--url`,
  `--op-reference`, and `--service-account-reference` options, and notes that its PowerShell steps
  map one-to-one to bash.

## [1.1.43] - 2026-08-27

### Changed

- Updated `@types/react-dom` from 19.2.4 to 19.2.5.

## [1.1.42] - 2026-08-25

### Changed

- Updated `next` from 16.3.1 to 16.3.2 and `@testing-library/user-event` from 14.6.5 to 14.6.6.

## [1.1.41] - 2026-08-25

### Added

- Added a fresh-machine bootstrap and storage contract for an independent private companion
  repository under the public clone's ignored `private/` directory, including safe 1Password
  injection and public/private Issue routing.
- Added a portable root ignore for agent scratch output and preserved the workspace portability
  research and implementation plan as public documentation.

### Changed

- Updated `/end-session` to reconcile both repositories, keep `private/CURRENT.md` as a short Issue
  handoff, and report uncommitted or unpushed private work without publishing it.

## [1.1.40] - 2026-08-24

### Changed

- Updated `lucide-react` from 1.31.0 to 1.33.0, `@vitejs/plugin-react` from 6.0.5 to 6.1.0,
  `@vitest/coverage-v8` from 4.1.10 to 4.1.11, and `oxlint` from 1.78.0 to 1.79.0.
- Replaced Oxlint's removed React Compiler umbrella rule with the explicit compiler-rule set
  supported by Oxlint 1.79.

## [1.1.39] - 2026-08-21

### Changed

- Updated `@testing-library/user-event` from 14.6.4 to 14.6.5.

## [1.1.38] - 2026-08-20

### Security

- Bumped the transitive `nanoid` dependency (via `postcss`) from 3.3.17 to 3.3.18, resolving
  GHSA-2v37-7h3g-55p8 (high): custom generators could loop indefinitely when `size` is zero.

## [1.1.37] - 2026-08-20

### Added

- New `/end-session` agent skill for closing out a work session: it sorts the session's output into
  project memory, the gitignored `private/` docs, GitHub issues, and local-workspace cleanup, and
  stops short of pushing or shipping.

## [1.1.36] - 2026-08-17

### Changed

- Updated `next` from 16.3.0 to 16.3.1, `@axe-core/playwright` from 4.12.1 to 4.13.0, and
  `@testing-library/user-event` from 14.6.3 to 14.6.4.

## [1.1.35] - 2026-08-10

### Changed

- Standardized local development, CI, and Cloudflare Pages builds on Node.js 26 with matching
  Node type definitions.
- Updated `lucide-react` from 1.29 to 1.31 and `@testing-library/jest-dom` from 7.0.0 to 7.0.1.

### Removed

- Removed the unused `@babel/core` dependency override.

## [1.1.34] - 2026-08-10

### Changed

- Upgraded the development toolchain to TypeScript 7.0.2 and enabled Oxlint's type-aware checks
  through `oxlint-tsgolint`.
- Updated the lint scripts, dependency grouping, editor recommendations, and repository guidance
  to use Oxlint consistently.

### Removed

- Removed the ESLint configuration and all ESLint and typescript-eslint dependencies.

## [1.1.33] - 2026-08-10

### Changed

- Updated `lucide-react` from 1.28 to 1.29.

## [1.1.32] - 2026-08-10

### Changed

- `next-env.d.ts` is no longer tracked and is ignored as a Next.js-generated file, preventing
  `next dev` and `next build` from leaving environment-specific type-reference churn in the
  working tree.

## [1.1.31] - 2026-08-09

### Added

- A root `CONTEXT.md` now defines the portfolio's domain language, including the distinctions
  between skills and capabilities, professional projects and featured repositories, and current
  exploration versus established expertise.

### Changed

- The `/ship` workflow now classifies each branch as major, minor, or build-only before computing
  its exact release, confirms major/minor release-line changes, regenerates agent artifacts, and
  verifies the same sync gate enforced by CI.
- The installed engineering workflows now carry work through review, accepted fixes, the required
  changelog entry, and PR creation, while preserving this repo's existing tracker and domain-doc
  configuration on setup reruns.

### Fixed

- Agent-facing guidance now matches the repository's actual CSS tokens, static-export Playwright
  target, 95% coverage gate, generated-file banners, framework version, and test inventory.
- Repo-local skill guidance now uses the real standards sources, Vitest-native examples,
  skill-relative support files, and neutral triage examples; all generated Claude mirrors and
  project skill hashes were refreshed from the authored sources.

## [1.1.30] - 2026-08-09

Closes [#99](https://github.com/jwh3times/holland-vip/issues/99).

### Added

- `tests/global-setup.ts` — the e2e suite now refuses to run against a server that isn't this site.
  `reuseExistingServer` is on locally and accepts whatever already holds port 3000; since that's the
  Next.js default, another project's dev server could silently become the system under test. It
  happened twice during the architecture review — 20 of 72 tests failed with assertions that read
  like a regression here, and nothing in the output mentioned the port. A false _pass_ was possible
  the same way.

  The check probes `baseURL` and, if something answers, requires this site's `og:url` and name
  before any test runs. Nothing listening is fine — Playwright starts ours. Only a foreign server is
  rejected, and the error names the port, the foreign `<title>`, what was missing, and the
  `netstat`/`lsof` command to find the process.

### Changed

- `siteUrl` moved from `app/layout.tsx` into `siteConfig.url`, joined by `siteConfig.name`, so the
  identity check reads the same source the metadata does and can't drift from it.

## [1.1.29] - 2026-08-09

Closes [#92](https://github.com/jwh3times/holland-vip/issues/92), the last finding from the
architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93).

### Changed

- **The unit-coverage gate now measures code where coverage means something, at 95% instead of 80%.**
  A component whose body is a single JSX expression is one statement to V8, so it reported 100% the
  moment anything rendered it — `components/ui/section.tsx` scored 4/4 over 118 physical lines.
  Across the old scope V8 instrumented 180 lines of 2,023 physical (9%), so the headline percentage
  described almost nothing while reading as a guarantee. `components/sections/**` and the pure-JSX
  shells (`section`, `card`, `badge`, `bento-grid`) are now excluded, and all four thresholds are
  95% over the remaining 19 files.
- The excluded modules are not untested. Their behaviour is asserted through the seams added
  earlier in the review — surface alternation and the anchor registry in `section.test.tsx`,
  rendered copy in `sections.test.tsx`, accents in `accent.test.tsx`.

### Added

- Tests for the five branches that were uncovered in the narrowed scope, each asserting what the
  branch is for rather than merely executing it:
  - `app/page.tsx` — the empty-repos path drops the Open Source section, and the sections that
    remain still alternate surfaces. This is the mechanism that stops a missing section re-phasing
    the ones below it.
  - `components/mode-toggle.tsx` — the SSR placeholder, reachable only through `renderToString`.
    Asserts it is inert and announces no theme-dependent label before hydration.
  - `lib/github.ts` and `lib/github-contributions.ts` — the documented degrade-to-empty arms for a
    corrupt committed snapshot.
  - `lib/github-contributions.ts` — an unrecognised `contributionLevel` renders as level 0 rather
    than `undefined`, which would break the heatmap's class lookup.
- `@types/react-dom` as a devDependency, needed for `react-dom/server` in the SSR test.

### Notes

- The narrowed scope sits at 100% on all four metrics, five points above the gate. The gate was
  verified to bite: removing three `lib` test files drops branches to 61% and fails with exit 1 on
  all four metrics. That same regression would have passed the old 80% gate on statements (81.6%)
  and lines (84.6%).

## [1.1.28] - 2026-08-09

The two independent items from [#92](https://github.com/jwh3times/holland-vip/issues/92) — the ones
that needed no decision about the coverage threshold.

### Added

- `parseRepos()` in `lib/github.ts` and `parseCalendar()` in `lib/github-contributions.ts`, replacing
  unchecked `as` casts over the two committed fallback snapshots. Both return `null` rather than
  throwing, so the degradation path still can't break the build; a malformed snapshot now degrades
  to empty rather than rendering garbage.
- `tests/unit/github-fallback.test.ts` — 10 cases asserting the committed snapshots parse, cover
  every entry in `FEATURED_REPO_SLUGS`, and hold ascending ISO dates across 50–54 weeks.
- `aria-controls` on the mobile menu toggle, and `id="mobile-menu"` on the panel it opens.

### Changed

- The e2e specs no longer select on Tailwind utility classes. `mobile-navigation.spec.ts` targets
  `data-testid="desktop-nav"` and `#mobile-menu` instead of `.hidden.md:flex` and
  `.md:hidden` + `.last()`, and asserts `aria-expanded` flips. `accessibility.spec.ts` asserts the
  skip link's measured geometry — collapsed to ≤2px, larger and visible on focus — instead of
  matching class names, and adds a check that it is the first tabbable element.

### Fixed

- The skip-link assertions were vacuous. `toHaveClass(/sr-only/)` matches the substring inside
  `focus:not-sr-only`, so it passed even when `sr-only` was absent and the link was never hidden.
  Confirmed by removing `sr-only` from `app/layout.tsx`: the new geometry assertion fails, the old
  one did not.

## [1.1.27] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part three and the last of the wave: the `globals.css` interface
([#90](https://github.com/jwh3times/holland-vip/issues/90)).

### Added

- `tests/unit/globals-css.test.ts` — a guard on the `globals.css` interface. It fails the build on
  a utility class with no caller, an `@keyframes` block no animation references, a CSS variable
  nothing reads, a class undocumented in `CLAUDE.md` or `AGENTS.md`, or two text tokens with
  identical values in both themes. This replaces the by-hand audit that found the original dead
  classes.

### Removed

- `.text-badge` / `--badge-text` and `.text-subheading` / `--subheading-text`. Both were
  byte-identical to `--heading-text` in light and dark, so they were exact aliases of
  `.text-heading` and offered callers three names for one colour. Their two call sites now use
  `.text-heading` directly — no visual change.

### Changed

- `CLAUDE.md` and `AGENTS.md` now document `.bento-card-bg` and `.card-bg-white-80`, the last two
  utility classes missing from the files agents are told to read.

### Notes

- The remaining single-caller classes stay. `card-bg-*` and `text-badge-*` have one reference each
  because that reference is `lib/accent.ts`, and `section-surface` / `section-surface-contrast`
  because theirs is `components/ui/section.tsx` — one consumer because the consumer is the seam.
  `hero-section`, `glass`, `gradient-text-blue`, and `bento-card-bg` express theme-aware gradients,
  `backdrop-filter`, and `background-clip: text`, which utility classes can't replace.

## [1.1.26] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part two: the content seam ([#86](https://github.com/jwh3times/holland-vip/issues/86)).

### Added

- `content/` — ten typed modules holding what the site says, separate from how it looks:
  `hero`, `about`, `skills`, `capabilities`, `problem-solving`, `experience`, `projects`,
  `education`, `contact`, and `open-source`. Editing the resume is now a one-file change that
  doesn't involve opening a component.

### Changed

- Section components no longer own any copy. The nine unshared record shapes they each defined now
  share one vocabulary, and the four sections that had prose welded into JSX — About's three
  biography paragraphs, Education's school, degrees and badges, Hero, and Contact — carry it as
  data.
- `content/projects.ts` names an icon with a `ProjectIcon` key rather than embedding JSX in a data
  array; `ProjectsSection` maps the key to a Lucide component, keeping presentation out of content.
- `ProblemSolving` renders its three per-card rows from `challengeRows` instead of three
  near-identical JSX blocks.
- `tests/unit/sections.test.tsx` imports the content modules and asserts against them instead of
  restating nine of their strings, so a resume edit no longer breaks the test file. The assertions
  also got stronger: they now cover every career highlight, skill, capability, challenge row, role,
  project, degree, and education badge rather than one sample of each.
- Docs corrected while updating them: the contact email is read from `siteConfig.email` in
  `lib/site-config.ts`, not hardcoded in `app/page.tsx` as `CLAUDE.md` and `README.md` claimed.

### Notes

- This change is text-for-text lossless. The rendered text of `out/index.html` was compared against
  `main` after normalizing whitespace and is identical.

## [1.1.25] - 2026-08-09

Wave 3 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93),
part one: the accent seam ([#89](https://github.com/jwh3times/holland-vip/issues/89)).

### Added

- `lib/accent.ts` — the site's accent palette as one union and one token table. `Accent` is
  `blue | green | purple | orange`; `accent[key]` yields `text`, `bullet`, `dot`, `ring`, `border`,
  `cardBg`, `badge`, and `iconChip`. `accentAt(index)` cycles for lists with no inherent accent.
- `components/ui/badge.tsx` — the pill badge, replacing five hand-written copies of the same class
  string that had drifted into two token orderings, one of them baked into content data.
- `components/ui/card.tsx` — the card shell, replacing five near-copies that had drifted on padding
  and on `transition-all` vs `transition-colors`. Takes an optional `accent` for tinted cards,
  `padding` (`md` / `lg`), and `interactive` for the hover lift.
- `tests/unit/accent.test.tsx` — 12 cases, including a guard that each accent's tokens actually name
  that accent, which catches a copy-paste slip like `green.dot = "bg-blue-500"`.

### Changed

- Content records across the section modules carry `accent: Accent` instead of `colorClass`,
  `bulletColor`, or inline Tailwind strings. The two local types both named `ColorKey` — which meant
  different things in `AboutSection` and `ExperienceSection` — are gone, as is `OpenSourceSection`'s
  index-cycled `accents` array. Adding a fifth accent is now one edit instead of seven.
- Green and orange heading text settles on the 700 shade. Both 600 and 700 were already in use
  (`SkillsSection` had 700; `AboutSection` and `TechnicalCapabilities` had 600), and 700 is the one
  that clears WCAG AA for normal-size text on the light surfaces. Blue and purple stay at 600.
- `README.md`'s `lib/` tree now lists the modules that are actually there rather than only
  `utils.ts`.

### Notes

- `ContributionHeatmap`'s level scale is deliberately left alone — it maps contribution intensity
  0–4, which is not accent identity.

## [1.1.24] - 2026-08-09

Wave 2 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93):
the Section shell ([#85](https://github.com/jwh3times/holland-vip/issues/85)).

### Added

- `components/ui/section.tsx` — the page-section shell every body section renders through. It owns
  the `py-20` rhythm, the centered container, the `h2`, the typed anchor id, and the background
  surface. Exports `Section`, `SECTION_IDS` / `NAV_SECTION_IDS` (the anchor registry),
  `SectionSurface`, `SectionSurfaceProps`, and `surfaceAt`.
- Playwright coverage for the two contracts that previously had none: no two adjacent sections
  share a computed background, and every nav anchor resolves to a section that exists.
- `tests/unit/section.test.tsx` — 13 cases covering the shell, the alternation invariant, and the
  id registry.

### Changed

- **Sections no longer choose their own background.** `app/page.tsx` holds the ordered
  `bodySections` list and derives each surface from position via `surfaceAt(index)`. The nine body
  sections accept `SectionSurfaceProps` and forward it. `HeroSection` is unaffected — it keeps its
  own background and sits outside the alternation.
- `OpenSourceSection`'s empty-repos check moved up into `app/page.tsx`, which now drops the section
  from the ordered list rather than having the section return `null` at render time.
- `Navigation` builds its links from `NAV_SECTION_IDS` and a total `Record<NavSectionId, string>`
  of labels instead of a hand-written array of `{ href, label }` literals. A nav link pointing at a
  section id that doesn't exist is now a type error.
- Section heading margins collapsed from four values (`mb-4`, `mb-6`, `mb-12`, `mb-16`) to one
  rule: `mb-12`, or `mb-4` when a subtitle follows. Education, Experience, and Problem-Solving
  headings tighten slightly; Contact's loosens.
- `ContactSection`'s intro paragraph now renders as the shell's subtitle: centered and constrained
  to `max-w-2xl`, at the shared subtitle size rather than `text-lg`.

### Fixed

- **Adjacent sections rendered on the same background.** `OpenSourceSection` and `EducationSection`
  were both `section-surface`, breaking the alternation the docs describe. Worse, `OpenSourceSection`
  returning `null` at runtime silently re-phased every section below it. Both are structural now:
  surfaces are assigned from position after the list is built.
- `#education` was an anchor nothing linked to and nothing checked. It is still deliberately absent
  from the nav, but that is now a recorded decision in the id registry rather than an accident.

## [1.1.23] - 2026-08-09

Wave 1 of the architecture review tracked in [#93](https://github.com/jwh3times/holland-vip/issues/93)
— four independent findings, none of which touch the section modules.

### Added

- `components/ui/cta.tsx` — the site's call-to-action module. Interface is two variants
  (`primary`, `secondary`) and two sizes (`md`, `lg`); the implementation derives the rendered
  element from the props (no `href` → `<button>`, `/…` → `next/link`, anything else → `<a>` with
  `target`/`rel` for external hosts) and owns focus-visible rings the hand-copied CTAs never had.
- `lib/github-fetch.ts` — `githubFetch` (auth headers, `force-cache`, non-OK → throw, optional
  `requireToken`) and `withFallback` (degrade to a committed snapshot, warn once). Both
  `getFeaturedRepos` and `getContributions` now sit behind it.
- `lib/github-contributions-query.mjs` — the GraphQL query and contribution-level map, shared with
  `scripts/seed-contributions.mjs` so a query change can't silently drift the committed snapshot.
  Plain `.mjs` because that script runs under bare `node` with no build step.
- Tests: `tests/unit/cta.test.tsx` (11 cases, element derivation and variants),
  `tests/unit/github-fetch.test.ts` (9 cases asserting the fetch/degrade policy directly), and
  two `agent-sync` cases covering binary asset copying and CRLF sources.

### Changed

- `getFeaturedRepos` now documents its request count and failure mode: one request per entry in
  `FEATURED_REPO_SLUGS` via `Promise.all`, so a single failure discards the whole batch.
  `getContributions` issues one.
- `scripts/lib/agent-sync.mjs` states in its header that `syncAll` is the entry point and the pure
  transforms are exported only as test handles.

### Removed

- `components/ui/button.tsx` and its test — 24 declared variant/size combinations over a four-line
  implementation with one production caller using two of them. The one ghost icon button is
  inlined into `mode-toggle.tsx`; the five real CTAs now go through `Cta`.
- `@radix-ui/react-slot` and `class-variance-authority` dependencies, unused once `button.tsx` went.
- Dead `globals.css` surface: `.text-balance` (Tailwind v4 provides it), `.animate-fadeIn`,
  `.animate-slideInLeft`, `.animate-slideInRight`, `.animate-scaleIn`, their four `@keyframes`
  blocks, and the unreferenced `--border` / `--muted-foreground` variables.
- `bannerLine` and `DEFAULT_PATHS` from the `agent-sync` module's exports — zero callers each.

### Fixed

- `ContactSection`'s CTA rendered in its own flat blue rather than the site's primary style; it now
  matches the other CTAs.

## [1.1.22] - 2026-08-08

### Added

- `docs/agents/` config consumed by the `mattpocock/skills` engineering skills (triage,
  to-tickets, to-spec, domain-modeling, etc.): `issue-tracker.md` (GitHub Issues via `gh`, with
  wayfinding operations), `triage-labels.md` (the five canonical triage-role labels, kept at
  their defaults), and `domain.md` (single-context `CONTEXT.md`/`docs/adr/` consumption rules —
  neither exists yet and is created lazily by `domain-modeling` when needed).
- `## Agent skills` section in `AGENTS.md` pointing to the new `docs/agents/*.md` files.

## [1.1.21] - 2026-08-07

### Added

- 25 third-party skills from `mattpocock/skills` under `.agents/skills/`, with provenance and
  content hashes recorded in `skills-lock.json`.

### Changed

- **Inverted the skill sync direction.** `.agents/skills/<name>/**` is now the authored source and
  `.claude/skills/<name>/**` is the generated mirror (previously the reverse). This matches where
  the skill installer writes, so installing or updating a skill is a one-way operation instead of
  a manual copy. Subagents are unchanged: `.claude/agents/<name>.md` still generates
  `.codex/agents/<name>.toml`.
- Moved the `ship` skill's authored source to `.agents/skills/ship/SKILL.md` so all skills follow
  one model.
- `.prettierignore` now excludes `.claude/skills/` instead of `.agents/`, so Prettier formats the
  authored skill sources and leaves the generated mirror to `scripts/sync-agents.mjs`.
- `sync-agents.yml` stages `.claude/skills`/`.codex` rather than `.agents`/`.codex`; without this
  the auto-sync workflow would have silently stopped committing drift.

### Notes

- The whole skill directory is drift-controlled — references, `scripts/*.sh`, and
  `agents/openai.yaml` — not just `SKILL.md`.
- The generated mirror must not be replaced with symlinks into `.agents/`: this repo is developed
  on Windows with `core.symlinks=false`, so Git commits duplicated content instead of links, and
  the generator skips symlinked directories and would prune the mirror as extraneous.

## [1.1.20] - 2026-08-07

### Security

- Resolved all open Dependabot alerts by refreshing transitive lockfile entries: `postcss`
  8.5.15 → 8.5.26 (GHSA-r28c-9q8g-f849 path traversal, GHSA-fxqj-rqcc-2cmp incomplete fix) and
  `brace-expansion` 1.1.15 → 1.1.18 / 5.0.6 → 5.0.9 (GHSA-3jxr-9vmj-r5cp ReDoS, plus
  GHSA-mh99-v99m-4gvg and GHSA-rgw5-rvv9-x895 surfaced by `npm audit`). `npm audit` now reports
  0 vulnerabilities.

### Changed

- Synced `package-lock.json` with the declared `package.json` ranges, which had drifted:
  `next` 16.2.9 → 16.3.0, `eslint` 10.5.0 → 10.8.0, `typescript-eslint` 8.61.1 → 8.65.0,
  `@tailwindcss/postcss` 4.3.1 → 4.3.3, `@vitejs/plugin-react` 6.0.2 → 6.0.5.

## [1.1.19] - 2026-08-07

### Changed

- Dependency bumps: `next` and `@next/eslint-plugin-next` 16.2.12 → 16.3.0,
  `@testing-library/user-event` 14.6.1 → 14.6.3.

## [1.1.18] - 2026-08-05

### Changed

- Dependency bump (transitive, lockfile only): `fast-uri` 3.1.4 → 3.1.5.

## [1.1.17] - 2026-08-03

### Changed

- Dependency bumps: `@playwright/test` 1.62.0 → 1.62.1, `@types/react` 19.2.17 → 19.2.18,
  `@vitejs/plugin-react` 6.0.4 → 6.0.5.

## [1.1.16] - 2026-07-30

### Changed

- Dependency bump: `lucide-react` 1.27.0 → 1.28.0.

## [1.1.15] - 2026-07-29

### Changed

- Dependency bumps: `@types/node` 26.1.1 → 26.1.2, `eslint` 10.7.0 → 10.8.0,
  `globals` 17.7.0 → 17.8.0, `jsdom` 30.0.0 → 30.0.1.

## [1.1.14] - 2026-07-27

### Changed

- Dependency bump (major): `jsdom` 29.1.1 → 30.0.0.

## [1.1.13] - 2026-07-27

### Changed

- Dependency bumps: `next` and `@next/eslint-plugin-next` 16.2.11 → 16.2.12,
  `@playwright/test` 1.61.1 → 1.62.0, `@radix-ui/react-slot` 1.3.1 → 1.3.3,
  `lucide-react` 1.26.0 → 1.27.0.

## [1.1.12] - 2026-07-23

### Changed

- Dependency bumps: `@eslint-react/eslint-plugin` 5.13.1 → 5.18.0, `eslint` 10.6.0 → 10.7.0,
  `typescript-eslint` 8.63.0 → 8.65.0, `lucide-react` 1.25.0 → 1.26.0,
  `@radix-ui/react-slot` 1.3.0 → 1.3.1.

## [1.1.11] - 2026-07-23

### Added

- Codex CLI support: skills and subagents are now generated from the canonical `.claude/` sources
  by `scripts/sync-agents.mjs` (`npm run sync:agents`), producing `.agents/skills/**` (a verbatim
  mirror of `.claude/skills/**`) and `.codex/agents/*.toml` (a transform of `.claude/agents/*.md`,
  with `sandbox_mode` derived from the `tools:` list and `model` omitted). Edit only the `.claude/`
  sources — every generated file carries a `GENERATED — do not edit` banner.
- `.github/workflows/sync-agents.yml`: on pull requests, regenerates the Codex artifacts and
  auto-commits any drift back to the branch (requires the `SYNC_PAT` secret; skips forks;
  self-terminating).
- A secret-free `node scripts/sync-agents.mjs --check` step in the `ci.yml` `build` job that fails
  the build on stale Codex artifacts, so drift is caught even before the auto-commit secret is set.

### Changed

- `.prettierignore` now excludes the generated `.agents/` and `.codex/` directories.

## [1.1.10] - 2026-07-22

### Changed

- Bumped the transitive `fast-uri` dependency from 3.1.2 to 3.1.4 (lockfile only).

## [1.1.9] - 2026-07-22

### Changed

- Bumped `next` and `@next/eslint-plugin-next` to 16.2.11, `react` and `react-dom` to 19.2.8, and
  `@vitejs/plugin-react` to 6.0.4.

## [1.1.8] - 2026-07-21

### Changed

- Bumped `prettier` from 3.9.5 to 3.9.6.

## [1.1.7] - 2026-07-21

### Changed

- Bumped `@testing-library/jest-dom` from 6.9.1 to 7.0.0.

## [1.1.6] - 2026-07-17

### Changed

- Bumped `lucide-react` to 1.25.0 and `@tailwindcss/postcss` to 4.3.3.

## [1.1.5] - 2026-07-16

### Added

- `/ship` skill (`.claude/skills/ship/SKILL.md`): refreshes docs, writes the `CHANGELOG.md`
  entry for the version the merge will mint, runs fast checks, and opens or updates the PR.
- `CHANGELOG.md`, following Keep a Changelog.
- `scripts/next-version.mjs`: the single source of truth for the next `major.minor.build`
  version, called by `version.yml`, the CI changelog guard, and `/ship`.
- CI `changelog` guard job in `.github/workflows/ci.yml` that fails a PR whose top
  `CHANGELOG.md` version does not match the version its merge will mint (skipped for Dependabot).

### Changed

- `.github/workflows/version.yml` now computes the release version via `scripts/next-version.mjs`
  instead of inline shell, so the tag workflow and the changelog guard share one implementation.
- The `docs-updater` agent now maintains `AGENTS.md` in addition to `CLAUDE.md` and `README.md`,
  so agent-facing guidance no longer drifts unnoticed.

### Fixed

- An unsound cast in `tests/unit/github-contributions.test.ts` that made `npx tsc --noEmit` fail
  (`TS2352`). No CI job type-checks test files, so it went unnoticed until `/ship` began gating on
  `tsc`.
- `.prettierignore` now excludes `.superpowers/` agent scratch. Prettier doesn't read nested
  `.gitignore` files, so `npm run format:check` failed on untracked working files.

### Removed

- The `Stop` hook in `.claude/settings.json` that ran a docs-freshness agent on every stop; docs
  are now refreshed once per `/ship`, when a branch is ready for review, rather than on every turn.

## [1.1.4] - 2026-07-15

### Changed

- Added `npm` and `github-actions` labels to `.github/dependabot.yml`.

## [1.1.3] - 2026-07-15

### Changed

- Moved the Dependabot update schedule to 05:00.

## [1.1.2] - 2026-07-14

### Changed

- Bumped `actions/setup-node` from 6 to 7.

## [1.1.1] - 2026-07-10

### Changed

- Bumped grouped minor/patch dependencies: `lucide-react` 1.23 → 1.24, `prettier` 3.9.4 → 3.9.5.

## [1.1.0] - 2026-07-09

### Added

- `AGENTS.md`: agent-facing guidance (commands, CI/CD, conventions, constraints) for coding
  agents that don't read `CLAUDE.md`.

### Changed

- Adopted the three-part `v<major>.<minor>.<build>` SemVer release scheme in
  `.github/workflows/version.yml`.
