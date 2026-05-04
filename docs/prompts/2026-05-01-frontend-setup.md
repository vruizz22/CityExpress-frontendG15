# Session: 2026-05-01 — E1 Frontend setup

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para comenzar a estructurar el proyecto y la elaboaración de tests. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Prompt 1

> Hola, tenemos este proyecto por desarrollar, adjunto enuncioado ('2026-1+7C+CityExpress.pdf'). Estaré trabajando con el frontend. Creame mockpages para simular el funcionamiento del frontend a la espera del desarrollo del backend e indicame que estructura sugeririas para comenzar.

### Respuesta

Perfecto. **dejar frontend visible funcionando con mocks.**

#### Paso 1: crea estructura

Dentro de `src/`, crea:

```txt
pages/
components/
mocks/
router/
```

---

#### Paso 2: crea mocks

Crea:

```txt
src/mocks/mockPackages.js
```

```js
export const mockPackages = [
  {
    id: 'pkg-001',
    originId: 'central',
    destinationId: 'RNC',
    maxHops: 3,
    createdAt: '2026-03-01T12:00:00Z',
    deliverNotBefore: '2026-03-20T12:00:00Z',
    status: 'received',
    lastAction: 'received',
    canDeliver: true,
  },
  {
    id: 'pkg-002',
    originId: 'HGW',
    destinationId: 'COR',
    maxHops: 1,
    createdAt: '2026-03-05T12:00:00Z',
    deliverNotBefore: '2026-04-01T12:00:00Z',
    status: 'transit',
    lastAction: 'transit',
    canDeliver: false,
  },
];
```

Crea:

```txt
src/mocks/mockRoutes.js
```

```js
export const mockRoutes = [
  { code: 'HGW', name: 'Hogwarts', enabled: true },
  { code: 'COR', name: 'Coruscant', enabled: false },
  { code: 'RNC', name: 'Rancagua', enabled: true },
  { code: 'TAL', name: 'Talca', enabled: true },
];
```

---

#### Paso 3: crea componentes

Crea:

```txt
src/components/StatusBadge.jsx
```

```jsx
export default function StatusBadge({ status }) {
  const labels = {
    received: 'Recibido',
    transit: 'Reenviado',
    'transit-redirect': 'Redirigido',
    expired: 'Expirado',
    delivered: 'Entregado',
    pending: 'Pendiente',
  };

  return (
    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm">{labels[status] ?? status}</span>
  );
}
```

Crea:

```txt
src/components/PackageTable.jsx
```

```jsx
import StatusBadge from './StatusBadge';

export default function PackageTable({ packages, onDeliver }) {
  return (
    <table className="w-full border-collapse rounded-lg bg-white shadow">
      <thead>
        <tr className="bg-slate-100 text-left">
          <th className="p-3">ID</th>
          <th className="p-3">Origen</th>
          <th className="p-3">Destino</th>
          <th className="p-3">MaxHops</th>
          <th className="p-3">Creado</th>
          <th className="p-3">Entregar desde</th>
          <th className="p-3">Estado</th>
          <th className="p-3">Acción</th>
        </tr>
      </thead>

      <tbody>
        {packages.map((pkg) => (
          <tr key={pkg.id} className="border-t">
            <td className="p-3">{pkg.id}</td>
            <td className="p-3">{pkg.originId}</td>
            <td className="p-3">{pkg.destinationId}</td>
            <td className="p-3">{pkg.maxHops}</td>
            <td className="p-3">{new Date(pkg.createdAt).toLocaleDateString()}</td>
            <td className="p-3">{new Date(pkg.deliverNotBefore).toLocaleDateString()}</td>
            <td className="p-3">
              <StatusBadge status={pkg.status} />
            </td>
            <td className="p-3">
              {pkg.canDeliver && pkg.status !== 'delivered' ? (
                <button
                  onClick={() => onDeliver(pkg.id)}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                >
                  Entregar
                </button>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

#### Paso 4: crea página de paquetes

Crea:

```txt
src/pages/PackagesPage.jsx
```

```jsx
import { useState } from 'react';
import PackageTable from '../components/PackageTable';
import { mockPackages } from '../mocks/mockPackages';

export default function PackagesPage() {
  const [packages, setPackages] = useState(mockPackages);

  const handleDeliver = (packageId) => {
    setPackages((currentPackages) =>
      currentPackages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              status: 'delivered',
              lastAction: 'delivered',
              canDeliver: false,
            }
          : pkg,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="mb-2 text-3xl font-bold">Paquetes recibidos</h1>
      <p className="mb-6 text-slate-600">
        Última acción realizada por la ciudad sobre cada paquete.
      </p>

      <PackageTable packages={packages} onDeliver={handleDeliver} />
    </main>
  );
}
```

---

#### Paso 5: reemplaza `App.jsx`

En `src/App.jsx` pon:

```jsx
import PackagesPage from './pages/PackagesPage';

export default function App() {
  return <PackagesPage />;
}
```

---

Con eso ya deberías ver la primera pantalla real funcionando con mocks.

## Promt 2

> Actualmente tengo una covertura de tests menor al 75% (70% aprox) dame algunos tests para estos archivos (PackageTable.jsx RoutesTable.jsx PackagesPage.jsx RoutesPage.jsx) para alcanzar el 75% mínimo

### Respuesta

Sí, agrega varios tests simples. Te dejo 4 archivos.

#### `src/components/PackageTable.test.jsx`

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PackageTable from './PackageTable';

const packages = [
  {
    id: 'pkg-001',
    originId: 'central',
    destinationId: 'RNC',
    maxHops: 3,
    createdAt: '2026-03-01T12:00:00Z',
    deliverNotBefore: '2026-03-20T12:00:00Z',
    status: 'received',
    canDeliver: true,
  },
  {
    id: 'pkg-002',
    originId: 'HGW',
    destinationId: 'COR',
    maxHops: 1,
    createdAt: '2026-03-05T12:00:00Z',
    deliverNotBefore: '2026-04-01T12:00:00Z',
    status: 'transit',
    canDeliver: false,
  },
];

test('renders package data', () => {
  render(<PackageTable packages={packages} onDeliver={() => {}} />);

  expect(screen.getByText('pkg-001')).toBeInTheDocument();
  expect(screen.getByText('central')).toBeInTheDocument();
  expect(screen.getByText('RNC')).toBeInTheDocument();
  expect(screen.getByText('Recibido')).toBeInTheDocument();
});

test('shows deliver button only when package can be delivered', () => {
  render(<PackageTable packages={packages} onDeliver={() => {}} />);

  expect(screen.getByRole('button', { name: /entregar/i })).toBeInTheDocument();
  expect(screen.getAllByText('—').length).toBeGreaterThan(0);
});

test('calls onDeliver with package id when clicking deliver', () => {
  const onDeliver = vi.fn();

  render(<PackageTable packages={packages} onDeliver={onDeliver} />);

  fireEvent.click(screen.getByRole('button', { name: /entregar/i }));

  expect(onDeliver).toHaveBeenCalledWith('pkg-001');
});
```

#### `src/components/RoutesTable.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import RoutesTable from './RoutesTable';

const routes = [
  { code: 'RNC', name: 'Rancagua', enabled: true },
  { code: 'COR', name: 'Coruscant', enabled: false },
];

test('renders route data', () => {
  render(<RoutesTable routes={routes} />);

  expect(screen.getByText('RNC')).toBeInTheDocument();
  expect(screen.getByText('Rancagua')).toBeInTheDocument();
  expect(screen.getByText('COR')).toBeInTheDocument();
  expect(screen.getByText('Coruscant')).toBeInTheDocument();
});

test('shows enabled and disabled route statuses', () => {
  render(<RoutesTable routes={routes} />);

  expect(screen.getByText('Habilitada')).toBeInTheDocument();
  expect(screen.getByText('Deshabilitada')).toBeInTheDocument();
});
```

#### `src/pages/PackagesPage.test.jsx`

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PackagesPage from './PackagesPage';

test('renders packages page title and table', () => {
  render(<PackagesPage />);

  expect(screen.getByRole('heading', { name: /paquetes/i })).toBeInTheDocument();
  expect(screen.getByText('pkg-001')).toBeInTheDocument();
});

test('changes package status to delivered after clicking deliver', () => {
  render(<PackagesPage />);

  fireEvent.click(screen.getByRole('button', { name: /entregar/i }));

  expect(screen.getByText('Entregado')).toBeInTheDocument();
});
```

#### `src/pages/RoutesPage.test.jsx`

```jsx
import { render, screen } from '@testing-library/react';
import RoutesPage from './RoutesPage';

test('renders routes page title and table', () => {
  render(<RoutesPage />);

  expect(screen.getByRole('heading', { name: /rutas|conectividad/i })).toBeInTheDocument();
  expect(screen.getByText('RNC')).toBeInTheDocument();
});
```

Después corre:

```bash
pnpm test:coverage
```

Con esos tests deberías superar el 75%.
