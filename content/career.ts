/** Career & stack copy: the section title and each panel's shell-style header. */
export const career = {
  title: "Career & stack",
  timeline: {
    command: "$ career --timeline 2013..now",
    hint: "click a company",
    label: "Career timeline",
  },
  log: { command: "$ git log --career --graph", head: "(HEAD → main)", label: "Career log" },
  skills: { file: "skills.json", keys: (count: number) => `${count} keys` },
  agentSkills: { command: "$ ls ~/.agents/skills/" },
  /** Each Current Exploration is prefixed `[~]`: in progress, not claimed as expertise. */
  exploring: { heading: "// currently exploring", marker: "[~]" },
  contributions: {
    command: "$ gh contributions --last 12mo",
    total: (total: string) => `${total} contributions`,
    /** The scrollable region's name, and the grid's text alternative. */
    region: "Contribution heatmap",
    summary: (total: string) => `${total} contributions in the last 12 months on GitHub`,
  },
};
