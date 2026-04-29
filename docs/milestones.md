# CityExpress · Frontend G15 — Milestones (Plan comprimido 28-abr → 3-may)

> **Deadline real: domingo 2026-05-03 23:59 CLT.** El plan original de 6 semanas se reescribió a **6 días calendario**. Cada "ciclo" ahora es **un día** (excepto el cierre de tests y deploy que toman ~1.5 días cada uno).
> **Jueves 1/05 es feriado nacional CL** → capacidad reducida (~3-4h).

---

## Estructura por día

Cada día cierra con:

- PR(s) mergeados (≥1 reviewer dado el ritmo comprimido — el equipo G15 puede subir a 2 si recursos lo permiten; en `main` siempre 2).
- Tests verdes en CI.
- AI log en `docs/prompts/YYYY-MM-DD-<tema>.md`.
- Mensaje de status al canal del equipo (Slack/Discord).

| Día | Fecha              | Foco                                                | Hito asociado |
| --- | ------------------ | --------------------------------------------------- | ------------- |
| D0  | lun 28/04          | Setup proyecto + CI/CD base                         | H0            |
| D1  | mar 29/04          | Auth0 + Skeleton + Routing                          | H1            |
| D2  | mié 30/04          | RF01 + RF02 (paralelo, 2 owners)                    | H2, H3        |
| D3  | jue 1/05 (feriado) | RF04 guard + tests unit del módulo packages         | H4-A          |
| D4  | vie 2/05           | Tests ≥75% + E2E happy path Playwright + Dockerfile | H4-B + H5-A   |
| D5  | sáb 2/05           | S3 + CloudFront + ACM + dominio                     | H5-B          |
| D6  | dom 3/05           | Smoke test + invalidación + video demo + entrega    | H6            |

---

## D0 — Setup (lun 28/04)

**Objetivo:** repo listo para que cualquier compañero del G15 clone, instale y empiece D1.

| Tarea                                                       | Owner               | Deliverable                                              | Verificación                                            |
| ----------------------------------------------------------- | ------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `npm create vite@latest . -- --template react` (JS)         | Tech Lead FE        | `package.json`, `vite.config.js`, `src/` mínimo          | `pnpm dev` levanta en :5173                             |
| ESLint + Prettier + EditorConfig + `eslint-plugin-jsx-a11y` | Tech Lead FE        | `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`          | `pnpm lint` pasa                                        |
| Vitest + RTL + jsdom + MSW                                  | QA                  | `vite.config.js`, primer test smoke `App.test.jsx`       | `pnpm test` pasa                                        |
| Husky + lint-staged + commitlint                            | DevOps              | `.husky/pre-commit`, `commitlint.config.cjs`             | Commit con error de lint o sin Conventional → bloqueado |
| GitHub Actions CI (`ci.yml`)                                | DevOps              | Lint + test + build en cada PR                           | Workflow corre verde en PR de prueba                    |
| Branch protection en `main`                                 | Owner repo (manual) | GitHub Settings → Branches                               | PR directo a main es bloqueado                          |
| PR template + CODEOWNERS                                    | Tech Lead FE        | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS` | PR usa template automáticamente                         |
| AI log D0                                                   | Quien usó IA        | `docs/prompts/2026-04-29-d0-setup.md`                    | Existe + 4 secciones                                    |

**RF/RNF cubiertos:** RNF-FE01, RNF-FE02, RNF-FE06, RNF-FE07.

---

## D1 — Auth & Skeleton (mar 29/04)

**Objetivo:** flujo de login operativo, rutas protegidas, cliente HTTP listo para D2.

| Tarea                                                             | Owner        | Deliverable                                        |
| ----------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| Tenant Auth0 + SPA Application + audience apuntando al API NestJS | Auth Lead    | `.env.example` con `VITE_AUTH0_*`                  |
| `@auth0/auth0-react` integrado                                    | Auth Lead    | `src/providers/AuthProvider.jsx`                   |
| `ProtectedRoute` + React Router v6                                | Tech Lead FE | `src/router/AppRouter.jsx`, `ProtectedRoute.jsx`   |
| Layout base (Header con Login/Logout + Nav a /packages /routes)   | UI/UX        | `src/components/Layout/{Header,Footer,Layout}.jsx` |
| httpClient (fetch) `httpClient` + interceptor Bearer + manejo 401 | Auth Lead    | `src/services/api/httpClient.js`                   |
| MSW server setup para tests + dev mock                            | QA           | `src/mocks/{handlers,server,browser}.js`           |
| Smoke test: render `<ProtectedRoute>` con auth mock               | QA           | `__tests__/ProtectedRoute.test.jsx`                |
| AI log D1                                                         | —            | `docs/prompts/2026-04-29-c1-auth-skeleton.md`      |

**RF/RNF cubiertos:** RF-FE04, RF-FE05.

**Dependencia con backend:** ninguna estricta (Auth0 puede configurarse contra audience aún no live; el JWT se valida client-side y se valida real-server cuando el API Gateway esté listo).

---

## D2 — RF01 + RF02 (mié 30/04, paralelización)

**Objetivo:** dos vistas funcionales en un día. Dos owners trabajando en branches separadas.

### Track A — RF01 Packages (Owner: Tech Lead FE)

- `src/pages/PackagesPage.jsx`
- `src/features/packages/{PackagesList,PackageRow,PackageFilters}.jsx`
- `usePackages` hook + `packagesApi.js` adapter
- Paginación (`?page&limit=25`), filtros (origin, destination, status), estados loading/empty/error
- Tests: hook con MSW, render lista, filtros, edge case lista vacía
- Branch: `feature/d2-rf01-packages`

### Track B — RF02 Routes (Owner: Auth Lead o UI/UX)

- `src/pages/RoutesPage.jsx`
- `src/features/routes/{RoutesTable,RouteStatusBadge}.jsx`
- `useRoutes` hook + `routesApi.js` adapter
- Refresh manual; visualización `enabled/disabled` y `distance`
- Tests: adapter del distance-table, render condicional del badge
- Branch: `feature/d2-rf02-routes`

**AI logs:** `2026-04-30-rf01-packages.md`, `2026-04-30-rf02-routes.md`.

**RF/RNF cubiertos:** RF-FE01, RF-FE02, RF-FE06.

**Dependencia con backend:** contratos `GET /packages` y `GET /routes` deben estar estables. Si el backend se atrasa: trabajar contra MSW con los DTOs definidos en `requirements.md §"Tipo Package"`.

---

## D3 — RF04 + Guards (jue 1/05, feriado, 3-4h máx)

**Objetivo:** acción de entrega segura. Tareas de bajo riesgo y sin dependencia de integración (apropiadas para feriado).

| Tarea                                                                                                                     | Owner        | Deliverable                                        |
| ------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| `isDeliverable(pkg, now)` puro + tests exhaustivos (timezones, deliveredAlready, deliverNotBefore exacto, futuro, pasado) | QA           | `src/features/packages/isDeliverable.{js,test.js}` |
| `DeliverButton` componente con confirmación y disabled state                                                              | Tech Lead FE | `src/features/packages/DeliverButton.jsx`          |
| `useDeliver` hook (POST con manejo 409/425)                                                                               | Auth Lead    | `src/features/packages/useDeliver.js`              |
| Toast feedback (success/error)                                                                                            | UI/UX        | `src/components/feedback/Toast.jsx`                |
| AI log D3                                                                                                                 | —            | `docs/prompts/2026-05-01-rf04-deliver.md`          |

**RF/RNF cubiertos:** RF-FE03 (parte 1, sin E2E aún).

---

## D4 — Hardening + E2E + Docker (vie 2/05)

**Objetivo:** alcanzar coverage ≥75% global, dejar 1 E2E happy path corriendo, y tener Dockerfile listo.

| Tarea                                                                                             | Owner        | Deliverable                                            |
| ------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------ |
| Completar tests faltantes hasta coverage ≥75% global                                              | Todos        | Reporte `coverage/` en CI                              |
| Playwright instalado + happy path E2E (login → packages → deliver primero entregable)             | QA           | `e2e/packages-deliver.spec.js`, `playwright.config.js` |
| New Relic Browser inyectado vía env var                                                           | DevOps       | Snippet en `index.html` post-build                     |
| Accesibilidad básica: labels, focus visible, lint a11y verde                                      | UI/UX        | ESLint pasa con `jsx-a11y`                             |
| `Dockerfile` multi-stage (node-alpine build → nginx-alpine serve) + `nginx.conf` con SPA fallback | DevOps       | `docker build` exitoso, container expone :80           |
| Bundle visualizer + verificar bundle inicial <250KB gzipped                                       | Tech Lead FE | Reporte de `vite build`                                |
| AI log D4                                                                                         | —            | `docs/prompts/2026-05-02-hardening-docker.md`          |

**RF/RNF cubiertos:** RF-FE03 completo, RNF-FE02, RNF-FE03, RNF-FE05, RNF-FE09, RNF-FE10.

---

## D5 — Deploy AWS (sáb 2/05)

**Objetivo:** URL HTTPS pública sirviendo la SPA.

| Tarea                                                                                                  | Owner  | Deliverable                                               |
| ------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------- |
| Crear bucket S3 `cityexpress-frontend-g15` con block-public + OAC                                      | DevOps | Bucket creado, policy correcta                            |
| `pnpm build` + `aws s3 sync ./dist s3://...` con cache-control diferenciado                            | DevOps | Objects subidos con `index.html` cache:0, assets cache:1y |
| Solicitar ACM cert en us-east-1 + validación DNS                                                       | DevOps | Cert validado (puede tomar minutos a horas)               |
| Crear distribución CloudFront con OAC, default root `index.html`, custom error 403/404 → `/index.html` | DevOps | Distribución con dominio `dXXX.cloudfront.net` activo     |
| Asociar dominio `app.<dom>` (CNAME)                                                                    | DevOps | URL `https://app.<dom>` responde 200                      |
| GitHub Actions `deploy.yml` (manual trigger)                                                           | DevOps | Workflow disponible en `.github/workflows/deploy.yml`     |
| Smoke test: HTTPS válido, ruta `/packages` resuelve (SPA fallback), Login redirect funciona            | QA     | Checklist firmado                                         |
| AI log D5                                                                                              | —      | `docs/prompts/2026-05-02-deploy-s3-cloudfront.md`         |

**RF/RNF cubiertos:** RNF-FE04.

**Riesgo crítico:** validación ACM puede demorar. **Iniciar el cert lo más temprano posible el viernes 2/05 si quedó pendiente.**

---

## D6 — Demo & Entrega (dom 3/05)

**Objetivo:** entregar antes de las 23:59 CLT con todo verificado.

| Tarea                                                          | Owner        | Deliverable                                    |
| -------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| Smoke test E2E final contra producción                         | QA           | Checklist OK                                   |
| Invalidación CloudFront final                                  | DevOps       | `aws cloudfront create-invalidation` ejecutado |
| Video demo ≤5min cubriendo Login → Packages → Routes → Deliver | UI/UX        | `docs/demo.mp4` o link YouTube unlisted        |
| PR final con changelog en `docs/CHANGELOG.md` (opcional)       | Tech Lead FE | PR mergeado                                    |
| Entrega formal según instrucciones del enunciado               | Tech Lead FE | Formulario / commit tag enviado                |
| AI log D6                                                      | —            | `docs/prompts/2026-05-03-demo-entrega.md`      |

**Buffer:** todas las horas no usadas el domingo se reservan para incidentes (broker caído, CORS roto, cert expirado, etc).

---

## Equipo G15 — Asignaciones sugeridas

| Rol          | D0              | D1                    | D2            | D3                  | D4                | D5                | D6              |
| ------------ | --------------- | --------------------- | ------------- | ------------------- | ----------------- | ----------------- | --------------- |
| Tech Lead FE | Setup Vite/Lint | ProtectedRoute/Router | RF01          | DeliverButton       | Bundle/Polish     | Apoyo deploy      | PR final        |
| Auth & API   | —               | Auth0+httpClient      | RF02          | useDeliver          | a11y review       | —                 | —               |
| UI/UX        | —               | Layout/Header         | RF02 (apoyo)  | Toast               | a11y/CSS          | Smoke UI          | Video demo      |
| QA & DevOps  | Vitest+CI       | MSW+test guard        | Tests RF01/02 | tests isDeliverable | Playwright+Docker | S3+CloudFront+ACM | Smoke + entrega |

> Asignaciones reales se acuerdan en kickoff D0 según disponibilidad real del equipo.

---

## Política de PR (versión comprimida)

1. Branch desde `main`: `feature/d<X>-<scope>`.
2. Conventional Commits en **inglés**: `feat(packages): add filter by origin`.
3. PR description con: **Qué · Por qué (RF/RNF) · Cómo se verificó · AI log link**.
4. **≥2 reviewers** para `main` (regla del curso, no relajable).
5. CI verde + coverage no decrece.
6. Merge: **Squash and merge** con mensaje Conventional.

---

## Definition of Done (por tarea)

- ✅ Build pasa (`pnpm build`).
- ✅ Lint pasa (`pnpm lint`).
- ✅ Tests pasan; coverage del módulo tocado ≥75%.
- ✅ Si hay E2E asociado, pasa (`pnpm e2e`).
- ✅ PR mergeado con 2 reviewers.
- ✅ AI log actualizado con decisión + tradeoffs.
- ✅ Si afecta deploy: smoke test contra URL pública HTTPS verificado.
