import { useEffect, useState } from 'react';
import { getShipments } from '../services/api/shipmentService';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  getPaymentBadgeClass,
  getShipmentBadgeClass,
  translatePaymentStatus,
  translateShipmentStatus,
} from '../utils/statusLabels';

export default function MyShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShipments() {
      try {
        setLoading(true);
        setError('');

        const response = await getShipments(page, 25);

        setShipments(response?.data || []);
        setMeta(
          response?.meta || {
            total: 0,
            page,
            limit: 25,
            totalPages: 1,
          },
        );
      } catch (err) {
        setError(err?.message || 'No se pudo cargar el historial de envíos.');
      } finally {
        setLoading(false);
      }
    }

    loadShipments();
  }, [page]);

  function handlePreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 1));
  }

  function handleNextPage() {
    setPage((currentPage) => Math.min(currentPage + 1, meta.totalPages || 1));
  }

  return (
    <main>
      <h1>Mis envíos</h1>
      <p className="page-subtitle">
        Revisa tus envíos, pagos, rutas calculadas y estado del envío inicial.
      </p>

      {loading && <p className="loading-box">Cargando envíos...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && shipments.length === 0 && (
        <section className="section-card">
          <h2>Aún no tienes envíos</h2>
          <p className="info-text">Cuando crees y pagues un envío, aparecerá en esta sección.</p>
        </section>
      )}

      {!loading && shipments.length > 0 && (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paquete</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Criterio</th>
                  <th>Monto</th>
                  <th>Pago</th>
                  <th>Estado envío</th>
                  <th>Ruta</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{formatDate(shipment.createdAt)}</td>
                    <td>{shipment.packageId || 'No disponible'}</td>
                    <td>{shipment.originId || 'No disponible'}</td>
                    <td>{shipment.destinationId || 'No disponible'}</td>
                    <td>
                      {shipment.criteria === 'price'
                        ? 'Precio'
                        : shipment.criteria === 'distance'
                          ? 'Distancia'
                          : 'No disponible'}
                    </td>
                    <td>{formatCurrency(shipment.amount)}</td>
                    <td>
                      <span className={getPaymentBadgeClass(shipment.payment?.status)}>
                        {translatePaymentStatus(shipment.payment?.status)}
                      </span>
                    </td>
                    <td>
                      <span className={getShipmentBadgeClass(shipment.status)}>
                        {translateShipmentStatus(shipment.status)}
                      </span>
                    </td>
                    <td>
                      {shipment.routePath?.length
                        ? shipment.routePath.join(' → ')
                        : 'No disponible'}
                    </td>
                    <td>
                      <Link to={`/shipments/${shipment.id}`} className="btn btn-primary">
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="section-card">
            <p className="info-text">
              Página {meta.page} de {meta.totalPages} — Total de envíos: {meta.total}
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
