# Out-of-Scope Knowledge Base

The `.out-of-scope/` directory in a repo stores persistent records of rejected feature requests. It serves two purposes:

1. **Institutional memory** — why a feature was rejected, so the reasoning isn't lost when the issue is closed
2. **Deduplication** — when a new issue comes in that matches a prior rejection, the skill can surface the previous decision instead of re-litigating it

## Directory structure

```
.out-of-scope/
├── plugin-system.md
├── spreadsheet-export.md
└── graphql-api.md
```

One file per **concept**, not per issue. Multiple issues requesting the same thing are grouped under one file.

## File format

The file should be written in a relaxed, readable style — more like a short design document than a database entry. Use paragraphs, code samples, and examples to make the reasoning clear and useful to someone encountering it for the first time.

````markdown
# Spreadsheet Export

This project does not generate spreadsheet files.

## Why this is out of scope

The export pipeline emits a structured JSON document consumed by downstream
tools. Supporting spreadsheets would require:

- A tabular projection for nested records
- A policy for multiple worksheets and formulas
- A second compatibility and validation surface

This is a significant architectural change that doesn't align with the
project's focus on structured data interchange. Spreadsheet presentation is a
concern for downstream consumers.

```ts
// The current export contract preserves nested structure:
interface ExportDocument {
  records: NestedRecord[];
}
```

## Prior requests

- #42 — "Export reports as XLSX"
- #87 — "Add spreadsheet downloads"
- #134 — "Excel export option"
````

### Naming the file

Use a short, descriptive kebab-case name for the concept: `spreadsheet-export.md`, `plugin-system.md`, `graphql-api.md`. The name should be recognizable enough that someone browsing the directory understands what was rejected without opening the file.

### Writing the reason

The reason should be substantive — not "we don't want this" but why. Good reasons reference:

- Project scope or philosophy ("This project focuses on X; theming is a downstream concern")
- Technical constraints ("Supporting this would require Y, which conflicts with our Z architecture")
- Strategic decisions ("We chose to use A instead of B because...")

The reason should be durable. Avoid referencing temporary circumstances ("we're too busy right now") — those aren't real rejections, they're deferrals.

## When to check `.out-of-scope/`

During triage (Step 1: Gather context), read all files in `.out-of-scope/`. When evaluating a new issue:

- Check if the request matches an existing out-of-scope concept
- Matching is by concept similarity, not keyword — "download as Excel" matches
  `spreadsheet-export.md`
- If there's a match, surface it to the maintainer: "This is similar to
  `.out-of-scope/spreadsheet-export.md` — we rejected this before because [reason]. Do you still
  feel the same way?"

The maintainer may:

- **Confirm** — the new issue gets added to the existing file's "Prior requests" list, then closed
- **Reconsider** — the out-of-scope file gets deleted or updated, and the issue proceeds through normal triage
- **Disagree** — the issues are related but distinct, proceed with normal triage

## When to write to `.out-of-scope/`

Only when an **enhancement** (not a bug) is _rejected_ as `wontfix`. This applies to enhancement PRs exactly as it does to issues — a rejected PR is recorded here so the same request doesn't return as fresh code.

Do **not** write here when something is closed as `wontfix` because it's **already implemented**. That's a built feature, not a rejected one; recording it would poison the dedup checks with false rejections. Instead, the closing comment points to where the feature already lives.

The flow:

1. Maintainer decides a feature request is out of scope
2. Check if a matching `.out-of-scope/` file already exists
3. If yes: append the new issue to the "Prior requests" list
4. If no: create a new file with the concept name, decision, reason, and first prior request
5. Post a comment on the issue explaining the decision and mentioning the `.out-of-scope/` file
6. Close the issue with the `wontfix` label

## Updating or removing out-of-scope files

If the maintainer changes their mind about a previously rejected concept:

- Delete the `.out-of-scope/` file
- The skill does not need to reopen old issues — they're historical records
- The new issue that triggered the reconsideration proceeds through normal triage
