import { useState, useEffect } from 'react';
import RoutesTable from '../components/RoutesTable';
import { getRoutes } from '../services/api/routesApi';
import { useAuth0 } from '@auth0/auth0-react';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    async function loadRoutes() {
      try {
        const response = await getRoutes();
        setRoutes(response.data ?? []);
        setIsLoading(false);
        setError('');
      } catch (err) {
        console.log(err);
        setError('No se pudieron cargar las rutas');
      } finally {
        setIsLoading(false);
      }
    }
    loadRoutes();
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <p>Cargando sesión...</p>;
  }
  if (!isAuthenticated) {
    return <p>Inicia sesión para ver el listado de rutas</p>;
  }

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
