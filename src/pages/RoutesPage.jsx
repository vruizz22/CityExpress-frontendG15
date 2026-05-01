import { useState } from 'react';
import RoutesTable from '../components/RoutesTable';
import { mockRoutes } from '../mocks/mockRoutes';

export default function RoutesPage() {
  return (
    <main>
      <h1>Conectividad de rutas</h1>
      <h3>Estado actual de conectividad con otras ciudades</h3>
      <RoutesTable routes={mockRoutes} />
    </main>
  );
}
