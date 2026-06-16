# Security Policy

## Supported Versions

This repository powers a single, continuously deployed static site
(<https://holland.vip>). Only the currently deployed version (the `main` branch) is
supported — there are no released versions, tags, or backports.

## Reporting a Vulnerability

Please report security issues **privately** rather than opening a public issue:

- **Email:** <jerry@holland.vip>
- Or use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  on this repository (**Security → Report a vulnerability**).

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
