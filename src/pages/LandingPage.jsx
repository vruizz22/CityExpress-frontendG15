import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>Bienvenido a CityExpress</h1>
      <h4>Aquí puedes revisar el estado de los paquetes recibidos y las rutas</h4>
      <button onClick={() => navigate('/routes')}>Ver rutas</button>
      <button onClick={() => navigate('/packages')}>Ver paquetes</button>
    </main>
  );
}
