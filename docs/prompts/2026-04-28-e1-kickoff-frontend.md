# Session: 2026-04-28 — E1 Frontend Kickoff (Plan Documental BMAD/GSD)

## Participantes

- Usuario: Victor Ruiz (vruizz22)
- Agente: Claude Code (Opus 4.7)

## Prompt

> Actuar como Frontend Lead Architect. Iniciar Entrega 1 del ecosistema CityExpress trabajando exclusivamente en el repo `CityExpress-frontendG15/`. Stack: React + Vite (JS puro), SPA. Antes de cualquier código, acatar reglas estrictas de Programación Agéntica del curso (GSD/BMAD/Spec-Driven). Generar físicamente en `/docs`:
>
> 1. `roadmap.md` (Setup Vite+React, Routing, Auth, Vistas, Deploy S3).
> 2. `milestones.md` (planificación, ciclos, entregas).
> 3. `requirements.md` (RF01, RF02, RF04, RNF06 auth, etc.).
> 4. Carpeta `/docs/prompts/` con un MD por interacción (Prompt → Output → Decisión).
>
> Garantizar coverage ≥75% (Vitest+RTL), setup E2E (Cypress o Playwright), main protegido, ≥2 reviewers, Conventional Commits.
>
> Leer fuente de verdad técnica en `/home/vruizz22/.claude/data/ArquiSoftware`.
>
> Plantear (sin programar) componentes para RF01, RF02, RF04 y flujo Auth0 (Protected Routes + Bearer en Axios/Fetch).
>
> Sobrescribir `README.md` con índice, arquitectura, metodología IA, guía de despliegue S3+CloudFront HTTPS (RNF08).
>
> Detenerse y pedir autorización antes de `npm create vite@latest`.

## Contexto cargado

- **Repo objetivo:** `CityExpress-frontendG15/` — vacío salvo `LICENSE`, `.gitignore`, `README.md` placeholder (56B).
- **Backend (fuente de verdad de contratos):** `CityExpress-backendG15/docs/`
  - `requirements.md`, `architecture.md`, `roadmap.md`, `milestones.md`, `prompts/`.
- **Notas del curso ArquiSoftware:** `/home/vruizz22/.claude/data/ArquiSoftware/AY1.md`–`AY12.md`, `docker.md`.
- **Reglas globales del usuario:** `~/.claude/CLAUDE.md` (§2 estilo, §3 stack TS/Node, §6 arquitectura, §7 GSD/BMAD).

### Hallazgos clave del backend (E1)

- **RFs frontend-relevantes:** RF01 (vista paquetes), RF02 (vista rutas/conectividad), RF04 (acción deliver con `deliverNotBefore`). RF03 es backend puro.
- **RNFs frontend-relevantes:** RNF01 (Docker), RNF04 (API Gateway+CORS), RNF05 (HTTPS), RNF06 (Auth0 JWK), RNF07 (Custom Authorizer), RNF08 (S3+CloudFront), RNF09 (New Relic).
- **Endpoints:** `GET /packages` (paginado+filtros), `GET /packages/:id`, `GET /routes` (alias `/distance-table`), `POST /packages/:id/deliver` (Bearer).
- **Tipo Package:** id, originId, destinationId, maxHops, deliveryStrategy, deliverNotBefore, createdAt, payment, priorityClass, status, lastAction.

### Hallazgos clave del curso

- Patrones: MVC, EDA, Microservicios, Serverless, **SPA**.
- Despliegue estático: **S3 + CloudFront** (AY4) con CDN edge + SSL.
- Auth: **Auth0** primario + API Gateway Custom Authorizer.
- NFRs prioritarios: Performance, Integrabilidad, Seguridad, Mantenibilidad.

## Output (resumen)

- **Archivos creados:**
  - `docs/roadmap.md` — visión, objetivos, hitos H0-H6, dependencias backend, riesgos.
  - `docs/milestones.md` — ciclos C0-C4 (6 semanas), tareas detalladas, política de PR.
  - `docs/requirements.md` — 6 RF-FE + 11 RNF-FE con trazabilidad al backend.
  - `docs/architecture.md` — diagramas Mermaid (deploy + capas), estructura `src/`, mapeo RF→componentes, NFR mapping, decisiones+tradeoffs.
  - `docs/prompts/_template.md` — plantilla obligatoria de AI logs.
  - `docs/prompts/2026-04-28-e1-kickoff-frontend.md` — este archivo.
  - `README.md` — sobrescrito con índice, arquitectura, stack, instalación, scripts, metodología IA, guía S3+CloudFront, env vars, equipo G15.
- **Archivos modificados:** `README.md` (de 56B placeholder a versión profesional).
- **Comandos sugeridos (NO ejecutados aún):**
  ```
  cd CityExpress-frontendG15
  npm create vite@latest . -- --template react
  pnpm install
  pnpm add react-router-dom axios @auth0/auth0-react
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test eslint prettier
  ```

## Decisión y tradeoffs

| Decisión                                                      | Alternativas                            | Tradeoff aceptado                                                                                  |
| ------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Documentar **todo** antes de scaffolding                      | Hacer scaffold y documentar en paralelo | Cumple BMAD/GSD estricto del curso; cuesta 1 día más pero reduce retrabajo                         |
| Añadir `architecture.md` (no pedido en prompt original)       | Solo los 3 docs mencionados             | Reglas globales `CLAUDE.md` §6/§7 lo exigen para cualquier feature; coherencia con el backend repo |
| **Playwright** sobre Cypress                                  | Cypress (más popular)                   | Menos flakiness, multi-browser nativo, mejor DX en CI                                              |
| **React Router v6** sobre TanStack Router                     | TanStack (typesafety)                   | Madurez + JS puro (sin TS) hace TanStack menos beneficioso                                         |
| **Context** sin Zustand/Redux para E1                         | Zustand (más escalable)                 | Estado mínimo en E1; promesa de revisar en E2 si crece                                             |
| **Tailwind** para UI                                          | CSS Modules / shadcn                    | Velocidad en E1; revisable                                                                         |
| Servir SPA tanto en **Docker (nginx)** como **S3+CloudFront** | Solo uno                                | Cubre RNF01 (Docker) + RNF08 (S3+CF) explícitamente                                                |
| Tokens **NO en localStorage plano**                           | localStorage simple                     | OWASP SPA — usar defaults `auth0-react` (memoria + cookies rotadas)                                |

## Verificación

- [x] Los 7 archivos existen en `CityExpress-frontendG15/{docs/, README.md}`.
- [x] Cada documento referencia los IDs RF-FE/RNF-FE de forma consistente.
- [x] El README incluye guía S3+CloudFront ejecutable paso a paso.
- [x] Diagramas Mermaid presentes (deploy + capas).
- [ ] PR creado (pendiente — primero pedir autorización para scaffolding).

## Siguientes pasos

- [ ] Esperar autorización del usuario para `npm create vite@latest`.
- [ ] Una vez autorizado: ejecutar D0 (Setup, lun 28/04) — Vite + ESLint + Prettier + Vitest + CI.
- [ ] Crear branch `feature/d0-setup` y abrir PR contra `main`.
- [ ] Configurar branch protection en GitHub (acción manual del owner del repo G15).
- [ ] Crear log nuevo: `docs/prompts/2026-04-28-d0-setup.md`.

## Update 2026-04-28 — Plan comprimido a deadline real

**Cambio:** el plan original asumía 6 semanas de trabajo. El usuario aclaró que el **deadline real es domingo 2026-05-03**. Tras revisar el `roadmap.md` del backend (que también traía un plan de 4 semanas inconsistente con la fecha oficial), se reescribieron `docs/roadmap.md` y `docs/milestones.md` del frontend a un **plan de 6 días (D0-D6, 28-abr → 3-may)**, alineado con el plan comprimido del backend (M1-M5).

**Decisiones nuevas:**

- Cada "ciclo" pasa a ser un día. D2 paraleliza RF01 y RF02 entre dos owners.
- Jueves 1/05 (feriado CL) recibe trabajo de bajo riesgo (tests del guard `isDeliverable`).
- Política de relajación documentada en `roadmap.md §7`: si hay atraso >12h, descartar primero New Relic (RNF09 NO esencial), nunca tests ni Auth0 ni AI logs.
- MSW agregado al stack de D1 para desbloquear D2 si el backend se atrasa.
- Backend se actualizó en paralelo: `CityExpress-backendG15/docs/roadmap.md §4` y `milestones.md §3` con el Gantt comprimido a 2026-05-03.

**Archivos modificados en esta segunda iteración:**

- `CityExpress-frontendG15/docs/roadmap.md` — reescrito completo
- `CityExpress-frontendG15/docs/milestones.md` — reescrito completo
- `CityExpress-frontendG15/README.md` — sección §12 con deadline visible
- `CityExpress-backendG15/docs/roadmap.md` — Gantt y tabla de milestones
- `CityExpress-backendG15/docs/milestones.md` — fechas de M1-M5
