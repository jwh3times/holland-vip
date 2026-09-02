// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { describeResult, isDirty, parseArgs, syncRepository } from "@/scripts/sync-main.mjs";

const scratch: string[] = [];

function tempDir(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "holland-vip-sync-main-"));
  scratch.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of scratch.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function git(root: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function repoPair(): { origin: string; clone: string } {
  const base = tempDir();
  const origin = path.join(base, "origin.git");
  const seed = path.join(base, "seed");
  const clone = path.join(base, "clone");
  git(base, "init", "--bare", "--initial-branch=main", origin);
  git(base, "clone", origin, seed);
  git(seed, "config", "user.email", "test@example.com");
  git(seed, "config", "user.name", "Test");
  writeFileSync(path.join(seed, "README.md"), "one\n");
  git(seed, "add", ".");
  git(seed, "commit", "-m", "one");
  git(seed, "push", "origin", "main");
  git(base, "clone", origin, clone);
  git(clone, "config", "user.email", "test@example.com");
  git(clone, "config", "user.name", "Test");
  return { origin, clone };
}

function pushCommit(origin: string, message: string): void {
  const work = path.join(tempDir(), "work");
  git(path.dirname(work), "clone", origin, work);
  git(work, "config", "user.email", "test@example.com");
  git(work, "config", "user.name", "Test");
  writeFileSync(path.join(work, `${message}.txt`), `${message}\n`);
  git(work, "add", ".");
  git(work, "commit", "-m", message);
  git(work, "push", "origin", "main");
}

describe("parseArgs", () => {
  it("syncs both repositories by default", () => {
    expect(parseArgs([])).toEqual({ syncPrivate: true });
  });

  it("supports public-only synchronization and rejects unknown arguments", () => {
    expect(parseArgs(["--skip-private"])).toEqual({ syncPrivate: false });
    expect(() => parseArgs(["--pull"])).toThrow(/Unknown argument/u);
  });
});

describe("result helpers", () => {
  it("recognizes dirty status and formats outcomes", () => {
    expect(isDirty("\n")).toBe(false);
    expect(isDirty(" M README.md\n")).toBe(true);
    expect(describeResult({ label: "private", status: "updated", detail: "main at abc" })).toBe(
      "+ private: main at abc"
    );
  });
});

describe("syncRepository", { timeout: 15_000 }, () => {
  it("skips a directory that is not a Git repository", () => {
    expect(syncRepository(tempDir(), "companion").status).toBe("skipped");
  });

  it("fast-forwards main and reports the new commit", () => {
    const { origin, clone } = repoPair();
    pushCommit(origin, "two");

    const result = syncRepository(clone, "clone");

    expect(result.status).toBe("updated");
    expect(result.detail).toContain("1 new commit(s)");
    expect(git(clone, "rev-parse", "--abbrev-ref", "HEAD").trim()).toBe("main");
  });

  it("switches from a feature branch to main", () => {
    const { origin, clone } = repoPair();
    git(clone, "checkout", "-b", "feature/thing");
    pushCommit(origin, "three");

    const result = syncRepository(clone, "clone");

    expect(result.status).toBe("updated");
    expect(result.detail).toContain("was on feature/thing");
    expect(git(clone, "rev-parse", "--abbrev-ref", "HEAD").trim()).toBe("main");
  });

  it("reports an already-current repository", () => {
    const { clone } = repoPair();
    expect(syncRepository(clone, "clone").status).toBe("current");
  });

  it("refuses dirty work and leaves the current branch unchanged", () => {
    const { origin, clone } = repoPair();
    git(clone, "checkout", "-b", "feature/thing");
    writeFileSync(path.join(clone, "README.md"), "edited\n");
    pushCommit(origin, "four");

    const result = syncRepository(clone, "clone");

    expect(result.status).toBe("failed");
    expect(result.detail).toMatch(/uncommitted changes/u);
    expect(git(clone, "rev-parse", "--abbrev-ref", "HEAD").trim()).toBe("feature/thing");
  });

  it("fails instead of merging a divergent main branch", () => {
    const { origin, clone } = repoPair();
    writeFileSync(path.join(clone, "local.txt"), "local\n");
    git(clone, "add", ".");
    git(clone, "commit", "-m", "local only");
    pushCommit(origin, "five");

    const result = syncRepository(clone, "clone");

    expect(result.status).toBe("failed");
    expect(git(clone, "log", "--oneline", "-1")).toContain("local only");
  });
});
