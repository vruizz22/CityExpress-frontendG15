import { useEffect, useMemo, useState } from 'react';
import { getRecentEvents, subscribeToEventStream } from '../services/api/eventFeedService';
import { formatCurrency } from '../utils/formatters';

const MAX_EVENTS = 80;

const EVENT_LABELS = {
  'package-created': 'Paquete creado',
  'package-received': 'Paquete recibido',
  'package-redirected': 'Paquete redirigido',
  'insurance-charged': 'Cobro de seguro',
  'package-status': 'Estado de paquete',
};

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-CL');
}

function getEventLabel(type) {
  return EVENT_LABELS[type] || type || 'Evento desconocido';
}

function getEventBadgeClass(type) {
  switch (type) {
    case 'package-created':
      return 'badge-info';
    case 'package-received':
      return 'badge-success';
    case 'package-redirected':
      return 'badge-warning';
    case 'insurance-charged':
      return 'badge-danger';
    case 'package-status':
      return 'badge-neutral';
    default:
      return 'badge-neutral';
  }
}

function buildEventDescription(event) {
  if (event.message) return event.message;

  switch (event.type) {
    case 'package-created':
      return `Se creó un paquete${event.destination ? ` hacia ${event.destination}` : ''}.`;

    case 'package-received':
      return `El paquete fue recibido${event.destination ? ` en ${event.destination}` : ''}.`;

    case 'package-redirected':
      return `El paquete fue redirigido${
        event.origin && event.destination ? ` desde ${event.origin} hacia ${event.destination}` : ''
      }.`;

    case 'insurance-charged':
      return `Se cobró el seguro${event.amount ? ` por ${formatCurrency(event.amount)}` : ''}.`;

    case 'package-status':
      return `El paquete cambió de estado${event.status ? ` a ${event.status}` : ''}.`;

    default:
      return 'Evento recibido desde la plataforma.';
  }
}

export default function LiveDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loadingRecentEvents, setLoadingRecentEvents] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRecentEvents() {
      try {
        setLoadingRecentEvents(true);
        setError('');

        const recentEvents = await getRecentEvents();

        if (!isMounted) return;

        setEvents(Array.isArray(recentEvents) ? recentEvents : []);
      } catch (err) {
        if (!isMounted) return;

        setError(err?.message || 'No se pudieron cargar los eventos recientes.');
      } finally {
        if (isMounted) {
          setLoadingRecentEvents(false);
        }
      }
    }

    loadRecentEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const eventSource = subscribeToEventStream({
      onMessage: (event) => {
        setConnectionStatus('connected');
        setError('');

        setEvents((previousEvents) => [event, ...previousEvents].slice(0, MAX_EVENTS));
      },
      onError: (err) => {
        setConnectionStatus('error');
        setError(err?.message || 'Se perdió la conexión con el feed de eventos.');
      },
    });

    eventSource.onopen = () => {
      setConnectionStatus('connected');
      setError('');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const stats = useMemo(() => {
    return events.reduce(
      (accumulator, event) => {
        accumulator.total += 1;
        accumulator.byType[event.type] = (accumulator.byType[event.type] || 0) + 1;

        return accumulator;
      },
      {
        total: 0,
        byType: {},
      },
    );
  }, [events]);

  return (
    <main>
      <h1>Dashboard en vivo</h1>
      <p className="page-subtitle">
        Feed en tiempo real de eventos de paquetes, redirecciones y seguros.
      </p>

      <section className="section-card">
        <h2>Estado del feed</h2>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Conexión SSE</span>
            <span
              className={`badge ${
                connectionStatus === 'connected' ? 'badge-success' : 'badge-warning'
              }`}
            >
              {connectionStatus === 'connected'
                ? 'Conectado'
                : connectionStatus === 'error'
                  ? 'Con error'
                  : 'Conectando'}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Eventos visibles</span>
            <span className="summary-value">{stats.total}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Paquetes creados</span>
            <span className="summary-value">{stats.byType['package-created'] || 0}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Cobros de seguro</span>
            <span className="summary-value">{stats.byType['insurance-charged'] || 0}</span>
          </div>
        </div>
      </section>

      {loadingRecentEvents && <p className="loading-box">Cargando eventos recientes...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loadingRecentEvents && events.length === 0 && (
        <section className="section-card">
          <h2>Sin eventos por ahora</h2>
          <p className="helper-text">
            Cuando se creen, reciban, redirijan o expiren paquetes, aparecerán en este feed.
          </p>
        </section>
      )}

      {events.length > 0 && (
        <section className="section-card">
          <h2>Eventos recientes</h2>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Paquete</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event, index) => (
                  <tr key={`${event.type}-${event.timestamp}-${event.packageId || index}`}>
                    <td>
                      <span className={`badge ${getEventBadgeClass(event.type)}`}>
                        {getEventLabel(event.type)}
                      </span>
                    </td>
                    <td>{formatDate(event.timestamp)}</td>
                    <td>{event.packageId || '-'}</td>
                    <td>{event.origin || '-'}</td>
                    <td>{event.destination || '-'}</td>
                    <td>{event.status || '-'}</td>
                    <td>{event.amount ? formatCurrency(event.amount) : '-'}</td>
                    <td>{event.reason || buildEventDescription(event)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
