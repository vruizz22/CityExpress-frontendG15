import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { isAdminUser } from '../auth/authRoles';

export default function AdminRoute({ children }) {
  const { isLoading, isAuthenticated, user } = useAuth0();

  if (isLoading) {
    return (
      <main>
        <p className="loading-box">Verificando permisos...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdminUser(user)) {
    return (
      <main>
        <h1>Acceso restringido</h1>
        <p className="error-message">
          No tienes permisos de administrador para acceder a esta vista.
        </p>
      </main>
    );
  }

  return children;
}
