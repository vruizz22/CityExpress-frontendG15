import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main>
      <h1>Bienvenido a CityExpress</h1>
      <h4>Aquí puedes revisar el estado de los paquetes recibidos y las rutas</h4>
      <Link to="/routes">
        <button>Ver paquetes</button>
      </Link>
      <Link to="/packages">
        <button>Ver paquetes</button>
      </Link>
    </main>
  );
}
