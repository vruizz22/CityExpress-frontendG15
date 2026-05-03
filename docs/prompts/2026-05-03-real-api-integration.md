# Session: 2026-05-01 — E1 real-api-integration

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para la realizar las llamadas a la api y elaboaración de tests nuevos. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta. Se continuó a partir de la sesion 2026-05-02-frontend-auth para evitar tener que cargar la información nuevamente.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt 1

Sigamos con la integracion con la API esto me indicó mi compañero realizando el back:
"oye, ya está listo lo del back, te paso los 3 endpoints:

GET /packages — todos los paquetes. cada uno viene con canDeliver (true/false) como lo pediste. también trae lastAction (received, transit, delivered, etc.) por si quieres mostrar el estado.

POST /packages/:id/deliver — para entregar. body vacío. si lo llamas 2 veces no pasa nada, devuelve alreadyDelivered: true. si no se puede entregar tira 400 y si no existe 404.

GET /routes — las 16 ciudades con code, name y enabled.

está en la rama Backend/API-+-base-de-datos, falta mergearla. avísame si quieres que te pase ejemplos del JSON que devuelve cada uno"
Este es el de package:
{
"id": "uuid-del-paquete",
"originId": "central",
"destinationId": "HGW",
"maxHops": 3,
"createdAt": "2026-04-27T12:00:00.000Z",
"deliverNotBefore": "2026-04-27T18:00:00.000Z",
"lastAction": "received",  
 "receivedAt": "2026-04-27T19:00:00.000Z",
"canDeliver": true  
}

### Respuesta

Perfecto. Ese JSON calza con tu mock simple, así que la integración será fácil.

#### Cambios principales

En `src/services/api/packagesApi.js`, cambia mocks por API real:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPackages() {
  const response = await fetch(`${API_BASE_URL}/packages`);

  if (!response.ok) {
    throw new Error('Error al obtener paquetes');
  }

  return response.json();
}

export async function deliverPackage(packageId) {
  const response = await fetch(`${API_BASE_URL}/packages/${packageId}/deliver`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Error al entregar paquete');
  }

  return response.json();
}
```

En `src/services/api/routesApi.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getRoutes() {
  const response = await fetch(`${API_BASE_URL}/routes`);

  if (!response.ok) {
    throw new Error('Error al obtener rutas');
  }

  return response.json();
}
```

En `.env.local` agrega:

```env
VITE_API_BASE_URL=http://localhost:3000
```

O el puerto real del backend.

Tu tabla ya debería funcionar porque el backend devuelve:

```txt
id
originId
destinationId
maxHops
createdAt
deliverNotBefore
lastAction
canDeliver
```

## Promt 2

> Ahora que implementé la conexión a la api, debo corregir los tests de packageApi.jsx y routesApi.jsx.

### Respuesta

Sí. Como ahora `packagesApi` y `routesApi` usan `fetch` real, los tests ya no deben esperar mocks directos. Deben mockear `fetch`.

#### `src/services/api/packagesApi.test.js`

```js
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverPackage, getPackages } from './packagesApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('packagesApi', () => {
  it('gets packages from API', async () => {
    const packages = [{ id: 'pkg-001', canDeliver: true }];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => packages,
      }),
    );

    await expect(getPackages()).resolves.toEqual(packages);
  });

  it('delivers package', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, packageId: 'pkg-001' }),
      }),
    );

    await expect(deliverPackage('pkg-001')).resolves.toEqual({
      success: true,
      packageId: 'pkg-001',
    });
  });
});
```

#### `src/services/api/routesApi.test.js`

```js
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRoutes } from './routesApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('routesApi', () => {
  it('gets routes from API', async () => {
    const routes = [{ code: 'RNC', name: 'Rancagua', enabled: true }];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => routes,
      }),
    );

    await expect(getRoutes()).resolves.toEqual(routes);
  });
});
```

Corre:

```bash
pnpm test:coverage
```
