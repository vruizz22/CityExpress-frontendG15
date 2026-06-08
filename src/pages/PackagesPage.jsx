import { useState, useEffect } from 'react';
import PackageTable from '../components/PackageTable';
import { getPackages, deliverPackage } from '../services/api/packagesApi';
import { useAuth0 } from '@auth0/auth0-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    async function loadPackages() {
      try {
        setIsLoading(true);
        setError('');

        const response = await getPackages(page, limit);

        setPackages(response.data ?? []);
        setMeta(
          response.meta ?? {
            total: response.data?.length ?? 0,
            page,
            limit,
            totalPages: 1,
          },
        );
      } catch (err) {
        console.log(err);
        setError('No se pudieron cargar los paquetes.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPackages();
  }, [isLoading, isAuthenticated, page, limit]);

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

  const handlePreviousPage = () => {
    setPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((currentPage) => Math.min(currentPage + 1, meta.totalPages || 1));
  };

  if (isLoading) {
    return <p>Cargando sesión...</p>;
  }

  if (!isAuthenticated) {
    return <p>Inicia sesión para ver el listado de paquetes</p>;
  }

  if (loading) {
    return <p>Cargando paquetes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Paquetes recibidos</h1>
      <h3>Última acción realizada por la ciudad a los paquetes</h3>

      {packages.length === 0 ? (
        <p>No hay paquetes recibidos</p>
      ) : (
        <>
          <PackageTable packages={packages} onDeliver={handleDeliver} />

          <section className="section-card">
            <p className="info-text">
              Página {meta.page} de {meta.totalPages} — Total de paquetes: {meta.total}
            </p>

            <div className="button-row">
              <button
                className="btn-secondary"
                type="button"
                onClick={handlePreviousPage}
                disabled={page <= 1}
              >
                Anterior
              </button>

              <button
                className="btn-secondary"
                type="button"
                onClick={handleNextPage}
                disabled={page >= meta.totalPages}
              >
                Siguiente
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
