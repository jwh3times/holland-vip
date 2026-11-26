/** An Agent Skill Jerry publishes for coding agents. */
export interface AgentSkill {
  /** The skill's directory name, as it installs under `.agents/skills/`. */
  name: string;
  /** What the skill does, in one line. */
  does: string;
}

/** The Agent Skills panel in Career & stack. Never call these "skills": that word is the inventory. */
export const agentSkills: AgentSkill[] = [
  { name: "open-pr", does: "finished branch → open PR: release level, docs, changelog, checks" },
  { name: "handoff", does: "hands a session to another machine, then closes it out" },
  { name: "lets-go", does: "resumes the active handoff on the other machine" },
  { name: "end-session", does: "memory, issues, board, follow-ups, docs, workspace" },
  { name: "what-next", does: "ranks open work across trackers and recommends the next pick" },
  { name: "docs-updater", does: "finds where docs and code disagree, and fixes the docs" },
];

/** The repository that publishes them, and the panel's footer note. */
export const agentSkillsSource = {
  repo: "jwh3times/skills",
  href: "https://github.com/jwh3times/skills",
  note: {
    before:
      "One skill body, installed into every repo for Claude Code and Codex, tailored per repo through ",
    code: "docs/agents/",
    after: " settings.",
  },
};
