# Copilot instructions

Follow the authoritative repository rules in `/AGENTS.md`. Read `/docs/architecture.md` before
changing page composition, content ownership, theming, GitHub build data, testing, deployment,
releases, or agent synchronization.

High-signal constraints:

- Preserve the static export; add no API route, runtime server dependency, or runtime environment
  variable.
- Put portfolio prose in `/content`, not section components.
- Compose classes with `cn()` and use semantic CSS-variable utilities.
- Use `/lib/accent.ts` through `Badge` and `Card` for accent styling.
- Keep theme-dependent UI behind the existing `useSyncExternalStore` mount guard.
- Use package scripts and config files as the source of truth for commands, versions, and test
  thresholds.
- Add focused tests for changed behavior and keep the static build green.
