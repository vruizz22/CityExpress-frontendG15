---
name: add-new-feature-with-api-and-tests
description: Workflow command scaffold for add-new-feature-with-api-and-tests in CityExpress-frontendG15.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-feature-with-api-and-tests

Use this workflow when working on **add-new-feature-with-api-and-tests** in `CityExpress-frontendG15`.

## Goal

Implements a new feature by creating or updating UI components/pages, adding corresponding API service files, and writing associated tests.

## Common Files

- `src/components/*.jsx`
- `src/pages/*Page.jsx`
- `src/pages/*Page.test.jsx`
- `src/services/api/*Service.js`
- `src/services/api/*Service.test.js`
- `src/router/AppRouter.jsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update component/page files for the new feature.
- Add or update corresponding API service file.
- Write or update test files for components/pages and API service.
- Update router or navigation as needed.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.