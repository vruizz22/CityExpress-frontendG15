import { useState, useEffect } from 'react';
import PackageTable from '../components/PackageTable';
import { getPackages, deliverPackage } from '../services/api/packagesApi';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPackages() {
      try {
        const data = await getPackages();
        setPackages(data);
        setIsLoading(true);
        setError('');
      } catch (err) {
        console.log(err);
        setError('No se pudieron cargar los paquetes.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPackages();
  }, []);

  const handleDeliver = async (pkIdDelivered) => {
    try {
      await deliverPackage(pkIdDelivered);
      setPackages((prev) =>
        prev.map((pk) =>
          pk.id === pkIdDelivered
            ? {
                ...pk,
                status: 'delivered',
                lastAction: 'delivered',
                canDeliver: false,
              }
            : pk,
        ),
      );
    } catch (err) {
      console.log(err);
      setError('No se pudo entregar el paquete');
    }
  };
  if (loading) {
    return <p>Cargando paquetes...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (packages.length === 0) {
    return <p>No hay paquetes recibidos</p>;
  }

  return (
    <main>
      <h1>Paquetes recibidos</h1>
      <h3>Ultima acción realizada por la ciudad a los paquetes</h3>
      <PackageTable packages={packages} onDeliver={handleDeliver} />
    </main>
  );
}
