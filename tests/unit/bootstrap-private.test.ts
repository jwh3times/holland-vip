// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ installed: false, nonempty: false, locator: "" }));
const spawn = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync: spawn }));
vi.mock("node:fs", () => ({
  existsSync: (path: string) => (path.endsWith(".git") ? state.installed : state.nonempty),
  readdirSync: () => (state.nonempty ? ["existing.txt"] : []),
}));
const originalArgv = process.argv;

beforeEach(() => {
  vi.resetModules();
  state.installed = false;
  state.nonempty = false;
  state.locator = "";
  spawn.mockReset();
  spawn.mockImplementation((command: string) => {
    if (command === "op") return { status: 0, stdout: state.locator };
    state.installed = true;
    return { status: 0 };
  });
  vi.spyOn(console, "log").mockImplementation(() => {});
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
