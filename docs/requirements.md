# CityExpress · Frontend G15 — Requirements E1

> Cada requerimiento del frontend (`RF-FE*` / `RNF-FE*`) deriva de un requerimiento del backend documentado en `CityExpress-backendG15/docs/requirements.md`. La columna **Origen** explicita esa trazabilidad.

---

## Requerimientos Funcionales (Frontend)

| ID          | Descripción                                                                                                                                                                                                                                                                               | Verificación                                                                                                      | Origen              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| **RF-FE01** | Vista `/packages` que liste paquetes recibidos con sus campos: `id`, `originId`, `destinationId`, `maxHops`, `createdAt`, `deliverNotBefore`, `status`, `lastAction`, `deliveryStrategy`, `payment`. Soporta paginación (default 25) y filtros por `originId`, `destinationId`, `status`. | Test unitario del hook `usePackages` con MSW; test de render de la lista; verificación manual contra backend dev. | RF01 backend        |
| **RF-FE02** | Vista `/routes` que muestre la tabla de conectividad: por cada destino `name`, `distance`, `transportCost`, `enabled` (badge visual). Refresh manual.                                                                                                                                     | Test del adapter de `/routes` (o `/distance-table`); render condicional del badge `enabled/disabled`.             | RF02 backend        |
| **RF-FE03** | Acción "Entregar paquete" en la fila del paquete: deshabilitada si `now < deliverNotBefore` o si `status === "delivered"`. Confirma antes de ejecutar `POST /packages/:id/deliver`. Toast de éxito/error.                                                                                 | Tests unitarios del guard `isDeliverable(pkg, now)` con edge cases de timezone; test E2E del flujo deliver.       | RF04 backend        |
| **RF-FE04** | Login/Logout vía Auth0 (Authorization Code + PKCE). Rutas `/packages`, `/routes` protegidas: redirigen a login si no hay sesión.                                                                                                                                                          | Test de `ProtectedRoute` con mock de auth state; verificación manual contra tenant Auth0.                         | RNF06 backend       |
| **RF-FE05** | Cliente HTTP fetch nativo (Web Platform) con interceptor que inyecta `Authorization: Bearer <accessToken>` en cada request salvo endpoints públicos. Manejo 401 → logout + redirect a login.                                                                                              | Test del interceptor con mock de `getAccessTokenSilently`; verificación manual con token expirado.                | RNF06/RNF07 backend |
| **RF-FE06** | Cada vista expone explícitamente los estados `loading`, `empty`, `error` con UI distinta (skeleton / mensaje / retry).                                                                                                                                                                    | Test de cada estado por vista (snapshot + accesibilidad).                                                         | UX baseline curso   |

## Requerimientos No Funcionales (Frontend)

| ID           | Descripción                                                                                                                                                               | Verificación                                                                         | Origen                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| **RNF-FE01** | Stack: React 18+, Vite 5+, **JavaScript puro** (sin TypeScript), componentes funcionales y hooks. Sin clases.                                                             | Code review; ESLint regla `react/prefer-functional-component`.                       | Decisión equipo G15        |
| **RNF-FE02** | Coverage de tests unitarios ≥ **75%** medido con Vitest `--coverage`. CI falla si decrece.                                                                                | Reporte de coverage publicado en cada PR; gate en CI.                                | Regla curso (CLAUDE.md §7) |
| **RNF-FE03** | Setup E2E listo desde C1 con **Playwright**. Mínimo 1 happy-path en C3.                                                                                                   | `pnpm e2e` corre en CI; reporte HTML adjunto.                                        | Regla curso (CLAUDE.md §7) |
| **RNF-FE04** | Despliegue obligatorio en **AWS S3 + CloudFront** con HTTPS (ACM cert en us-east-1). SPA fallback en 403/404 → `/index.html`.                                             | URL pública responde 200 + HTTPS válido; Lighthouse SEO/Best Practices ≥ 90.         | RNF08 backend              |
| **RNF-FE05** | Dockerfile multi-stage reproducible: stage 1 `node:20-alpine` build, stage 2 `nginx:alpine` sirve `dist/`. Imagen <50MB.                                                  | `docker build` exitoso; container expone :80 con SPA.                                | RNF01 backend              |
| **RNF-FE06** | **Conventional Commits en inglés**, **Gitflow estricto**, `main` protegido, ≥2 reviewers, PR con descripción de verificación + link a AI log.                             | Configuración branch protection GitHub; CI valida formato de commits (`commitlint`). | CLAUDE.md §3, §7           |
| **RNF-FE07** | **Logs de prompts obligatorios**: cada sesión de IA queda registrada en `docs/prompts/YYYY-MM-DD-<tema>.md` con prompt, output resumido, decisión y tradeoffs.            | Inspección manual; cada PR enlaza al log de la sesión.                               | CLAUDE.md §7               |
| **RNF-FE08** | Variables de entorno gestionadas vía `.env.local` (no commiteado) y `.env.local.example` (commiteado, con placeholders). Variables prefijadas con `VITE_*`.               | `.gitignore` incluye `.env.local`; arranque sin env falla con mensaje claro.         | Vite best practices        |
| **RNF-FE09** | Performance: code-splitting por ruta vía `React.lazy` + `Suspense`. Bundle inicial < 250KB gzipped.                                                                       | Reporte `vite build` + `rollup-plugin-visualizer`.                                   | NFR Performance curso      |
| **RNF-FE10** | Monitoreo: New Relic Browser inyectado vía variable de entorno (`VITE_NEW_RELIC_*`).                                                                                      | Snippet presente en `dist/index.html` post-build.                                    | RNF09 backend              |
| **RNF-FE11** | Seguridad: nunca persistir tokens en `localStorage` salvo refresh token rotado por Auth0; usar `auth0-react` defaults (in-memory + cookies). No log de tokens en consola. | Code review; ESLint custom rule contra `localStorage.setItem.*token`.                | OWASP SPA                  |

---

## Contratos API consumidos (resumen)

> Detalle completo en `CityExpress-backendG15/docs/architecture.md`.

```
GET    /packages?page=1&limit=25&originId=&destinationId=&status=
       → 200 { items: Package[], total, page, limit }

GET    /packages/:id
       → 200 Package | 404

GET    /routes        (alias: /distance-table)
       → 200 { destinations: { [cityCode]: { name, distance, transportCost, enabled } } }

POST   /packages/:id/deliver
       Headers: Authorization: Bearer <JWT>
       → 200 { status: "delivered", lastAction: ISO8601 } | 409 (ya entregado) | 425 (deliverNotBefore no cumplido)
```

### Tipo `Package` (forma del DTO esperado)

```
{
  id: string,
  originId: string,           // e.g. "HGW"
  destinationId: string,      // e.g. "COR"
  maxHops: number,
  deliveryStrategy: "direct" | "random",
  deliverNotBefore: string,   // ISO 8601
  createdAt: string,          // ISO 8601
  payment: number,
  priorityClass: "low" | "medium" | "high",
  status: "transit" | "received" | "delivered" | "expired",
  lastAction: string          // ISO 8601
}
```

---

## Trazabilidad RF-FE ↔ Hito ↔ Ciclo

| RF-FE   | Hito  | Ciclo |
| ------- | ----- | ----- |
| RF-FE01 | H2    | C2    |
| RF-FE02 | H3    | C2    |
| RF-FE03 | H4    | C3    |
| RF-FE04 | H1    | C1    |
| RF-FE05 | H1    | C1    |
| RF-FE06 | H2-H4 | C2-C3 |
