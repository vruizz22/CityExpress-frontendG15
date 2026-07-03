import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getRoutes } from '../services/api/shipmentService';
import { createSubscription } from '../services/api/subscriptionService';
import { formatCurrency } from '../utils/formatters';

const INITIAL_FORM = {
  destinationId: '',
  height: '',
  width: '',
  depth: '',
  criteria: 'distance',
  maxHops: '5',
  priorityClass: 'medium',
  insured: false,
  metaContent: '',
  periodSeconds: '3600',
  amount: '5',
  budget: '',
};

const PRIORITY_FACTORS = {
  low: '0.5',
  medium: '1',
  high: '2.5',
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

function getErrorMessage(error, fallbackMessage) {
  if (error?.issues?.length) {
    return `${error.message || fallbackMessage}: ${error.issues.join(', ')}`;
  }

  return error?.message || fallbackMessage;
}

export default function CreateSubscriptionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [createdSubscription, setCreatedSubscription] = useState(null);

  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

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
  }, [isLoading, isAuthenticated]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setCreatedSubscription(null);
    setError('');
  }

  function validateForm() {
    const height = Number(form.height);
    const width = Number(form.width);
    const depth = Number(form.depth);
    const maxHops = Number(form.maxHops);
    const periodSeconds = Number(form.periodSeconds);
    const amount = Number(form.amount);
    const budget = Number(form.budget);

    if (!form.destinationId) {
      return 'Debes seleccionar una ciudad destino.';
    }

    if (!Number.isInteger(height) || height <= 0) {
      return 'El alto debe ser un entero mayor a 0.';
    }

    if (!Number.isInteger(width) || width <= 0) {
      return 'El ancho debe ser un entero mayor a 0.';
    }

    if (!Number.isInteger(depth) || depth <= 0) {
      return 'La profundidad debe ser un entero mayor a 0.';
    }

    if (height + width + depth > 3000) {
      return 'La suma de alto, ancho y profundidad no puede superar 3000 cm.';
    }

    if (!['distance', 'price'].includes(form.criteria)) {
      return 'El criterio debe ser distancia o precio.';
    }

    if (!Number.isInteger(maxHops) || maxHops < 0) {
      return 'MaxHops debe ser un entero mayor o igual a 0.';
    }

    if (!['low', 'medium', 'high'].includes(form.priorityClass)) {
      return 'La prioridad debe ser baja, media o alta.';
    }

    if (!Number.isInteger(periodSeconds) || periodSeconds < 60 || periodSeconds > 172800) {
      return 'La periodicidad debe estar entre 60 segundos y 172800 segundos.';
    }

    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      return 'La cantidad debe estar entre 1 y 100 envíos.';
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      return 'El budget debe ser mayor a 0.';
    }

    return '';
  }

  function buildPayload() {
    return {
      destinationId: form.destinationId,
      height: Number(form.height),
      width: Number(form.width),
      depth: Number(form.depth),
      criteria: form.criteria,
      maxHops: Number(form.maxHops),
      priorityClass: form.priorityClass,
      insured: form.insured,
      metaContent: form.metaContent.trim() || null,
      periodSeconds: Number(form.periodSeconds),
      amount: Number(form.amount),
      budget: Number(form.budget),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingCreate(true);
      setError('');
      setCreatedSubscription(null);

      const subscriptionData = await createSubscription(buildPayload());
      setCreatedSubscription(subscriptionData);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear la suscripción.'));
    } finally {
      setLoadingCreate(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setCreatedSubscription(null);
    setError('');
  }

  const selectedPriorityFactor = PRIORITY_FACTORS[form.priorityClass];

  if (isLoading) {
    return (
      <main>
        <h1>Crear suscripción</h1>
        <p className="loading-box">Cargando sesión...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Crear suscripción</h1>
        <p className="error-message">Debes iniciar sesión para crear una suscripción.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Crear suscripción</h1>
      <p className="page-subtitle">
        Programa envíos periódicos indicando paquete, prioridad, seguro, frecuencia, cantidad y
        budget prepago.
      </p>

      <form className="form-grid" onSubmit={handleSubmit}>
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
            <option value="distance">Distancia más corta</option>
            <option value="price">Precio más bajo</option>
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
            step="1"
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
            step="1"
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
            step="1"
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
            step="1"
            value={form.maxHops}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="priorityClass">
            Prioridad
          </label>
          <select
            id="priorityClass"
            name="priorityClass"
            className="form-select"
            value={form.priorityClass}
            onChange={handleChange}
          >
            <option value="low">Baja — factor 0.5</option>
            <option value="medium">Media — factor 1</option>
            <option value="high">Alta — factor 2.5</option>
          </select>
          <p className="helper-text">Factor de precio seleccionado: {selectedPriorityFactor}</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="periodSeconds">
            Periodicidad en segundos
          </label>
          <input
            id="periodSeconds"
            name="periodSeconds"
            className="form-input"
            type="number"
            min="60"
            max="172800"
            step="1"
            value={form.periodSeconds}
            onChange={handleChange}
          />
          <p className="helper-text">Mínimo 60 segundos. Máximo 172800 segundos.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="amount">
            Cantidad de envíos
          </label>
          <input
            id="amount"
            name="amount"
            className="form-input"
            type="number"
            min="1"
            max="100"
            step="1"
            value={form.amount}
            onChange={handleChange}
          />
          <p className="helper-text">Máximo 100 envíos.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="budget">
            Budget prepago
          </label>
          <input
            id="budget"
            name="budget"
            className="form-input"
            type="number"
            min="1"
            step="1"
            value={form.budget}
            onChange={handleChange}
          />
        </div>

        <div className="form-group form-group-full">
          <label className="form-label" htmlFor="insured">
            Seguro del paquete
          </label>

          <label className="helper-text">
            <input
              id="insured"
              name="insured"
              type="checkbox"
              checked={form.insured}
              onChange={handleChange}
            />{' '}
            Contratar seguro para los paquetes de esta suscripción.
          </label>

          {form.insured && (
            <p className="helper-text">
              El seguro agrega una prima del 5% al costo de cada paquete.
            </p>
          )}
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
            placeholder="Ej: frágil, entregar con cuidado, no doblar"
          />
        </div>

        <div className="form-group form-group-full">
          <section className="section-card">
            <h2>Resumen</h2>

            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Prioridad</span>
                <span className="summary-value">{form.priorityClass}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Factor prioridad</span>
                <span className="summary-value">{selectedPriorityFactor}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Seguro</span>
                <span className="summary-value">{form.insured ? 'Sí, prima 5%' : 'No'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Cantidad</span>
                <span className="summary-value">{form.amount || 'No definida'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Periodicidad</span>
                <span className="summary-value">
                  {form.periodSeconds ? `${form.periodSeconds} segundos` : 'No definida'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Budget</span>
                <span className="summary-value">
                  {form.budget ? formatCurrency(Number(form.budget)) : 'No definido'}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="form-group form-group-full">
          <div className="button-row">
            <button className="btn-primary" type="submit" disabled={loadingCreate}>
              {loadingCreate ? 'Creando suscripción...' : 'Crear suscripción'}
            </button>

            <button className="btn-danger" type="button" onClick={handleReset}>
              Cancelar
            </button>

            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate('/subscriptions')}
            >
              Ver mis suscripciones
            </button>
          </div>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {createdSubscription && (
        <section className="shipment-created-card">
          <h2>Suscripción creada</h2>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">ID</span>
              <span className="summary-value">
                {createdSubscription.id || createdSubscription.subscriptionId}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Estado</span>
              <span className="summary-value">{createdSubscription.status}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Precio por envío</span>
              <span className="summary-value">
                {formatCurrency(createdSubscription.pricePerShipment)}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Budget restante</span>
              <span className="summary-value">
                {formatCurrency(createdSubscription.budgetRemaining)}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Enviados</span>
              <span className="summary-value">{createdSubscription.sentCount}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Restantes</span>
              <span className="summary-value">{createdSubscription.remaining}</span>
            </div>
          </div>

          <p className="success-message">
            La suscripción fue creada correctamente. Los envíos se poblarán cuando el motor de
            ejecución esté conectado.
          </p>

          <div className="button-row">
            <button
              className="btn-primary"
              type="button"
              onClick={() =>
                navigate(
                  `/subscriptions/${createdSubscription.id || createdSubscription.subscriptionId}`,
                )
              }
            >
              Ver detalle
            </button>

            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate('/subscriptions')}
            >
              Ver todas
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
