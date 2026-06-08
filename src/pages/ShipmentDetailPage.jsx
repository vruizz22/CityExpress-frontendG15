import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getShipmentById } from '../services/api/shipmentService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  getPaymentBadgeClass,
  getShipmentBadgeClass,
  translatePaymentStatus,
  translateShipmentStatus,
} from '../utils/statusLabels';

export default function ShipmentDetailPage() {
  const { shipmentId } = useParams();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadShipment() {
      try {
        setLoading(true);
        setError('');

        const response = await getShipmentById(shipmentId);
        setShipment(response);
      } catch (err) {
        setError(err?.message || 'No se pudo cargar el detalle del envío.');
      } finally {
        setLoading(false);
      }
    }

    if (shipmentId) {
      loadShipment();
    }
  }, [shipmentId]);

  if (loading) {
    return (
      <main>
        <h1>Detalle del envío</h1>
        <p className="loading-box">Cargando detalle...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Detalle del envío</h1>
        <p className="error-message">{error}</p>

        <div className="button-row">
          <Link className="btn btn-secondary" to="/my-shipments">
            Volver al historial
          </Link>
        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main>
        <h1>Detalle del envío</h1>
        <p className="info-text">No se encontró información para este envío.</p>

        <div className="button-row">
          <Link className="btn btn-secondary" to="/my-shipments">
            Volver al historial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Detalle del envío</h1>
      <p className="page-subtitle">
        Información completa del paquete, la ruta calculada y el pago asociado.
      </p>

      <section className="section-card">
        <h2>Información del envío</h2>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">ID envío</span>
            <span className="summary-value">{shipment.id}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">ID paquete</span>
            <span className="summary-value">{shipment.packageId || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Origen</span>
            <span className="summary-value">{shipment.originId || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Destino</span>
            <span className="summary-value">{shipment.destinationId || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Criterio</span>
            <span className="summary-value">
              {shipment.criteria === 'price'
                ? 'Precio'
                : shipment.criteria === 'distance'
                  ? 'Distancia'
                  : 'No disponible'}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Monto</span>
            <span className="summary-value">{formatCurrency(shipment.amount)}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Saltos</span>
            <span className="summary-value">{shipment.hops ?? 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Siguiente salto</span>
            <span className="summary-value">{shipment.nextHop || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">RouteMetricCost</span>
            <span className="summary-value">{shipment.routeMetricCost ?? 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Estado del envío</span>
            <span className={getShipmentBadgeClass(shipment.status)}>
              {translateShipmentStatus(shipment.status)}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Fecha de creación</span>
            <span className="summary-value">{formatDate(shipment.createdAt)}</span>
          </div>

          <div className="summary-item form-group-full">
            <span className="summary-label">Ruta calculada</span>
            <span className="summary-value">
              {shipment.routePath?.length ? shipment.routePath.join(' → ') : 'No disponible'}
            </span>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h2>Información del pago</h2>

        {shipment.payment ? (
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">ID pago</span>
              <span className="summary-value">{shipment.payment.id}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Estado pago</span>
              <span className={getPaymentBadgeClass(shipment.payment.status)}>
                {translatePaymentStatus(shipment.payment.status)}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Monto pagado</span>
              <span className="summary-value">{formatCurrency(shipment.payment.amount)}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Código autorización</span>
              <span className="summary-value">
                {shipment.payment.authorizationCode || 'No disponible'}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Fecha transacción</span>
              <span className="summary-value">{formatDate(shipment.payment.transactionDate)}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Razón</span>
              <span className="summary-value">{shipment.payment.reason || 'No disponible'}</span>
            </div>
          </div>
        ) : (
          <p className="info-text">Este envío todavía no tiene un pago asociado.</p>
        )}
      </section>

      <div className="button-row">
        <Link className="btn btn-secondary" to="/my-shipments">
          Volver al historial
        </Link>
      </div>
    </main>
  );
}
