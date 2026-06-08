import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { commitPayment } from '../services/api/paymentService';
import { formatCurrency, formatDate } from '../utils/formatters';

function getResultTitle(result) {
  if (!result) return 'Procesando pago';

  if (result.status === 'SUCCESS') {
    return 'Pago exitoso';
  }

  if (result.reason === 'ABORTED') {
    return 'Pago anulado';
  }

  if (result.reason === 'REJECTED') {
    return 'Pago rechazado';
  }

  if (result.reason === 'ERROR') {
    return 'Error en el pago';
  }

  return 'Pago no completado';
}

function getResultBadgeClass(result) {
  if (result?.status === 'SUCCESS') return 'badge badge-success';
  return 'badge badge-danger';
}

export default function PaymentReturnPage() {
  const [result, setResult] = useState(null);
  const [manualMessage, setManualMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function handlePaymentReturn() {
      try {
        setLoading(true);
        setError('');
        setManualMessage('');

        const searchParams = new URLSearchParams(window.location.search);

        const tokenWs = searchParams.get('token_ws');
        const tbkToken = searchParams.get('TBK_TOKEN');

        if (tokenWs) {
          const response = await commitPayment({
            token_ws: tokenWs,
          });

          setResult(response);
          return;
        }

        if (tbkToken) {
          const response = await commitPayment({
            TBK_TOKEN: tbkToken,
          });

          setResult(response);
          return;
        }

        setManualMessage(
          'La compra fue anulada o quedó incompleta. No se recibió token de confirmación desde Webpay.',
        );
      } catch (err) {
        setError(err?.message || 'No se pudo confirmar el resultado del pago.');
      } finally {
        setLoading(false);
      }
    }

    handlePaymentReturn();
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Confirmando pago</h1>
        <p className="loading-box">Estamos confirmando el resultado con Webpay...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Error al confirmar pago</h1>
        <p className="error-message">{error}</p>

        <div className="button-row">
          <Link className="btn btn-secondary" to="/my-shipments">
            Ir a historial
          </Link>
          <Link className="btn btn-primary" to="/create-shipment">
            Crear nuevo envío
          </Link>
        </div>
      </main>
    );
  }

  if (manualMessage) {
    return (
      <main>
        <h1>Pago no completado</h1>

        <section className="payment-result-card">
          <span className="badge badge-warning">Incompleto</span>
          <p className="error-message">{manualMessage}</p>
        </section>

        <div className="button-row">
          <Link className="btn btn-secondary" to="/my-shipments">
            Ir a historial
          </Link>
          <Link className="btn btn-primary" to="/create-shipment">
            Crear nuevo envío
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>{getResultTitle(result)}</h1>

      <section className="payment-result-card">
        <span className={getResultBadgeClass(result)}>
          {result.status === 'SUCCESS' ? 'SUCCESS' : result.reason || 'FAILED'}
        </span>

        <p className={result.status === 'SUCCESS' ? 'success-message' : 'error-message'}>
          {result.message || 'Resultado recibido desde Webpay.'}
        </p>

        {result.status === 'SUCCESS' && (
          <p className="success-message">El envío fue marcado como enviado al siguiente salto.</p>
        )}

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">ID pago</span>
            <span className="summary-value">{result.paymentId || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">ID envío</span>
            <span className="summary-value">{result.shipmentId || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Monto</span>
            <span className="summary-value">{formatCurrency(result.amount)}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Moneda</span>
            <span className="summary-value">{result.currency || 'CLP'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Código autorización</span>
            <span className="summary-value">{result.authorizationCode || 'No disponible'}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Fecha transacción</span>
            <span className="summary-value">{formatDate(result.transactionDate)}</span>
          </div>
        </div>
      </section>

      <div className="button-row">
        <Link className="btn btn-secondary" to="/my-shipments">
          Ir a historial
        </Link>

        {result.shipmentId && (
          <Link className="btn btn-info" to={`/shipments/${result.shipmentId}`}>
            Ver detalle del envío
          </Link>
        )}

        <Link className="btn btn-primary" to="/create-shipment">
          Crear nuevo envío
        </Link>
      </div>
    </main>
  );
}
