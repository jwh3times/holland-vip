/**
 * Read and update the cross-machine handoff map that `/handoff` and `/lets-go`
 * share through Proton Drive.
 *
 * Usage:
 *
 *   node scripts/handoff-map.mjs get
 *   node scripts/handoff-map.mjs set <file-name>
 *   node scripts/handoff-map.mjs clear
 *   node scripts/handoff-map.mjs get --key <map-key>
 *
 * The Handoffs directory is discovered under `~/Proton Drive/[account/]My
 * Files/Documents/Handoffs` with case-insensitive segments, so the same command
 * works on Windows and Linux. Set `HANDOFF_DIR` when the drive is mounted
 * elsewhere. The map key defaults to the `origin` repository name, matched
 * against existing keys ignoring case and punctuation. Every command prints a
 * JSON description of the key's handoff; `set` and `clear` also report the
 * value they replaced. Other keys and the file's line endings are preserved.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const MAP_FILE = "handoff_map.json";
const DRIVE_ROOTS = ["Proton Drive", "ProtonDrive"];
const HANDOFF_SEGMENTS = ["my files", "documents", "handoffs"];

/**
 * @typedef {{ command: "get" | "clear", key?: string } | { command: "set", key?: string, file: string }} HandoffArgs
 * @typedef {{ FileName?: string, Last_Updated?: string, Active_Handoffs: Record<string, string | null> }} HandoffMap
 */

/**
 * @param {readonly string[]} argv
 * @returns {HandoffArgs}
 */
export function parseArgs(argv) {
  const [command, ...rest] = argv;
  /** @type {string | undefined} */
  let key;
  /** @type {string[]} */
  const positional = [];
  for (let index = 0; index < rest.length; index++) {
    const argument = rest[index];
    if (argument === "--key") {
      key = rest[++index];
      if (!key) throw new Error("--key requires a value");
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown argument: ${argument}`);
    } else {
      positional.push(argument);
    }
  }

  if (command === "set") {
    const [file] = positional;
    if (positional.length !== 1 || path.basename(file) !== file) {
      throw new Error("set requires exactly one bare file name inside the Handoffs directory");
    }
    return { command, key, file };
  }
  if (command === "get" || command === "clear") {
    if (positional.length > 0) throw new Error(`${command} takes no file name`);
    return { command, key };
  }
  throw new Error(`Unknown command: ${command ?? "(none)"}; expected get, set, or clear`);
}

/**
 * Proton Drive on Windows exposes `My files` as a reparse point that directory
 * entries report as a symbolic link, so follow links with `statSync`.
 *
 * @param {string} base
 */
function subdirectories(base) {
  try {
    return readdirSync(base)
      .map((name) => path.join(base, name))
      .filter((candidate) => {
        try {
          return statSync(candidate).isDirectory();
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

/**
 * @param {string} base
 * @param {string} name lower-case directory name
 */
function childDirectory(base, name) {
  return subdirectories(base).find((candidate) => path.basename(candidate).toLowerCase() === name);
}

/**
 * @param {{ env?: NodeJS.ProcessEnv, home?: string }} [options]
 * @returns {string}
 */
export function findHandoffsDir({ env = process.env, home = os.homedir() } = {}) {
  if (env.HANDOFF_DIR) {
    if (existsSync(path.join(env.HANDOFF_DIR, MAP_FILE))) return env.HANDOFF_DIR;
    throw new Error(`HANDOFF_DIR does not contain ${MAP_FILE}: ${env.HANDOFF_DIR}`);
  }

  for (const rootName of DRIVE_ROOTS) {
    const root = path.join(home, rootName);
    for (const base of [root, ...subdirectories(root)]) {
      let directory = /** @type {string | undefined} */ (base);
      for (const segment of HANDOFF_SEGMENTS) {
        directory = directory && childDirectory(directory, segment);
      }
      if (directory && existsSync(path.join(directory, MAP_FILE))) return directory;
    }
  }

  throw new Error(
    `No ${MAP_FILE} under ~/Proton Drive/[account/]My Files/Documents/Handoffs; ` +
      "sync Proton Drive or set HANDOFF_DIR to the Handoffs directory"
  );
}

/** @param {string} remoteUrl */
export function repoNameFromRemote(remoteUrl) {
  const last =
    remoteUrl
      .trim()
      .replace(/\/+$/u, "")
      .split(/[/:\\]/u)
      .pop() ?? "";
  return last.replace(/\.git$/u, "");
}

/**
 * @param {readonly string[]} keys
 * @param {string} name
 */
export function resolveKey(keys, name) {
  /** @param {string} value */
  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/gu, "");
  return (
    keys.find((key) => key === name) ??
    keys.find((key) => key.toLowerCase() === name.toLowerCase()) ??
    keys.find((key) => normalize(key) === normalize(name)) ??
    name
  );
}

/** @param {Date} date */
export function formatTimestamp(date) {
  /** @param {number} value */
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * @param {string} text
 * @returns {HandoffMap}
 */
export function parseMap(text) {
  const map = JSON.parse(text);
  const active = map?.Active_Handoffs;
  if (!active || typeof active !== "object" || Array.isArray(active)) {
    throw new Error(`${MAP_FILE} has no Active_Handoffs object`);
  }
  return map;
}

/**
 * @param {HandoffMap} map
 * @param {string} key
 * @param {string | null} value
 * @param {Date} now
 * @returns {HandoffMap}
 */
export function withActiveHandoff(map, key, value, now) {
  return {
    ...map,
    Last_Updated: formatTimestamp(now),
    Active_Handoffs: { ...map.Active_Handoffs, [key]: value },
  };
}

/** @param {string} cwd */
function currentRepoName(cwd) {
  const remote = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  const name = remote.status === 0 ? repoNameFromRemote(remote.stdout) : "";
  return name || path.basename(cwd);
}

/**
 * @param {readonly string[]} argv
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, home?: string, now?: Date, log?: (line: string) => void }} [options]
 */
export function main(argv, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    home = os.homedir(),
    now = new Date(),
    log = console.log,
  } = options;
  const args = parseArgs(argv);
  const dir = findHandoffsDir({ env, home });
  const mapPath = path.join(dir, MAP_FILE);
  const text = readFileSync(mapPath, "utf8");
  const map = parseMap(text);
  const key = resolveKey(Object.keys(map.Active_Handoffs), args.key ?? currentRepoName(cwd));
  const previous = map.Active_Handoffs[key] ?? null;

  /** @param {string | null} file */
  const describe = (file) => ({
    dir,
    map: mapPath,
    key,
    active: file,
    path: file ? path.join(dir, file) : null,
    exists: file ? existsSync(path.join(dir, file)) : false,
  });

  if (args.command === "get") {
    log(JSON.stringify(describe(previous), null, 2));
    return 0;
  }

  const next = args.command === "set" ? args.file : null;
  if (next && !existsSync(path.join(dir, next))) {
    throw new Error(`Write the handoff document before recording it: ${path.join(dir, next)}`);
  }
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const updated = withActiveHandoff(map, key, next, now);
  writeFileSync(mapPath, JSON.stringify(updated, null, 2).replace(/\n/gu, eol) + eol);
  log(JSON.stringify({ ...describe(next), previous }, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
