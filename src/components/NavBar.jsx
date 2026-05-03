import { Link } from 'react-router-dom';
import './NavBar.css';

export default function Navbar(/* { user, onLogout } */) {
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
    </nav>
  );
}
