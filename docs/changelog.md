# Changelog

Todas las novedades relevantes de CityExpress Frontend G15.
Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · SemVer.

## [1.0.0] — 2026-04-29

Primera entrega tagueada del frontend (D0 setup completo).

### Added

- Scaffold Vite 8 + React 19 + JavaScript puro (sin TypeScript) con alias `@/`.
- Tailwind CSS v4 zero-config vía `@tailwindcss/vite`; tokens `--color-brand-*` en `src/index.css`.
- `httpClient.js` — wrapper `fetch` nativo con Bearer JWT, timeout (`AbortController`), `HttpError`, y `searchParams` para query strings.
- `AuthProvider` placeholder + `setTokenProvider` para inyección de `getAccessTokenSilently` (D1).
- `src/config/env.js` — validación fail-fast de `import.meta.env`; falla en arranque si faltan vars requeridas.
- `src/lib/utils.js` — helper `cn()` = `twMerge(clsx(...))`.
- MSW baseline (`src/mocks/handlers.js` + `server.js`) para `/packages` y `/routes`.
- Smoke test `App.test.jsx` con Vitest + RTL + jsdom.
- CI GitHub Actions: lint + format:check + `test:coverage` (gate ≥ 75%) + build en cada PR a `main`/`develop`.
- Job separado `Conventional Commits` con `commitlint`.
- Husky `pre-commit` (lint-staged) y `commit-msg` (commitlint).
- `.github/PULL_REQUEST_TEMPLATE.md` y `.github/CODEOWNERS`.
- Playwright configurado (`playwright.config.js`) con `passWithNoTests: true` hasta D4.
- BMAD docs: `docs/roadmap.md`, `docs/milestones.md`, `docs/requirements.md`, `docs/architecture.md`.
- AI log de sesión D0: `docs/prompts/2026-04-29-d0-setup.md`.
- `CLAUDE.md` con reglas absolutas del proyecto (stack, workflow, AI usage).

### Changed

- Plan de milestones comprimido al deadline real 2026-05-03 (`docs/milestones.md`).
- `vite.config.js`: `strictPort: true` para que Playwright siempre use `:5173`.
- `index.html`: `lang="es"` y `<title>CityExpress</title>` (reemplaza defaults de Vite scaffold).
- Tradeoff fetch vs axios corregido en `docs/architecture.md`.

### Fixed

- `.prettierignore` excluye `.claude/` para que `format:check` en CI no falle por `settings.local.json`.
- `src/config/env.js`: mensaje de error apuntaba a `.env.local.example` (inexistente) → corregido a `.env.example`.
- URL construction en `httpClient.js`: usa `URL.searchParams` en vez de concatenación de string.
- Referencias cruzadas en docs: `.env.local.example` → `.env.example`, `vitest.config.js` → `vite.config.js`, AI log pointer en `milestones.md`.
- `README.md` §S3: `create-bucket` en `us-east-1` no requiere `--create-bucket-configuration`.
