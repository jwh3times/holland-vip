// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  MAP_FILE,
  findHandoffsDir,
  formatTimestamp,
  main,
  parseArgs,
  parseMap,
  repoNameFromRemote,
  resolveKey,
  withActiveHandoff,
} from "@/scripts/handoff-map.mjs";

const scratch: string[] = [];

function tempDir(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "holland-vip-handoff-map-"));
  scratch.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of scratch.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

const MAP = {
  FileName: MAP_FILE,
  Last_Updated: "09-15-2026 13:54:25",
  Active_Handoffs: { GuardianTracker: "guardian.md", "holland-vip": null },
};

function driveHome(eol = "\r\n"): { home: string; handoffs: string } {
  const home = tempDir();
  const handoffs = path.join(home, "Proton Drive", "account", "My files", "Documents", "Handoffs");
  mkdirSync(handoffs, { recursive: true });
  writeFileSync(
    path.join(handoffs, MAP_FILE),
    JSON.stringify(MAP, null, 2).replace(/\n/gu, eol) + eol
  );
  return { home, handoffs };
}

function run(argv: string[], home: string): Record<string, unknown> {
  const lines: string[] = [];
  const now = new Date(2026, 8, 16, 7, 5, 3);
  expect(main(argv, { env: {}, home, now, log: (line) => lines.push(line) })).toBe(0);
  return JSON.parse(lines.join("\n")) as Record<string, unknown>;
}

function readActive(handoffs: string): Record<string, string | null> {
  const map = JSON.parse(readFileSync(path.join(handoffs, MAP_FILE), "utf8")) as {
    Active_Handoffs: Record<string, string | null>;
  };
  return map.Active_Handoffs;
}

describe("parseArgs", () => {
  it("accepts get, clear, and set with an optional key", () => {
    expect(parseArgs(["get"])).toEqual({ command: "get", key: undefined });
    expect(parseArgs(["clear", "--key", "vcs-lab"])).toEqual({ command: "clear", key: "vcs-lab" });
    expect(parseArgs(["set", "doc.md"])).toEqual({
      command: "set",
      key: undefined,
      file: "doc.md",
    });
  });

  it("rejects malformed invocations", () => {
    expect(() => parseArgs([])).toThrow(/Unknown command/u);
    expect(() => parseArgs(["set"])).toThrow(/bare file name/u);
    expect(() => parseArgs(["set", "../doc.md"])).toThrow(/bare file name/u);
    expect(() => parseArgs(["get", "doc.md"])).toThrow(/takes no file name/u);
    expect(() => parseArgs(["get", "--key"])).toThrow(/requires a value/u);
    expect(() => parseArgs(["get", "--force"])).toThrow(/Unknown argument/u);
  });
});

describe("map helpers", () => {
  it("derives the repository name from HTTPS and SSH remotes", () => {
    expect(repoNameFromRemote("https://github.com/jwh3times/holland-vip.git\n")).toBe(
      "holland-vip"
    );
    expect(repoNameFromRemote("git@github.com:jwh3times/guardian-tracker")).toBe(
      "guardian-tracker"
    );
  });

  it("matches existing keys exactly, ignoring case, then ignoring punctuation", () => {
    const keys = ["GuardianTracker", "holland-vip", "LeaseBook"];
    expect(resolveKey(keys, "holland-vip")).toBe("holland-vip");
    expect(resolveKey(keys, "leasebook")).toBe("LeaseBook");
    expect(resolveKey(keys, "guardian-tracker")).toBe("GuardianTracker");
    expect(resolveKey(keys, "new-repo")).toBe("new-repo");
  });

  it("formats timestamps like the existing map", () => {
    expect(formatTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe("01-02-2026 03:04:05");
  });

  it("rejects a map without Active_Handoffs and preserves other keys when updating", () => {
    expect(() => parseMap("{}")).toThrow(/Active_Handoffs/u);
    expect(() => parseMap('{"Active_Handoffs": []}')).toThrow(/Active_Handoffs/u);
    const updated = withActiveHandoff(MAP, "holland-vip", "doc.md", new Date(2026, 8, 16));
    expect(Object.keys(updated)).toEqual(["FileName", "Last_Updated", "Active_Handoffs"]);
    expect(updated.Active_Handoffs).toEqual({
      GuardianTracker: "guardian.md",
      "holland-vip": "doc.md",
    });
  });
});

describe("findHandoffsDir", () => {
  it("finds the map under an account folder with differently cased segments", () => {
    const { home, handoffs } = driveHome();
    expect(findHandoffsDir({ env: {}, home })).toBe(handoffs);
  });

  it("follows a linked My Files folder like Proton Drive's Windows reparse point", () => {
    const { handoffs } = driveHome();
    const home = tempDir();
    const account = path.join(home, "Proton Drive", "account");
    mkdirSync(account, { recursive: true });
    symlinkSync(path.dirname(path.dirname(handoffs)), path.join(account, "My Files"), "junction");
    expect(findHandoffsDir({ env: {}, home })).toBe(
      path.join(account, "My Files", "Documents", "Handoffs")
    );
  });

  it("honours HANDOFF_DIR and reports a missing map", () => {
    const { handoffs } = driveHome();
    expect(findHandoffsDir({ env: { HANDOFF_DIR: handoffs }, home: tempDir() })).toBe(handoffs);
    expect(() => findHandoffsDir({ env: { HANDOFF_DIR: tempDir() } })).toThrow(/HANDOFF_DIR/u);
    expect(() => findHandoffsDir({ env: {}, home: tempDir() })).toThrow(/set HANDOFF_DIR/u);
  });
});

describe("main", () => {
  it("records, reads, and clears a handoff while preserving CRLF and other keys", () => {
    const { home, handoffs } = driveHome();
    writeFileSync(path.join(handoffs, "holland-vip-handoff.md"), "# Handoff\n");

    const set = run(["set", "holland-vip-handoff.md", "--key", "holland-vip"], home);
    expect(set).toMatchObject({
      key: "holland-vip",
      active: "holland-vip-handoff.md",
      exists: true,
      previous: null,
    });

    const raw = readFileSync(path.join(handoffs, MAP_FILE), "utf8");
    expect(raw).toContain('"Last_Updated": "09-16-2026 07:05:03",\r\n');
    expect(readActive(handoffs).GuardianTracker).toBe("guardian.md");

    expect(run(["get", "--key", "HOLLAND-VIP"], home)).toMatchObject({
      key: "holland-vip",
      active: "holland-vip-handoff.md",
      path: path.join(handoffs, "holland-vip-handoff.md"),
      exists: true,
    });

    expect(run(["clear", "--key", "holland-vip"], home)).toMatchObject({
      active: null,
      exists: false,
      previous: "holland-vip-handoff.md",
    });
    expect(readActive(handoffs)["holland-vip"]).toBeNull();
  });

  it("refuses to record a document that has not been written", () => {
    const { home, handoffs } = driveHome("\n");
    expect(() =>
      main(["set", "missing.md", "--key", "holland-vip"], { env: {}, home, log: () => {} })
    ).toThrow(/Write the handoff document/u);
    expect(readFileSync(path.join(handoffs, MAP_FILE), "utf8")).not.toContain("missing.md");
  });

  it("defaults the key to the checkout's origin repository name", () => {
    const { home } = driveHome("\n");
    expect(run(["get"], home).key).toBe("holland-vip");
  });
});
