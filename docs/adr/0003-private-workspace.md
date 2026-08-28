---
status: accepted
---

# Keep confidential operating context in an independent private companion

Public code and guidance remain in `jwh3times/holland-vip`; confidential prose and operational
state live in the private `holland-vip-workspace` repository cloned into ignored `private/` as an
independent repository. GitHub Issues own live work and 1Password owns recoverable credentials;
this boundary preserves normal Git history and fresh-machine recovery without exposing ciphertext
metadata, relying on local-only files, or coupling the public clone to private access.
