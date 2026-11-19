### Changed

- The shared skills and their canonical changelog scripts are updated from `jwh3times/skills`. The
  `Changelog` check now accepts one kind of `CHANGELOG.md` section on a branch: a backfill for a
  version already tagged with no section, which only a merge from before the move to changelog
  fragments can leave. Every other section a branch adds is still rejected. Every tag here already
  has its section, so no backfill is due.
