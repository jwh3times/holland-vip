/** The editor-style status bar that closes the page. The theme name is filled in live. */
export const statusBar = {
  branch: "● main",
  host: "holland.vip",
  copyright: (year: number) => `© ${year} Holland`,
  /** Followed by ` · {theme}`, the theme actually painted. */
  encoding: "UTF-8 · LF",
};
