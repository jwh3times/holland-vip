# Security Policy

## Supported Versions

This repository powers a single, continuously deployed static site
(<https://holland.vip>). **Only the currently deployed `main` branch is supported.**

Every merge to `main` mints a `v<major>.<minor>.<build>` tag and a GitHub release, so released
versions do exist — but they are markers of what shipped, not separately maintained lines. There
are no backports: a fix reaches users by landing on `main` and deploying, and the only version
that is ever "patched" is the one currently live.

When reporting, identify the affected version by the deployed site or by the newest tag rather
than by a range. An advisory against this repository applies to the deployed site at the time it
is published.

## Reporting a Vulnerability

Please report security issues **privately** rather than opening a public issue:

- **Email:** <jerry@holland.vip>
- Or use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  on this repository (**Security → Report a vulnerability**).

These channels are also published in the RFC 9116 discovery document at
<https://holland.vip/.well-known/security.txt>. Its `Expires` field is renewed annually; the
end-to-end test begins failing 30 days before expiration so stale reporting instructions cannot
ship unnoticed.

Please include:

- A description of the issue and its potential impact
- Steps to reproduce, ideally with a proof of concept
- The affected URL, file, or dependency

## Scope

This is a static, input-free portfolio site with no backend, no authentication, and
no user data. In-scope reports include:

- Weaknesses in the security headers / Content-Security-Policy (see `public/_headers`)
- Vulnerable dependencies not already surfaced by Dependabot or the
  dependency-review workflow
- Anything that could lead to content injection or supply-chain compromise of the
  build output

Out of scope: findings that require an already-compromised browser or device, social
engineering, volumetric denial-of-service, and issues against third parties (e.g.,
the Cloudflare platform itself).

## Response

This is a personal project maintained by one person. I aim to acknowledge valid
reports within a few days and to address confirmed issues as quickly as is practical.
Thank you for helping keep the site safe.
