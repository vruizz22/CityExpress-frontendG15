import { Link } from 'react-router-dom';
import './NavBar.css';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';
import { isAdminUser } from '../auth/authRoles';

export default function Navbar() {
  const { isAuthenticated, isLoading, user } = useAuth0();

  const isAdmin = isAdminUser(user);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <p>CityExpress</p>
      </div>

      <Link to="/">Inicio</Link>

      {isAuthenticated && (
        <>
          <Link to="/create-shipment">Crear envío</Link>
          {isAdmin ? (
            <Link to="/my-shipments">Todos los envíos</Link>
          ) : (
            <Link to="/my-shipments">Mis envíos</Link>
          )}
        </>
      )}

      {isAuthenticated && isAdmin && (
        <>
          <Link to="/packages">Listado de paquetes</Link>
          <Link to="/routes">Listado de rutas</Link>
        </>
      )}

      {isLoading ? (
        <span>Cargando sesión...</span>
      ) : isAuthenticated ? (
        <>
          <span>{user?.email}</span>
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </nav>
  );
}
