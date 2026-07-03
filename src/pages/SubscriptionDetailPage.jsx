import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getSubscriptionById } from '../services/api/subscriptionService';
import { formatCurrency } from '../utils/formatters';

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-CL');
}

function getStatusBadgeClass(status) {
  if (status === 'active' || status === 'delivered' || status === 'completed') {
    return 'badge-success';
  }

  if (status === 'paused' || status === 'pending') {
    return 'badge-warning';
  }

  if (
    status === 'expired' ||
    status === 'failed' ||
    status === 'exhausted' ||
    status === 'cancelled'
  ) {
    return 'badge-danger';
  }

  return 'badge-neutral';
}

export default function SubscriptionDetailPage() {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const { isAuthenticated, isLoading } = useAuth0();

  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading || !isAuthenticated || !subscriptionId) return;

    async function loadSubscription() {
      try {
        setLoadingSubscription(true);
        setError('');

        const data = await getSubscriptionById(subscriptionId);
        setSubscription(data);
      } catch (err) {
        setError(err?.message || 'No se pudo cargar la suscripción.');
      } finally {
        setLoadingSubscription(false);
      }
    }

    loadSubscription();
  }, [isLoading, isAuthenticated, subscriptionId]);

  const shipments = Array.isArray(subscription?.shipments) ? subscription.shipments : [];
  const ledger = Array.isArray(subscription?.ledger) ? subscription.ledger : [];

  if (isLoading) {
    return (
      <main>
        <h1>Detalle de suscripción</h1>
        <p className="loading-box">Cargando sesión...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Detalle de suscripción</h1>
        <p className="error-message">Debes iniciar sesión para ver esta suscripción.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Detalle de suscripción</h1>
      <p className="page-subtitle">
        Consulta el estado general, los paquetes generados y los movimientos del budget.
      </p>

      <div className="button-row">
        <button className="btn-secondary" type="button" onClick={() => navigate('/subscriptions')}>
          Volver a mis suscripciones
        </button>

        <button
          className="btn-primary"
          type="button"
          onClick={() => navigate('/subscriptions/new')}
        >
          Crear otra suscripción
        </button>
      </div>

      {loadingSubscription && <p className="loading-box">Cargando suscripción...</p>}

      {error && <p className="error-message">{error}</p>}

      {subscription && (
        <>
          <section className="quote-card">
            <h2>Resumen general</h2>

            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">ID</span>
                <span className="summary-value">
                  {subscription.id || subscription.subscriptionId || subscriptionId}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Estado</span>
                <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>
                  {subscription.status || 'sin estado'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Destino</span>
                <span className="summary-value">{subscription.destinationId}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Criterio</span>
                <span className="summary-value">
                  {subscription.criteria === 'price' ? 'Precio' : 'Distancia'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Prioridad</span>
                <span className="summary-value">{subscription.priorityClass || '-'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Seguro</span>
                <span className="summary-value">{subscription.insured ? 'Sí' : 'No'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Precio por envío</span>
                <span className="summary-value">
                  {formatCurrency(subscription.pricePerShipment)}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Budget inicial</span>
                <span className="summary-value">{formatCurrency(subscription.budget)}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Budget restante</span>
                <span className="summary-value">
                  {formatCurrency(subscription.budgetRemaining)}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Enviados</span>
                <span className="summary-value">{subscription.sentCount ?? 0}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Restantes</span>
                <span className="summary-value">{subscription.remaining ?? '-'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Periodicidad</span>
                <span className="summary-value">
                  {subscription.periodSeconds ? `${subscription.periodSeconds} segundos` : '-'}
                </span>
              </div>
            </div>
          </section>

          <section className="section-card">
            <h2>Paquetes generados</h2>

            {shipments.length === 0 ? (
              <p className="helper-text">
                Aún no hay paquetes generados. La suscripción ya fue creada, pero el motor de
                ejecución todavía no ha disparado envíos.
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tick</th>
                      <th>Package ID</th>
                      <th>Costo</th>
                      <th>Estado</th>
                      <th>Razón</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shipments.map((shipment) => (
                      <tr
                        key={`${shipment.tickNumber}-${shipment.packageId || shipment.createdAt}`}
                      >
                        <td>{shipment.tickNumber}</td>
                        <td>{shipment.packageId || '-'}</td>
                        <td>{formatCurrency(shipment.cost)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(shipment.status)}`}>
                            {shipment.status || 'sin estado'}
                          </span>
                        </td>
                        <td>{shipment.reason || '-'}</td>
                        <td>{formatDate(shipment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="section-card">
            <h2>Ledger de budget</h2>

            {ledger.length === 0 ? (
              <p className="helper-text">Aún no hay movimientos registrados en el budget.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Delta</th>
                      <th>Balance posterior</th>
                      <th>Razón</th>
                      <th>Referencia</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ledger.map((movement) => (
                      <tr key={`${movement.refId || movement.reason}-${movement.createdAt}`}>
                        <td>{formatCurrency(movement.delta)}</td>
                        <td>{formatCurrency(movement.balanceAfter)}</td>
                        <td>{movement.reason || '-'}</td>
                        <td>{movement.refId || '-'}</td>
                        <td>{formatDate(movement.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
