### Fixed

- The Agent Skills panel in Career & stack names `open-pr` instead of `ship` (#301). The shared
  skill was renamed upstream, so the panel listed an Agent Skill that no longer installs. A unit
  test now fails when any panel entry names a skill not installed under `.agents/skills/`, so the
  next rename cannot leave the panel stale unnoticed.
