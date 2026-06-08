import { useEffect, useState } from 'react';
import { createQuote, createShipment, getRoutes } from '../services/api/shipmentService';
import { startPayment } from '../services/api/paymentService';
import { redirectToWebpay } from '../utils/webpayRedirect';
import { formatCurrency } from '../utils/formatters';

const INITIAL_FORM = {
  destinationId: '',
  height: '',
  width: '',
  depth: '',
  criteria: 'price',
  maxHops: '',
  deliverNotBefore: '',
  metaContent: '',
};

function normalizeRoutes(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.routes)) return data.routes;
  if (Array.isArray(data?.destinations)) return data.destinations;
  return [];
}

function getCityCode(city) {
  return city.code || city.destinationCode || city.cityId || city.id;
}

function getCityName(city) {
  return city.name || city.destinationName || city.cityName || getCityCode(city);
}

function formatDateTimeForApi(value) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

export default function CreateShipmentPage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [quote, setQuote] = useState(null);
  const [shipment, setShipment] = useState(null);

  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingShipment, setLoadingShipment] = useState(false);

  const [error, setError] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoadingRoutes(true);
        setError('');

        const data = await getRoutes();
        setRoutes(normalizeRoutes(data));
      } catch (err) {
        setError(err?.message || 'No se pudieron cargar las ciudades.');
      } finally {
        setLoadingRoutes(false);
      }
    }

    loadRoutes();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setQuote(null);
    setShipment(null);
    setError('');
  }

  function validateForm() {
    const height = Number(form.height);
    const width = Number(form.width);
    const depth = Number(form.depth);
    const maxHops = Number(form.maxHops);
    const totalDimensions = height + width + depth;

    if (!form.destinationId) {
      return 'Debes seleccionar una ciudad destino.';
    }

    if (!height || height <= 0) {
      return 'El alto debe ser mayor a 0.';
    }

    if (!width || width <= 0) {
      return 'El ancho debe ser mayor a 0.';
    }

    if (!depth || depth <= 0) {
      return 'La profundidad debe ser mayor a 0.';
    }

    if (totalDimensions > 3000) {
      return 'La suma de alto, ancho y profundidad no puede superar 3000 cm.';
    }

    if (!['price', 'distance'].includes(form.criteria)) {
      return 'El criterio debe ser precio o distancia.';
    }

    if (Number.isNaN(maxHops) || maxHops < 0) {
      return 'MaxHops debe ser un número mayor o igual a 0.';
    }

    return '';
  }

  function buildQuotePayload() {
    return {
      destinationId: form.destinationId,
      height: Number(form.height),
      width: Number(form.width),
      depth: Number(form.depth),
      criteria: form.criteria,
      maxHops: Number(form.maxHops),
    };
  }

  function buildShipmentPayload() {
    return {
      ...buildQuotePayload(),
      deliverNotBefore: formatDateTimeForApi(form.deliverNotBefore),
      metaContent: form.metaContent || undefined,
    };
  }

  async function handleQuote(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingQuote(true);
      setError('');
      setQuote(null);
      setShipment(null);

      const quoteData = await createQuote(buildQuotePayload());
      setQuote(quoteData);
    } catch (err) {
      setError(err?.message || 'No se pudo generar la cotización.');
    } finally {
      setLoadingQuote(false);
    }
  }

  async function handleCreateShipment() {
    if (!quote) return;

    try {
      setLoadingShipment(true);
      setError('');

      const shipmentData = await createShipment(buildShipmentPayload());
      setShipment(shipmentData);
    } catch (err) {
      setError(err?.message || 'No se pudo crear el envío.');
    } finally {
      setLoadingShipment(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setQuote(null);
    setShipment(null);
    setError('');
  }

  const quoteIsValid = quote?.reachable && quote?.maxHopsOk;

  async function handleStartPayment() {
    if (!shipment?.shipmentId) return;

    try {
      setLoadingPayment(true);
      setError('');

      const returnUrl = `${window.location.origin}/payment-return`;

      const paymentData = await startPayment({
        shipmentId: shipment.shipmentId,
        returnUrl,
      });

      redirectToWebpay(paymentData.url, paymentData.token);
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar el pago.');
    } finally {
      setLoadingPayment(false);
    }
  }

  return (
    <main>
      <h1>Crear envío</h1>
      <p className="page-subtitle">
        Completa los datos del paquete, revisa la cotización y luego crea el envío.
      </p>

      <form className="form-grid" onSubmit={handleQuote}>
        <div className="form-group">
          <label className="form-label" htmlFor="destinationId">
            Ciudad destino
          </label>
          <select
            id="destinationId"
            name="destinationId"
            className="form-select"
            value={form.destinationId}
            onChange={handleChange}
            disabled={loadingRoutes}
          >
            <option value="">
              {loadingRoutes ? 'Cargando ciudades...' : 'Selecciona una ciudad'}
            </option>

            {routes.map((city) => {
              const code = getCityCode(city);
              const name = getCityName(city);
              const enabled = city.enabled !== false;

              if (!code) return null;

              return (
                <option key={code} value={code} disabled={!enabled}>
                  {code} - {name} {!enabled ? '(no disponible)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="criteria">
            Criterio de ruteo
          </label>
          <select
            id="criteria"
            name="criteria"
            className="form-select"
            value={form.criteria}
            onChange={handleChange}
          >
            <option value="price">Precio más bajo</option>
            <option value="distance">Distancia más corta</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="height">
            Alto en cm
          </label>
          <input
            id="height"
            name="height"
            className="form-input"
            type="number"
            min="1"
            value={form.height}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="width">
            Ancho en cm
          </label>
          <input
            id="width"
            name="width"
            className="form-input"
            type="number"
            min="1"
            value={form.width}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="depth">
            Profundidad en cm
          </label>
          <input
            id="depth"
            name="depth"
            className="form-input"
            type="number"
            min="1"
            value={form.depth}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="maxHops">
            MaxHops
          </label>
          <input
            id="maxHops"
            name="maxHops"
            className="form-input"
            type="number"
            min="0"
            value={form.maxHops}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="deliverNotBefore">
            Entregar no antes de
          </label>
          <input
            id="deliverNotBefore"
            name="deliverNotBefore"
            className="form-input"
            type="datetime-local"
            value={form.deliverNotBefore}
            onChange={handleChange}
          />
        </div>

        <div className="form-group form-group-full">
          <label className="form-label" htmlFor="metaContent">
            MetaContent
          </label>
          <textarea
            id="metaContent"
            name="metaContent"
            className="form-textarea"
            value={form.metaContent}
            onChange={handleChange}
            placeholder="Ej: frágil, no doblar, entregar con cuidado"
          />
        </div>

        <div className="form-group form-group-full">
          <p className="helper-text">
            La suma de alto, ancho y profundidad no puede superar 3000 cm.
          </p>
        </div>

        <div className="form-group form-group-full">
          <div className="button-row">
            <button className="btn-primary" type="submit" disabled={loadingQuote}>
              {loadingQuote ? 'Cotizando...' : 'Cotizar envío'}
            </button>

            <button className="btn-danger" type="button" onClick={handleReset}>
              Cancelar
            </button>
          </div>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {quote && (
        <section className="quote-card">
          <h2>Cotización</h2>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Destino</span>
              <span className="summary-value">{quote.destinationId}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Criterio</span>
              <span className="summary-value">
                {quote.criteria === 'price' ? 'Precio' : 'Distancia'}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Costo de ruta</span>
              <span className="summary-value">{quote.routeMetricCost}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Saltos</span>
              <span className="summary-value">{quote.hops}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Siguiente salto</span>
              <span className="summary-value">{quote.nextHop || 'No disponible'}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Factor de precio</span>
              <span className="summary-value">{quote.fPrice}</span>
            </div>

            <div className="summary-item form-group-full">
              <span className="summary-label">Ruta</span>
              <span className="summary-value">
                {quote.path?.length ? quote.path.join(' → ') : 'No disponible'}
              </span>
            </div>

            <div className="summary-item form-group-full">
              <span className="summary-label">Total a pagar</span>
              <span className="summary-value">{formatCurrency(quote.amount)}</span>
            </div>
          </div>

          {!quote.reachable && (
            <p className="error-message">No hay ruta disponible hacia esta ciudad.</p>
          )}

          {quote.reachable && !quote.maxHopsOk && (
            <p className="error-message">El MaxHops seleccionado no alcanza para esta ruta.</p>
          )}

          {quoteIsValid && !shipment && (
            <div className="button-row">
              <button
                className="btn-success"
                type="button"
                onClick={handleCreateShipment}
                disabled={loadingShipment}
              >
                {loadingShipment ? 'Creando envío...' : 'Crear envío'}
              </button>

              <button className="btn-danger" type="button" onClick={handleReset}>
                Cancelar
              </button>
            </div>
          )}
        </section>
      )}

      {shipment && (
        <section className="shipment-created-card">
          <h2>Envío creado</h2>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">ID envío</span>
              <span className="summary-value">{shipment.shipmentId}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">ID paquete</span>
              <span className="summary-value">{shipment.packageId}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Monto</span>
              <span className="summary-value">{formatCurrency(shipment.amount)}</span>
            </div>
          </div>

          <p className="success-message">
            El envío fue creado correctamente. El siguiente paso será iniciar el pago.
          </p>

          <div className="button-row">
            <button
              className="btn-primary"
              type="button"
              onClick={handleStartPayment}
              disabled={loadingPayment}
            >
              {loadingPayment ? 'Iniciando pago...' : 'Pagar con Webpay'}
            </button>
          </div>

          <p className="helper-text">Serás redirigido a Webpay para completar el pago.</p>
        </section>
      )}
    </main>
  );
}
