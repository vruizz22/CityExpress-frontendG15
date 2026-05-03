# Session: 2026-05-02 — E1 frontend-api-services

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para simular la conexion con la api y la elaboaración de tests. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta. Se continuó a partir de la sesion 2026-05-01-frontend-setup para evitar tener que cargar la información nuevamente.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt 1

> Considerando los mocks elaborados anteriormente, quiero simular el comportamiento de la api para que la posterior integración sea más simple.

### Respuesta

Perfecto, partamos bien ordenados 👌

#### 🚀 Qué haremos ahora

Vamos a crear la **capa de servicios** (sin API real todavía).

---

#### 📁 Estructura

Crea:

```txt
src/services/
src/services/api/
```

---

#### 🟢 Paso 1: packagesApi

Crea:

```txt
src/services/api/packagesApi.js
```

```js
import { mockPackages } from '../../mocks/mockPackages';

export async function getPackages() {
  // simulamos async
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPackages), 300);
  });
}

export async function deliverPackage(packageId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, packageId }), 300);
  });
}
```

---

#### 🟢 Paso 2: routesApi

```txt
src/services/api/routesApi.js
```

```js
import { mockRoutes } from '../../mocks/mockRoutes';

export async function getRoutes() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRoutes), 300);
  });
}
```

---

#### 🟢 Paso 3: conectar en PackagesPage

Antes tenías:

```js
useState(mockPackages);
```

Cámbialo a:

```jsx
import { useEffect, useState } from 'react';
import PackagesTable from '../components/PackagesTable';
import { getPackages, deliverPackage } from '../services/api/packagesApi';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true);
        setError('');

        const data = await getPackages();
        setPackages(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los paquetes.');
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  const handleDeliver = async (packageId) => {
    try {
      await deliverPackage(packageId);

      setPackages((currentPackages) =>
        currentPackages.map((pk) =>
          pk.id === packageId ? { ...pk, status: 'delivered', canDeliver: false } : pk,
        ),
      );
    } catch (err) {
      console.error(err);
      setError('No se pudo entregar el paquete.');
    }
  };

  if (loading) return <p>Cargando paquetes...</p>;

  if (error) return <p>{error}</p>;

  if (packages.length === 0) return <p>No hay paquetes recibidos.</p>;

  return (
    <main>
      <h1>Paquetes recibidos</h1>
      <PackagesTable packages={packages} onDeliver={handleDeliver} />
    </main>
  );
}
```

---

#### 🟢 Paso 4: conectar RoutesPage

```jsx
import { useEffect, useState } from 'react';
import RoutesTable from '../components/RoutesTable';
import { getRoutes } from '../services/api/routesApi';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        setError('');

        const data = await getRoutes();
        setRoutes(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las rutas.');
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, []);

  if (loading) return <p>Cargando rutas...</p>;

  if (error) return <p>{error}</p>;

  if (routes.length === 0) return <p>No hay rutas disponibles.</p>;

  return (
    <main>
      <h1>Conectividad de rutas</h1>
      <RoutesTable routes={routes} />
    </main>
  );
}
```

---

#### 🎯 Resultado

```txt
✔ Ya no dependes de mocks directamente
✔ Tienes capa intermedia (clave para backend)
✔ Después solo cambias services → API real
```

---

## Promt 2

> Me faltarán tests considerando estos cambios

### Respuesta

Sí. Como agregaste **services**, ahora conviene agregar tests para ese bloque.

Haz tests mínimos para:

```txt
packagesApi.js
routesApi.js
PackagesPage.jsx
RoutesPage.jsx
```

Primero crea:

```txt
src/services/api/packagesApi.test.js
```

```js
import { describe, expect, it } from 'vitest';
import { getPackages, deliverPackage } from './packagesApi';

describe('packagesApi', () => {
  it('returns mock packages', async () => {
    const packages = await getPackages();

    expect(packages.length).toBeGreaterThan(0);
    expect(packages[0]).toHaveProperty('id');
  });

  it('delivers package', async () => {
    const result = await deliverPackage('pkg-001');

    expect(result).toEqual({
      success: true,
      packageId: 'pkg-001',
    });
  });
});
```

Luego:

```txt
src/services/api/routesApi.test.js
```

```js
import { describe, expect, it } from 'vitest';
import { getRoutes } from './routesApi';

describe('routesApi', () => {
  it('returns mock routes', async () => {
    const routes = await getRoutes();

    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]).toHaveProperty('code');
    expect(routes[0]).toHaveProperty('enabled');
  });
});
```

Después corre:

```bash
pnpm test:coverage
```

Eso debería subir coverage del nuevo bloque.
