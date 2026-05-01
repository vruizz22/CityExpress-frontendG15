import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

export default function Navbar(/* { user, onLogout } */) {
  const navigate = useNavigate();

  /* const handleLogout = () => {
    onLogout();
    navigate('/');
  }; */

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>CityExpress</h2>
      </div>
      <Link to="/">Inicio</Link>
      <Link to="/packages">Listado de paquetes</Link>
      <Link to="/routes">Listado de rutas</Link>
    </nav>
  );
}
