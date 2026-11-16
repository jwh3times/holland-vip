import type { Accent } from "@/lib/accent";
import type { Repo } from "@/lib/github";
import { githubUrl } from "@/lib/site-config";

/** A Hobby Project: public work outside Jerry's employment, one of a few picked for range. */
export interface HobbyProject {
  slug: string;
  name: string;
  /** What kind of thing it is, e.g. "CLI · causal source control". */
  kind: string;
  accent: Accent;
  /** Maturity, shown in the screenshot area's pill. */
  status: string;
  /** Where "open ↗" goes: the live site, or the repository when there is none. */
  url: string;
  /** The GitHub repository's name. It must be in `HOBBY_PROJECT_REPOS`; a test checks the sets match. */
  repo: string;
  oneLiner: string;
  stack: string[];
  /** The mini terminal's command, without the `$ ` prompt. */
  cmd: string;
  /** Illustrative output the mini terminal replays: sample output, not measurements. */
  log: string[];
}

/** The four Hobby Projects, in display order. */
export const hobbyProjects: HobbyProject[] = [
  {
    slug: "nearcited",
    name: "Nearcited",
    kind: "SaaS · AI search visibility",
    accent: "blue",
    status: "early · live providers",
    url: "https://github.com/jwh3times/Nearcited",
    repo: "Nearcited",
    oneLiner:
      "Tracks whether a local business gets named when people ask an AI assistant or Google — and who gets named instead.",
    stack: [
      "React 19",
      "Cloudflare Workers",
      "Hono",
      "Queues + Cron",
      "Supabase RLS",
      "Stripe",
      "OpenAI + Anthropic APIs",
    ],
    cmd: "scan --location asheville-plumbing",
    log: [
      "chatgpt     named  3/7  ▂▃▅▅▆▇▇",
      "claude      named  5/7  ▃▅▅▆▇▇█",
      "ai-overview named  1/7  ▁▁▂▁▂▃▂",
      "map-pack    #2     6/7  ▅▆▆▇▇▇█",
      "→ visibility 64  (+9 wk)",
    ],
  },
  {
    slug: "causet",
    name: "causet",
    kind: "CLI · causal source control",
    accent: "purple",
    status: "experimental · v0.2x",
    url: "https://github.com/jwh3times/causet",
    repo: "causet",
    oneLiner:
      "An experimental causal source-control layer over Git: `cst` records how changes move between histories, with verifiable receipts.",
    stack: [
      "Rust",
      "Git 2.49 merge-tree",
      "Canonical JSON (RFC 8785)",
      "JSON Schema",
      "Node test suites",
    ],
    cmd: "cst merge-plan hard-feature",
    log: [
      "=  a1f3c9e  hard feature one        covered (receipt)",
      "=  7b20d41  hard feature two        covered (receipt)",
      "?  c9e8812  tidy parser             candidate-equivalent",
      "+  e45ab07  hard feature continuation  new",
      "plan 2 covered · 1 review · 1 new",
    ],
  },
  {
    slug: "magic-agenda",
    name: "Magic Agenda",
    kind: "Web app · task board",
    accent: "green",
    status: "live · magicagenda.app",
    url: "https://magicagenda.app",
    repo: "magic-agenda",
    oneLiner:
      "A tactile, multi-user sticky-note task board that syncs across devices — in three hand-built themes.",
    stack: [
      "Vite",
      "React 19",
      "TypeScript",
      "Supabase + Edge Functions",
      "dnd-kit",
      "Cloudflare Pages",
    ],
    cmd: "board --view kanban",
    log: [
      "TODO (4)       IN PROGRESS (2)   DONE (11)",
      "□ groceries    ◧ tax docs        ■ oil change",
      "□ dentist      ◧ fence quote     ■ renew tags",
      "↻ trash · weekly · Tue",
      "⌘K  quick-add · 1–4 views",
    ],
  },
  {
    slug: "press",
    name: "Press",
    kind: "Mobile · golf games & settlement",
    accent: "orange",
    status: "TestFlight · pressgolf.cc",
    url: "https://pressgolf.cc",
    repo: "PressGolf",
    oneLiner:
      "Offline-first golf game and settlement tracker — one scorecard in, fewest cash hand-offs out.",
    stack: ["Expo SDK 58", "React Native", "Supabase", "OpenStreetMap", "Maestro E2E", "EAS"],
    cmd: "settle --round saturday-dogs",
    log: [
      "nassau  F +$10  B −$5  T +$10  press +$5",
      "skins   #4 #11 #16 → Mike ×3",
      "junk    sandy ×2  greenie ×1",
      "→ Dave pays Mike   $35",
      "→ Tom  pays Jerry  $20   (2 transfers)",
    ],
  },
];

/** The section's copy. Always "hobby projects", never "side projects"; never implies these are all. */
export const hobbyProjectsCopy = {
  title: "Hobby projects",
  hint: "hover a card to run it ↘",
  subtitle:
    "Four picked for range — a SaaS, a CLI, a web app and a mobile app — out of many repos I'm actively working in.",
  more: { label: "see everything on GitHub ↗", href: githubUrl },
  /** Labels the mini terminal, so its illustrative lines never read as real measurements. */
  sample: "sample output",
  open: "open",
  /** The repository line: stars only when there are any, then the last push as YYYY-MM-DD. */
  meta: ({ stars, pushedAt }: Pick<Repo, "stars" | "pushedAt">) =>
    [stars > 0 ? `★ ${stars}` : null, `pushed ${pushedAt.slice(0, 10)}`]
      .filter(Boolean)
      .join(" · "),
};
