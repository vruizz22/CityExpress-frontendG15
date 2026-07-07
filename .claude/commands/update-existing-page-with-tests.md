---
name: update-existing-page-with-tests
description: Workflow command scaffold for update-existing-page-with-tests in CityExpress-frontendG15.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-existing-page-with-tests

Use this workflow when working on **update-existing-page-with-tests** in `CityExpress-frontendG15`.

## Goal

Updates existing page(s) and their corresponding test files to add or modify functionality.

## Common Files

- `src/pages/*Page.jsx`
- `src/pages/*Page.test.jsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit the relevant page file(s).
- Update or add corresponding test file(s) for the page(s).

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.