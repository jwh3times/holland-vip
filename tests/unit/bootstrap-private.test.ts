// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  installed: false,
  nonempty: false,
  locator: "",
  hook: null as string | null,
  hookMode: 0,
}));
const spawn = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync: spawn }));
vi.mock("node:fs", () => ({
  existsSync: (path: string) => {
    if (path.endsWith("pre-commit")) return state.hook !== null;
    return path.endsWith(".git") ? state.installed : state.nonempty;
  },
  readdirSync: () => (state.nonempty ? ["existing.txt"] : []),
  readFileSync: () => state.hook,
  mkdirSync: () => {},
  writeFileSync: (_path: string, contents: string, options: { mode: number }) => {
    state.hook = contents;
    state.hookMode = options.mode;
  },
}));
const originalArgv = process.argv;

beforeEach(() => {
  vi.resetModules();
  state.installed = false;
  state.nonempty = false;
  state.locator = "";
  state.hook = null;
  state.hookMode = 0;
  spawn.mockReset();
  spawn.mockImplementation((command: string) => {
    if (command === "op") return { status: 0, stdout: state.locator };
    state.installed = true;
    return { status: 0 };
  });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`exit:${code}`);
  });
  vi.stubEnv("HOLLAND_VIP_OP_SERVICE_ACCOUNT_REFERENCE", "");
});
afterEach(() => {
  process.argv = originalArgv;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function run(...args: string[]) {
  process.argv = [process.execPath, "bootstrap-private.mjs", ...args];
  await import("@/scripts/bootstrap-private.mjs");
}

describe("private bootstrap transport boundary", () => {
  it.each([
    "http://github.com/owner/repo.git",
    "https://github.com:8443/owner/repo.git",
    "https://user:password@github.com/owner/repo.git",
    "https://example.invalid/owner/repo.git",
    "https://github.com/owner/repo.git?query=value",
    "https://github.com/owner/repo.git#fragment",
    "https://github.com/owner/repo/extra",
    "https://github.com/owner/../repo",
    "https://github.com/owner/%72epo",
    "https://github.com/owner/repo\\extra",
    "https://github.com/owner/repo\n",
    "https://github.com/owner/repo\t",
    "https://github.com/owner/.git",
    "https://github.com/-owner/repo",
    "https://github.com/owner/repo?",
    "https://github.com/owner/repo#",
    "git@github.com:owner/..",
    "git@github.com:owner/.",
    "git@github.com:owner/repo/extra",
    "file:///tmp/repo",
    "--upload-pack=anything",
  ])("rejects %s before invoking Git or 1Password", async (locator) => {
    await expect(run("--url", locator)).rejects.toThrow();
    expect(spawn).not.toHaveBeenCalled();
  });

  it.each([
    ["https://github.com/owner/repo.git", "https://github.com/owner/repo.git"],
    ["https://github.com/owner/repo", "https://github.com/owner/repo"],
    ["https://github.com:443/owner/repo.git", "https://github.com/owner/repo.git"],
    ["HTTPS://GITHUB.COM/owner/repo.git", "https://github.com/owner/repo.git"],
    ["git@github.com:owner/repo.git", "git@github.com:owner/repo.git"],
    ["git@github.com:owner/repo", "git@github.com:owner/repo"],
  ])("clones a supported locator %s", async (locator, canonical) => {
    await run("--url", locator);
    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      "git",
      ["clone", "--", canonical, expect.stringMatching(/[/\\]private$/)],
      { stdio: "inherit", windowsHide: true }
    );
  });

  it("validates a locator read from 1Password before invoking Git", async () => {
    state.locator = "http://github.com/owner/repo.git";
    await expect(run()).rejects.toThrow();
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn.mock.calls[0][0]).toBe("op");
  });

  it("clones a supported locator read from 1Password", async () => {
    state.locator = "https://github.com/owner/repo.git";
    await run();
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn.mock.calls[0][0]).toBe("op");
    expect(spawn.mock.calls[1][0]).toBe("git");
  });

  it("exits without subprocesses when already installed", async () => {
    state.installed = true;
    await expect(run()).rejects.toThrow("exit:0");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a nonempty directory", async () => {
    state.nonempty = true;
    await expect(run()).rejects.toThrow(/non-empty private/);
    expect(spawn).not.toHaveBeenCalled();
  });
});

describe("private secret-scan hook", () => {
  it("installs an executable, fail-closed gitleaks hook after a fresh clone", async () => {
    await run("--url", "https://github.com/owner/repo.git");
    expect(state.hookMode).toBe(0o755);
    expect(state.hook).toMatch(/^#!\/bin\/sh\n/);
    expect(state.hook).toContain("command -v gitleaks");
    expect(state.hook).toContain("exec gitleaks git --pre-commit --staged --redact --no-banner");
    expect(state.hook).not.toContain("\r");
  });

  it("installs the hook on an existing companion without spawning anything", async () => {
    state.installed = true;
    await expect(run()).rejects.toThrow("exit:0");
    expect(state.hook).toContain("gitleaks git --pre-commit");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("leaves an identical hook alone", async () => {
    await run("--url", "https://github.com/owner/repo.git");
    const installed = state.hook;
    state.hookMode = 0;
    vi.resetModules();
    await expect(run()).rejects.toThrow("exit:0");
    expect(state.hook).toBe(installed);
    expect(state.hookMode).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("reports and keeps a different existing hook", async () => {
    state.installed = true;
    state.hook = "#!/bin/sh\nexit 0\n";
    await expect(run()).rejects.toThrow("exit:0");
    expect(state.hook).toBe("#!/bin/sh\nexit 0\n");
    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/left unchanged/));
  });
});
