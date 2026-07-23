// Transforms + orchestration for keeping Codex agent artifacts in sync with
// their canonical .claude/ sources. See
// docs/superpowers/specs/2026-07-22-codex-agent-sync-design.md.
//
// The .claude/ tree is the single source of truth. This module derives:
//   .agents/skills/<name>/**   — verbatim mirror of .claude/skills/<name>/**
//   .codex/agents/<name>.toml  — transform of .claude/agents/<name>.md
// Output is deterministic (LF line endings, no timestamps) so regeneration
// never churns and --check is stable across platforms.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo-relative banner marking a file as generated. */
export function bannerLine(sourceRelPath, commentPrefix) {
  return `${commentPrefix} GENERATED — do not edit. Source: ${sourceRelPath}. Regenerate: npm run sync:agents`;
}

/**
 * Split a markdown document with a leading `---` YAML frontmatter block into
 * { data, body }. Handles the simple single-line `key: value` shape used by
 * this repo's agent files. Throws if the frontmatter block is missing.
 * @param {string} md
 * @returns {{ data: Record<string, string>, body: string }}
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
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
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
  // Text outputs are LF; .gitattributes (eol=lf) enforces LF in the working tree too,
  // so normalizing CRLF here keeps --check stable on Windows checkouts.
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
