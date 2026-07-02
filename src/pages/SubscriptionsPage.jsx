import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getSubscriptions } from '../services/api/subscriptionService';
import { formatCurrency } from '../utils/formatters';

const PAGE_LIMIT = 25;

function getSubscriptionId(subscription) {
  return subscription.id || subscription.subscriptionId;
}

function getStatusBadgeClass(status) {
  if (status === 'active') return 'badge-success';
  if (status === 'paused') return 'badge-warning';
  if (status === 'completed') return 'badge-info';
  if (status === 'exhausted' || status === 'cancelled') return 'badge-danger';
  return 'badge-neutral';
}

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  const [subscriptions, setSubscriptions] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
  });

  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    async function loadSubscriptions() {
      try {
        setLoadingSubscriptions(true);
        setError('');

        const response = await getSubscriptions(meta.page, PAGE_LIMIT);

        setSubscriptions(Array.isArray(response?.data) ? response.data : []);
        setMeta(
          response?.meta || {
            total: 0,
            page: meta.page,
            limit: PAGE_LIMIT,
            totalPages: 1,
          },
        );
      } catch (err) {
        setError(err?.message || 'No se pudieron cargar las suscripciones.');
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    loadSubscriptions();
  }, [isLoading, isAuthenticated, meta.page]);

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > meta.totalPages) return;

    setMeta((previousMeta) => ({
      ...previousMeta,
      page: nextPage,
    }));
  }

  if (isLoading) {
    return (
      <main>
        <h1>Mis suscripciones</h1>
        <p className="loading-box">Cargando sesión...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Mis suscripciones</h1>
        <p className="error-message">Debes iniciar sesión para ver tus suscripciones.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Mis suscripciones</h1>
      <p className="page-subtitle">Revisa tus envíos periódicos, su budget, estado y avance.</p>

      <div className="button-row">
        <button
          className="btn-primary"
          type="button"
          onClick={() => navigate('/subscriptions/new')}
        >
          Crear suscripción
        </button>
      </div>

      {loadingSubscriptions && <p className="loading-box">Cargando suscripciones...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loadingSubscriptions && !error && subscriptions.length === 0 && (
        <section className="section-card">
          <h2>Aún no tienes suscripciones</h2>
          <p className="helper-text">
            Crea una suscripción para programar envíos periódicos con budget prepago.
          </p>

          <div className="button-row">
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate('/subscriptions/new')}
            >
              Crear mi primera suscripción
            </button>
          </div>
        </section>
      )}

      {subscriptions.length > 0 && (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Enviados</th>
                  <th>Restantes</th>
                  <th>Budget restante</th>
                  <th>Precio/envío</th>
                  <th>Prioridad</th>
                  <th>Seguro</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription) => {
                  const subscriptionId = getSubscriptionId(subscription);

                  return (
                    <tr key={subscriptionId}>
                      <td>{subscriptionId}</td>
                      <td>{subscription.destinationId}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>
                          {subscription.status || 'sin estado'}
                        </span>
                      </td>
                      <td>{subscription.sentCount ?? 0}</td>
                      <td>{subscription.remaining ?? '-'}</td>
                      <td>{formatCurrency(subscription.budgetRemaining)}</td>
                      <td>{formatCurrency(subscription.pricePerShipment)}</td>
                      <td>{subscription.priorityClass || '-'}</td>
                      <td>{subscription.insured ? 'Sí' : 'No'}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => navigate(`/subscriptions/${subscriptionId}`)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="button-row">
            <button
              className="btn-secondary"
              type="button"
              disabled={meta.page <= 1}
              onClick={() => goToPage(meta.page - 1)}
            >
              Anterior
            </button>

            <span>
              Página {meta.page} de {meta.totalPages || 1}
            </span>

            <button
              className="btn-secondary"
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => goToPage(meta.page + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </main>
  );
}
