# Local runs

Traps on the development machine, mostly the maintainer's Windows checkout.

- **Only Chromium is installed locally.** A bare `npx playwright test` reports every Firefox, WebKit
  and Mobile Safari test failed in about 3 ms (`Executable doesn't exist`). Run
  `npx playwright test --project=chromium --project="Mobile Chrome"`, which matches CI, and say in a
  PR that Firefox and WebKit weren't run. Don't run `npx playwright install` unasked: it is a large
  download.
- **There is no `shellcheck`.** Shell scripts get `bash -n` only; say so rather than implying they
  were linted.
- **Never print a credential helper's output.** `git credential fill` returned a live GitHub token
  from the Windows Credential Manager, because a configured helper answers before the one under
  test. To exercise a helper, reset the inherited list (`git config --local credential.helper ""`,
  then add yours), pass a canary value, and compare against it:

  ```bash
  pass=$(printf 'protocol=https\nhost=github.com\n\n' | SYNC_PAT=canary git credential fill \
    | grep '^password=' | cut -d= -f2)
  [ "$pass" = "canary" ] && echo "helper won" || echo "another helper answered"
  ```

  CI needs the same reset. Read auth failures precisely: a 403 naming a user means the credential
  was accepted but unauthorized, `could not read Username` means none was supplied, 401 means it was
  rejected.

- **No agent credential reads the Cloudflare zone's settings.** The Wrangler login can read the
  zone's existence and the Pages project, deployments and domains, but bot management, zone
  settings, rulesets and DNS return 403. For zone facts, ask the maintainer for a dashboard read or a
  scoped read token instead of probing again; public HTTP observation and the Pages API need no
  extra access.
- **Recapturing a hobby-project screenshot** ([architecture](../architecture.md#page-composition-and-content)): the images are
  generated from each project's own sample data, rendered with Playwright's Chromium from this
  repository's `node_modules`. Nearcited's is captured in dark mode. Magic Agenda's and Nearcited's
  local Supabase stacks use the same ports, so only one runs at a time. Show the maintainer the image
  before committing.
