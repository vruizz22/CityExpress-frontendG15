import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { isAdminUser } from '../auth/authRoles';
import WorkerHeartbeat from '../components/WorkerHeartbeat';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth0();

  const isAdmin = isAdminUser(user);

  if (isLoading) {
    return (
      <main>
        <h1>Bienvenido a CityExpress</h1>
        <p className="loading-box">Cargando sesión...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Bienvenido a CityExpress</h1>

      {isAuthenticated ? (
        <>
          {isAdmin ? (
            <h4>Administra paquetes, rutas, workers y también crea nuevos envíos para usuarios.</h4>
          ) : (
            <h4>Crea envíos, programa suscripciones y consulta el estado de tus paquetes.</h4>
          )}

          <div className="button-row">
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate('/create-shipment')}
            >
              Crear envío
            </button>

            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate('/my-shipments')}
            >
              {isAdmin ? 'Todos los envíos' : 'Mis envíos'}
            </button>

            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate('/subscriptions/new')}
            >
              Crear suscripción
            </button>

            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate('/subscriptions')}
            >
              Mis suscripciones
            </button>

            {isAdmin && (
              <>
                <button className="btn-secondary" type="button" onClick={() => navigate('/routes')}>
                  Ver rutas
                </button>

                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => navigate('/packages')}
                >
                  Ver paquetes
                </button>
              </>
            )}
          </div>

          {isAdmin && <WorkerHeartbeat />}
        </>
      ) : (
        <>
          <h4>Inicia sesión para crear envíos, suscripciones y revisar su estado.</h4>

          <div className="button-row">
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate('/create-shipment')}
            >
              Crear envío
            </button>
          </div>
        </>
      )}
    </main>
  );
}
