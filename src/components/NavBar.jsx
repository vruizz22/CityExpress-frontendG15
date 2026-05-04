import { Link } from 'react-router-dom';
import './NavBar.css';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

export default function Navbar(/* { user, onLogout } */) {
  const { isAuthenticated, isLoading, user } = useAuth0();
  /* const handleLogout = () => {
    onLogout();
    navigate('/');
  }; */

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <p>CityExpress</p>
      </div>
      <Link to="/">Inicio</Link>
      <Link to="/packages">Listado de paquetes</Link>
      <Link to="/routes">Listado de rutas</Link>
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
