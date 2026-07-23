# Codex ↔ Claude Agent-Artifact Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate the Codex CLI skill and subagent artifacts from the canonical `.claude/` sources with a single Node script, and prevent drift via a CI auto-commit workflow.

**Architecture:** `.claude/` is the single source of truth. `scripts/sync-agents.mjs` (a thin CLI over pure functions in `scripts/lib/agent-sync.mjs`) verbatim-mirrors `.claude/skills/**` to `.agents/skills/**` and transforms each `.claude/agents/*.md` into `.codex/agents/*.toml`. A `pull_request` workflow regenerates and commits any drift back to the PR branch. The generator has a `--check` mode and is covered by Vitest unit + integration tests.

**Tech Stack:** Node.js 24 (ESM `.mjs`), Vitest, GitHub Actions. Zero new npm dependencies.

## Global Constraints

- **Node version:** 24 (from `.nvmrc`); scripts are ESM `.mjs`, matching `scripts/next-version.mjs`.
- **Zero new dependencies:** hand-rolled minimal frontmatter reader + TOML emitter; no YAML/TOML libraries.
- **`.claude/` is canonical:** only `.claude/skills/**` and `.claude/agents/*.md` are hand-edited. Everything under `.agents/` and `.codex/` is generated output and carries a `GENERATED — do not edit` banner.
- **No `CLAUDE.md → AGENTS.md` substitution:** skill/agent content is copied/transformed verbatim; the description text `CLAUDE.md, README.md, and AGENTS.md` must survive intact (this is the corruption being fixed).
- **Deterministic output:** LF line endings, no timestamps, so regeneration never churns and `--check` is stable.
- **Subagent field mapping:** `name`→`name`, `description`→`description` (verbatim), body→`developer_instructions` (TOML literal `'''` string), `tools:`→`sandbox_mode` (`workspace-write` if it contains `Write`/`Edit`, else `read-only`), `model` omitted.
- **Banner text (exact):** `GENERATED — do not edit. Source: <repo-relative-source>. Regenerate: npm run sync:agents` (prefixed with `#` for both TOML and the skill-frontmatter comment).
- **Coverage:** Vitest coverage `include` is `app/**`, `components/**`, `lib/**` only — `scripts/` is outside it, so the generator neither counts toward nor is gated by the 80% threshold. Do not add `scripts/` to coverage.
- **Formatting:** `.agents/` and `.codex/` are added to `.prettierignore`; `.claude/` sources remain Prettier-checked.

---

### Task 1: Generator library — pure transforms

**Files:**

- Modify: `.prettierignore` (add generated-artifact ignores)
- Create: `scripts/lib/agent-sync.mjs`
- Test: `tests/unit/agent-sync.test.ts`

**Interfaces:**

- Produces (consumed by Task 2 and the tests):
  - `bannerLine(sourceRelPath: string, commentPrefix: string): string`
  - `parseFrontmatter(md: string): { data: Record<string,string>, body: string }` — throws if no frontmatter
  - `deriveSandboxMode(toolsCsv?: string): "workspace-write" | "read-only"`
  - `tomlBasicString(value: string): string`
  - `agentMarkdownToToml(md: string, sourceRelPath: string): string` — throws if body contains `'''`
  - `injectSkillBanner(skillMd: string, sourceRelPath: string): string`

- [ ] **Step 1: Ignore generated artifacts in Prettier**

Append to `.prettierignore` (after the `coverage/` block):

```
# Generated agent artifacts — produced by scripts/sync-agents.mjs from the
# .claude/ sources. Prettier owns the sources; the generator owns these.
.agents/
.codex/
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/agent-sync.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  deriveSandboxMode,
  tomlBasicString,
  agentMarkdownToToml,
  injectSkillBanner,
} from "../../scripts/lib/agent-sync.mjs";

const SAMPLE_AGENT = [
  "---",
  "name: sample-agent",
  "description: Keeps CLAUDE.md, README.md, and AGENTS.md current.",
  "tools: Read, Write, Edit, Glob",
  "model: sonnet",
  "---",
  "",
  "Line one of instructions.",
  "Regex with a backslash: \\d+",
  "",
].join("\n");

describe("parseFrontmatter", () => {
  it("splits frontmatter keys from the body", () => {
    const { data, body } = parseFrontmatter(SAMPLE_AGENT);
    expect(data.name).toBe("sample-agent");
    expect(data.description).toBe("Keeps CLAUDE.md, README.md, and AGENTS.md current.");
    expect(data.tools).toBe("Read, Write, Edit, Glob");
    expect(body).toContain("Line one of instructions.");
  });

  it("throws when the frontmatter block is missing", () => {
    expect(() => parseFrontmatter("no frontmatter here")).toThrow(/frontmatter/);
  });
});

describe("deriveSandboxMode", () => {
  it("is workspace-write when Write or Edit is present", () => {
    expect(deriveSandboxMode("Read, Write, Glob")).toBe("workspace-write");
    expect(deriveSandboxMode("Read, Edit")).toBe("workspace-write");
  });
  it("is read-only otherwise", () => {
    expect(deriveSandboxMode("Read, Glob, Grep")).toBe("read-only");
    expect(deriveSandboxMode("")).toBe("read-only");
  });
});

describe("tomlBasicString", () => {
  it("wraps and escapes quotes and backslashes", () => {
    expect(tomlBasicString('a "b" \\ c')).toBe('"a \\"b\\" \\\\ c"');
  });
});

describe("agentMarkdownToToml", () => {
  it("maps fields, derives sandbox_mode, and keeps the description verbatim", () => {
    const toml = agentMarkdownToToml(SAMPLE_AGENT, ".claude/agents/sample-agent.md");
    expect(toml).toContain(
      "# GENERATED — do not edit. Source: .claude/agents/sample-agent.md. Regenerate: npm run sync:agents"
    );
    expect(toml).toContain('name = "sample-agent"');
    expect(toml).toContain('description = "Keeps CLAUDE.md, README.md, and AGENTS.md current."');
    expect(toml).toContain('sandbox_mode = "workspace-write"');
    expect(toml).toContain("developer_instructions = '''");
    expect(toml).toContain("Regex with a backslash: \\d+"); // backslash preserved
    expect(toml).not.toContain("model ="); // model intentionally omitted
  });

  it("throws when the body contains the TOML literal delimiter", () => {
    const bad = [
      "---",
      "name: x",
      "description: y",
      "tools: Read",
      "---",
      "",
      "has ''' inside",
      "",
    ].join("\n");
    expect(() => agentMarkdownToToml(bad, ".claude/agents/x.md")).toThrow(/'''/);
  });
});

describe("injectSkillBanner", () => {
  it("adds the banner as line 2, keeping --- on line 1", () => {
    const out = injectSkillBanner("---\nname: ship\n---\n\nBody\n", ".claude/skills/ship/SKILL.md");
    const lines = out.split("\n");
    expect(lines[0]).toBe("---");
    expect(lines[1]).toBe(
      "# GENERATED — do not edit. Source: .claude/skills/ship/SKILL.md. Regenerate: npm run sync:agents"
    );
    expect(lines[2]).toBe("name: ship");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/unit/agent-sync.test.ts`
Expected: FAIL — cannot resolve module `../../scripts/lib/agent-sync.mjs` (file does not exist yet).

- [ ] **Step 4: Implement the pure transforms**

Create `scripts/lib/agent-sync.mjs`:

```js
// Transforms + orchestration for keeping Codex agent artifacts in sync with
// their canonical .claude/ sources. See
// docs/superpowers/specs/2026-07-22-codex-agent-sync-design.md.
//
// The .claude/ tree is the single source of truth. This module derives:
//   .agents/skills/<name>/**   — verbatim mirror of .claude/skills/<name>/**
//   .codex/agents/<name>.toml  — transform of .claude/agents/<name>.md
// Output is deterministic (LF line endings, no timestamps) so regeneration
// never churns and --check is stable across platforms.

/** Repo-relative banner marking a file as generated. */
export function bannerLine(sourceRelPath, commentPrefix) {
  return `${commentPrefix} GENERATED — do not edit. Source: ${sourceRelPath}. Regenerate: npm run sync:agents`;
}

/**
 * Split a markdown document with a leading `---` YAML frontmatter block into
 * { data, body }. Handles the simple single-line `key: value` shape used by
 * this repo's agent files. Throws if the frontmatter block is missing.
 */
export function parseFrontmatter(md) {
  const normalized = md.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error("missing YAML frontmatter (expected a leading '---' block)");
  }
  const [, rawFrontmatter, body] = match;
  const data = {};
  for (const line of rawFrontmatter.split("\n")) {
    if (!line.trim()) continue;
    const kv = /^([A-Za-z0-9_-]+):\s?(.*)$/.exec(line);
    if (!kv) {
      throw new Error(`unsupported frontmatter line: ${JSON.stringify(line)}`);
    }
    data[kv[1]] = kv[2];
  }
  return { data, body };
}

/** Codex sandbox mode derived from a Claude `tools:` CSV. */
export function deriveSandboxMode(toolsCsv = "") {
  const tools = toolsCsv.split(",").map((t) => t.trim());
  return tools.includes("Write") || tools.includes("Edit") ? "workspace-write" : "read-only";
}

/** Encode a single-line JS string as a TOML basic (double-quoted) string. */
export function tomlBasicString(value) {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

/**
 * Transform a .claude/agents/<name>.md source into .codex/agents/<name>.toml
 * text. `sourceRelPath` is the repo-relative source path used in the banner.
 */
export function agentMarkdownToToml(md, sourceRelPath) {
  const { data, body } = parseFrontmatter(md);
  if (!data.name) throw new Error(`agent source ${sourceRelPath} is missing 'name'`);
  if (!data.description) {
    throw new Error(`agent source ${sourceRelPath} is missing 'description'`);
  }

  const instructions = body.replace(/\r\n/g, "\n").trim();
  if (instructions.includes("'''")) {
    throw new Error(
      `agent source ${sourceRelPath} body contains "'''", which collides with the TOML literal-string delimiter`
    );
  }

  return (
    [
      bannerLine(sourceRelPath, "#"),
      `name = ${tomlBasicString(data.name)}`,
      `description = ${tomlBasicString(data.description)}`,
      `sandbox_mode = ${tomlBasicString(deriveSandboxMode(data.tools))}`,
      "developer_instructions = '''",
      instructions,
      "'''",
    ].join("\n") + "\n"
  );
}

/**
 * Inject the generated-file banner as a YAML comment on the second line of a
 * skill's SKILL.md frontmatter, keeping `---` on line 1 so Codex still parses
 * the frontmatter. Files without frontmatter are returned unchanged (LF).
 */
export function injectSkillBanner(skillMd, sourceRelPath) {
  const normalized = skillMd.replace(/\r\n/g, "\n");
  const match = /^---\n/.exec(normalized);
  if (!match) return normalized;
  const banner = bannerLine(sourceRelPath, "#") + "\n";
  return normalized.slice(0, match[0].length) + banner + normalized.slice(match[0].length);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/unit/agent-sync.test.ts`
Expected: PASS — all cases green.

- [ ] **Step 6: Verify lint and formatting**

Run: `npm run lint && npm run format:check`
Expected: both pass (fix any formatting with `npm run format`).

- [ ] **Step 7: Commit**

```bash
git add .prettierignore scripts/lib/agent-sync.mjs tests/unit/agent-sync.test.ts
git commit -m "feat: pure transforms for codex agent-artifact generation"
```

---

### Task 2: FS orchestration, CLI, and npm script

**Files:**

- Modify: `scripts/lib/agent-sync.mjs` (add fs imports + `DEFAULT_PATHS` + `syncAll`)
- Create: `scripts/sync-agents.mjs` (CLI)
- Create: `tests/unit/agent-sync-io.test.ts`
- Modify: `package.json` (add `sync:agents` script)

**Interfaces:**

- Consumes: `agentMarkdownToToml`, `injectSkillBanner` from Task 1.
- Produces:
  - `DEFAULT_PATHS: { repoRoot, claudeSkills, claudeAgents, codexSkills, codexAgents }`
  - `syncAll(opts?: { paths?: typeof DEFAULT_PATHS, check?: boolean }): { changed: string[], stale: string[] }` — absolute paths; writes/deletes nothing when `check` is true.

- [ ] **Step 1: Write the failing integration test**

Create `tests/unit/agent-sync-io.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncAll } from "../../scripts/lib/agent-sync.mjs";

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "agent-sync-"));
  const paths = {
    repoRoot: root,
    claudeSkills: join(root, ".claude", "skills"),
    claudeAgents: join(root, ".claude", "agents"),
    codexSkills: join(root, ".agents", "skills"),
    codexAgents: join(root, ".codex", "agents"),
  };
  mkdirSync(join(paths.claudeSkills, "demo"), { recursive: true });
  mkdirSync(paths.claudeAgents, { recursive: true });
  writeFileSync(
    join(paths.claudeSkills, "demo", "SKILL.md"),
    "---\nname: demo\ndescription: Demo skill.\n---\n\nDo the thing.\n"
  );
  writeFileSync(
    join(paths.claudeAgents, "helper.md"),
    "---\nname: helper\ndescription: Helper agent.\ntools: Read, Write\n---\n\nHelp with things.\n"
  );
  return paths;
}

describe("syncAll", () => {
  it("generates the skill mirror and agent TOML, then reports in sync", () => {
    const paths = makeFixture();
    const first = syncAll({ paths });
    expect(first.changed.length).toBe(2);

    const skill = readFileSync(join(paths.codexSkills, "demo", "SKILL.md"), "utf8");
    expect(skill.split("\n")[1]).toContain("GENERATED — do not edit");

    const toml = readFileSync(join(paths.codexAgents, "helper.toml"), "utf8");
    expect(toml).toContain('name = "helper"');
    expect(toml).toContain('sandbox_mode = "workspace-write"');

    const check = syncAll({ paths, check: true });
    expect(check.changed).toEqual([]);
    expect(check.stale).toEqual([]);
  });

  it("detects a modified artifact in check mode without writing", () => {
    const paths = makeFixture();
    syncAll({ paths });
    writeFileSync(join(paths.codexAgents, "helper.toml"), "tampered\n");
    const check = syncAll({ paths, check: true });
    expect(check.changed).toContain(join(paths.codexAgents, "helper.toml"));
  });

  it("flags then removes extraneous output files", () => {
    const paths = makeFixture();
    syncAll({ paths });
    const orphan = join(paths.codexAgents, "orphan.toml");
    writeFileSync(orphan, "old\n");
    expect(syncAll({ paths, check: true }).stale).toContain(orphan);
    syncAll({ paths }); // write mode prunes it
    expect(existsSync(orphan)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/agent-sync-io.test.ts`
Expected: FAIL — `syncAll` is not exported yet (`syncAll is not a function`).

- [ ] **Step 3: Add the fs imports at the top of the library**

In `scripts/lib/agent-sync.mjs`, insert this import block immediately after the header comment and **before** `export function bannerLine` (imports must precede other statements):

```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
```

- [ ] **Step 4: Append the orchestration to the library**

Add to the **end** of `scripts/lib/agent-sync.mjs`:

```js
// --- Filesystem orchestration ----------------------------------------------

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url))
  .replace(/\\/g, "/")
  .replace(/\/$/, "");

export const DEFAULT_PATHS = {
  repoRoot: REPO_ROOT,
  claudeSkills: join(REPO_ROOT, ".claude", "skills"),
  claudeAgents: join(REPO_ROOT, ".claude", "agents"),
  codexSkills: join(REPO_ROOT, ".agents", "skills"),
  codexAgents: join(REPO_ROOT, ".codex", "agents"),
};

/** Immediate subdirectory names of `dir` (empty if `dir` is absent). */
function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

/** All file paths under `dir`, relative to `dir` (empty if `dir` is absent). */
function listFiles(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) out.push(...listFiles(join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

/** POSIX-normalized path of `abs` relative to `root`, for stable banners. */
function toPosixRel(root, abs) {
  return relative(root, abs).replace(/\\/g, "/");
}

/** Resolve every generated artifact to its final bytes. */
function computeOutputs(paths) {
  const outputs = [];

  for (const name of listDirs(paths.claudeSkills)) {
    const srcDir = join(paths.claudeSkills, name);
    for (const rel of listFiles(srcDir)) {
      const src = join(srcDir, rel);
      const dest = join(paths.codexSkills, name, rel);
      if (rel === "SKILL.md") {
        const text = injectSkillBanner(readFileSync(src, "utf8"), toPosixRel(paths.repoRoot, src));
        outputs.push({ dest, bytes: Buffer.from(text, "utf8"), text: true });
      } else {
        outputs.push({ dest, bytes: readFileSync(src), text: false });
      }
    }
  }

  for (const file of listFiles(paths.claudeAgents)) {
    if (!file.endsWith(".md")) continue;
    const src = join(paths.claudeAgents, file);
    const dest = join(paths.codexAgents, file.replace(/\.md$/, ".toml"));
    const text = agentMarkdownToToml(readFileSync(src, "utf8"), toPosixRel(paths.repoRoot, src));
    outputs.push({ dest, bytes: Buffer.from(text, "utf8"), text: true });
  }

  return outputs;
}

/** True if on-disk bytes already match, ignoring CRLF for text outputs. */
function matches(current, output) {
  if (!output.text) return current.equals(output.bytes);
  return current.toString("utf8").replace(/\r\n/g, "\n") === output.bytes.toString("utf8");
}

/**
 * Regenerate (or, with { check: true }, verify) all Codex artifacts from the
 * .claude/ sources. Returns { changed, stale } absolute-path lists. In check
 * mode nothing is written or deleted.
 */
export function syncAll({ paths = DEFAULT_PATHS, check = false } = {}) {
  const outputs = computeOutputs(paths);
  const desired = new Set(outputs.map((o) => o.dest));

  const existing = [paths.codexSkills, paths.codexAgents].flatMap((root) =>
    listFiles(root).map((rel) => join(root, rel))
  );
  const stale = existing.filter((f) => !desired.has(f));

  const changed = [];
  for (const output of outputs) {
    const current = existsSync(output.dest) ? readFileSync(output.dest) : null;
    if (current === null || !matches(current, output)) {
      changed.push(output.dest);
      if (!check) {
        mkdirSync(dirname(output.dest), { recursive: true });
        writeFileSync(output.dest, output.bytes);
      }
    }
  }

  if (!check) {
    for (const f of stale) rmSync(f);
  }

  return { changed, stale };
}
```

- [ ] **Step 5: Run the integration test to verify it passes**

Run: `npx vitest run tests/unit/agent-sync-io.test.ts`
Expected: PASS — all three cases green.

- [ ] **Step 6: Create the CLI**

Create `scripts/sync-agents.mjs`:

```js
#!/usr/bin/env node
// Regenerate the Codex agent artifacts from their canonical .claude/ sources.
// Usage:
//   node scripts/sync-agents.mjs            regenerate to disk
//   node scripts/sync-agents.mjs --check    verify only (exit 1 if out of sync)
import { relative } from "node:path";
import { syncAll } from "./lib/agent-sync.mjs";

const check = process.argv.includes("--check");
const { changed, stale } = syncAll({ check });
const rel = (f) => relative(process.cwd(), f);

if (changed.length === 0 && stale.length === 0) {
  console.log("Codex agent artifacts are in sync.");
  process.exit(0);
}

if (check) {
  console.error(
    "::error::Codex agent artifacts are out of sync. Run `npm run sync:agents` and commit the result."
  );
  for (const f of changed) console.error(`  out of date: ${rel(f)}`);
  for (const f of stale) console.error(`  extraneous:  ${rel(f)}`);
  process.exit(1);
}

for (const f of changed) console.log(`  wrote:   ${rel(f)}`);
for (const f of stale) console.log(`  removed: ${rel(f)}`);
```

- [ ] **Step 7: Add the npm script**

In `package.json`, add to `"scripts"` immediately after the `"format:check"` line:

```json
    "sync:agents": "node scripts/sync-agents.mjs",
```

- [ ] **Step 8: Verify the CLI, lint, and formatting**

Run: `node scripts/sync-agents.mjs --check`
Expected: it prints out-of-sync lines and exits 1 **(the committed `.agents/`/`.codex/` files are still the broken hand-made copies — Task 3 fixes them).** This confirms `--check` detects drift.

Run: `npm run lint && npm run format:check && npx vitest run tests/unit/agent-sync.test.ts tests/unit/agent-sync-io.test.ts`
Expected: lint + format pass; all generator tests pass.

- [ ] **Step 9: Commit**

```bash
git add scripts/lib/agent-sync.mjs scripts/sync-agents.mjs tests/unit/agent-sync-io.test.ts package.json
git commit -m "feat: sync-agents generator CLI with --check mode"
```

---

### Task 3: Regenerate and commit the corrected artifacts

**Files:**

- Overwrite (generated): `.agents/skills/ship/SKILL.md`
- Overwrite (generated): `.codex/agents/docs-updater.toml`

**Interfaces:**

- Consumes: `npm run sync:agents` from Task 2.

- [ ] **Step 1: Regenerate**

Run: `npm run sync:agents`
Expected: output lists `wrote: .agents/skills/ship/SKILL.md` and `wrote: .codex/agents/docs-updater.toml` (the broken hand-made content is overwritten).

- [ ] **Step 2: Verify the TOML is correct (corruption fixed)**

Run: `cat .codex/agents/docs-updater.toml`
Expected — confirm all of:

- Line 1 is the banner `# GENERATED — do not edit. Source: .claude/agents/docs-updater.md. Regenerate: npm run sync:agents`
- `description = "...CLAUDE.md, README.md, and AGENTS.md..."` appears **once**, with `CLAUDE.md` present (NOT `AGENTS.md, README.md, and AGENTS.md`)
- `sandbox_mode = "workspace-write"` is present
- `developer_instructions = '''` opens a block containing the full instructions, and the regex line `^\s*--|^\.(text|card|section|gradient|glass|animate)` still has its backslashes
- there is **no** `model =` line

- [ ] **Step 3: Verify the skill mirror is correct**

Run: `cat .agents/skills/ship/SKILL.md`
Expected — confirm:

- Line 1 is `---`, line 2 is the `# GENERATED — do not edit. Source: .claude/skills/ship/SKILL.md. Regenerate: npm run sync:agents` banner, line 3 is `name: ship`
- The body still refers to `CLAUDE.md` correctly (e.g. `git add CHANGELOG.md CLAUDE.md README.md AGENTS.md`), with **no** doubled `AGENTS.md`

- [ ] **Step 4: Verify `--check` is now clean**

Run: `node scripts/sync-agents.mjs --check`
Expected: `Codex agent artifacts are in sync.` and exit 0.

- [ ] **Step 5: Verify formatting still passes**

Run: `npm run format:check`
Expected: pass (`.agents/`/`.codex/` are Prettier-ignored; the `.claude/` sources are unchanged and already clean).

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/ship/SKILL.md .codex/agents/docs-updater.toml
git commit -m "fix: regenerate codex artifacts from canonical .claude sources"
```

---

### Task 4: CI auto-commit workflow

**Files:**

- Create: `.github/workflows/sync-agents.yml`

**Interfaces:**

- Consumes: `node scripts/sync-agents.mjs` from Task 2; the `SYNC_PAT` repo secret (added manually — see Step 3).

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/sync-agents.yml`:

```yaml
name: Sync Codex Agents

# Regenerate the Codex agent artifacts (.agents/skills, .codex/agents) from
# their canonical .claude/ sources and commit any drift back to the PR branch.
# The .claude/ tree is the single source of truth; see
# docs/superpowers/specs/2026-07-22-codex-agent-sync-design.md.

on:
  pull_request:
    branches: [main]

concurrency:
  group: sync-agents-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  sync:
    name: Regenerate Codex artifacts
    runs-on: ubuntu-latest
    # Fork PRs get a read-only token and cannot push; skip them (solo repo).
    if: github.event.pull_request.head.repo.full_name == github.repository
    env:
      # Secrets cannot be referenced in `if:` directly, so surface presence here.
      HAS_PAT: ${{ secrets.SYNC_PAT != '' }}
    steps:
      - name: Skip note when unconfigured
        if: env.HAS_PAT != 'true'
        run: echo "SYNC_PAT secret is not set — skipping auto-sync. Add it to enable."

      - name: Checkout PR branch
        if: env.HAS_PAT == 'true'
        uses: actions/checkout@v7
        with:
          ref: ${{ github.head_ref }}
          token: ${{ secrets.SYNC_PAT }}
          fetch-depth: 0

      - name: Setup Node.js
        if: env.HAS_PAT == 'true'
        uses: actions/setup-node@v7
        with:
          node-version-file: ".nvmrc"
          cache: "npm"

      - name: Install dependencies
        if: env.HAS_PAT == 'true'
        run: npm ci

      - name: Regenerate Codex artifacts
        if: env.HAS_PAT == 'true'
        run: node scripts/sync-agents.mjs

      - name: Commit and push drift
        if: env.HAS_PAT == 'true'
        run: |
          if [ -n "$(git status --porcelain .agents .codex)" ]; then
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add .agents .codex
            git commit -m "chore: sync codex agent artifacts"
            git push
          else
            echo "Codex agent artifacts already in sync."
          fi
```

- [ ] **Step 2: Verify the workflow's core command and formatting**

Run: `node scripts/sync-agents.mjs --check`
Expected: `Codex agent artifacts are in sync.` exit 0 — this is exactly the regenerate step the workflow relies on producing no drift after Task 3.

Run: `npm run format:check`
Expected: pass (the workflow YAML is covered by Prettier — fix with `npm run format` if needed).

- [ ] **Step 3: One-time secret setup (manual, document in the PR)**

Create a fine-grained PAT with **Contents: Read and write** on this repository and add it as the repo secret **`SYNC_PAT`** (Settings → Secrets and variables → Actions). Without it the job runs but no-ops (the skip note prints); with it, auto-commits push back to the PR branch **and** re-trigger the required `ci.yml` checks on the new commit. Note this as a checklist item in the PR body so it is not forgotten.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/sync-agents.yml
git commit -m "ci: auto-commit codex agent artifacts on pull requests"
```

---

### Task 5: Document the mechanism

**Files:**

- Modify: `CLAUDE.md` (add a subsection under "Agents & docs automation")
- Modify: `AGENTS.md` (add a parallel agent-facing section)

**Interfaces:** none (documentation only).

- [ ] **Step 1: Update CLAUDE.md**

In `CLAUDE.md`, find the "## Agents & docs automation" section and add this subsection immediately after its final paragraph (the one ending `docs refresh only happens when `/ship` runs.`):

```markdown
### Codex artifact sync

Claude Code and OpenAI Codex CLI share the same skills and subagents but read them from different
paths and (for subagents) different formats. The `.claude/` tree is the **single source of truth**;
[scripts/sync-agents.mjs](scripts/sync-agents.mjs) derives the Codex artifacts from it:

- `.claude/skills/<name>/**` → `.agents/skills/<name>/**` — verbatim mirror plus a `GENERATED` banner.
- `.claude/agents/<name>.md` → `.codex/agents/<name>.toml` — frontmatter → TOML; `sandbox_mode` is
  derived from the `tools:` list (`workspace-write` if it includes `Write`/`Edit`, else `read-only`);
  `model` is omitted so Codex uses its default.

Edit **only** the `.claude/` sources — never the generated `.agents/`/`.codex/` files (each carries a
`GENERATED — do not edit` banner). Regenerate with `npm run sync:agents`; verify with
`node scripts/sync-agents.mjs --check`. On every PR the
[sync-agents.yml](.github/workflows/sync-agents.yml) workflow regenerates and commits any drift back
to the branch (requires the `SYNC_PAT` repo secret).
```

- [ ] **Step 2: Update AGENTS.md**

In `AGENTS.md`, add this section at the end of the file:

```markdown
## Keeping Codex artifacts in sync

Codex reads skills from `.agents/skills/` and subagents from `.codex/agents/*.toml`, but these are
**generated** from the canonical Claude sources under `.claude/` — do not edit them by hand (each
carries a `GENERATED — do not edit` banner). Edit the source under `.claude/skills/` or
`.claude/agents/`, then run `npm run sync:agents` to regenerate. On pull requests a workflow
regenerates and commits any drift automatically. `node scripts/sync-agents.mjs --check` verifies the
artifacts match their sources without writing.
```

- [ ] **Step 3: Format and verify**

Run: `npm run format && npm run format:check`
Expected: format:check passes after formatting.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md AGENTS.md
git commit -m "docs: document codex artifact sync mechanism"
```

---

## After the plan

Implementation stops here. To open the PR, run the **`/ship`** skill — it computes the target version, refreshes docs via `docs-updater` (which will find the docs above already current), writes the `CHANGELOG.md` entry, runs the fast checks, and opens/updates the PR. Add the **`SYNC_PAT` secret** (Task 4, Step 3) before relying on the auto-commit workflow.

## Self-Review Notes

- **Spec coverage:** directionality (Task 1/2 `DEFAULT_PATHS`), skill verbatim mirror + banner (Task 1 `injectSkillBanner`, Task 2 `computeOutputs`), subagent TOML transform incl. verbatim description / derived `sandbox_mode` / omitted `model` / `'''` guard (Task 1 `agentMarkdownToToml`), generator + `--check` + npm script (Task 2), determinism/LF (normalization in Task 1 + `matches` in Task 2), stale-file pruning (Task 2 `syncAll`), corrected real artifacts replacing the broken copies (Task 3), CI auto-commit + `SYNC_PAT` + fork/loop guards (Task 4), Prettier-ignore of generated files (Task 1 Step 1), docs (Task 5). Out-of-scope items (root docs, settings, per-agent Codex model overrides) are intentionally excluded.
- **Type/name consistency:** `syncAll`, `computeOutputs`, `matches`, `injectSkillBanner`, `agentMarkdownToToml`, `deriveSandboxMode`, `tomlBasicString`, `bannerLine`, `parseFrontmatter`, `DEFAULT_PATHS` are referenced consistently across tasks and tests.
- **No placeholders:** every step has concrete code/commands and expected output.
