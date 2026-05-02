import { useState, useEffect } from 'react';
import RoutesTable from '../components/RoutesTable';
import { getRoutes } from '../services/api/routesApi';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoutes() {
      try {
        const data = await getRoutes();
        setRoutes(data);
        setIsLoading(false);
        setError('');
      } catch (err) {
        setError('No se pudieron cargar las rutas');
      } finally {
        setIsLoading(false);
      }
    }
    loadRoutes();
  }, []);

  if (loading) {
    return <p>Cargando rutas...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (routes.length === 0) {
    return <p>No hay rutas disponibles.</p>;
  }

  return (
    <main>
      <h1>Conectividad de rutas</h1>
      <h3>Estado actual de conectividad con otras ciudades</h3>
      <RoutesTable routes={routes} />
    </main>
  );
}
