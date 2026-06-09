import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentReturnPage from './PaymentReturnPage';
import { commitPayment } from '../services/api/paymentService';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      email: 'test@test.com',
    },
  }),
}));

vi.mock('../services/api/paymentService', () => ({
  commitPayment: vi.fn(),
}));

function renderPage(path = '/payment-return') {
  window.history.pushState({}, '', path);

  return render(
    <MemoryRouter>
      <PaymentReturnPage />
    </MemoryRouter>,
  );
}

describe('PaymentReturnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('confirma pago cuando llega token_ws', async () => {
    commitPayment.mockResolvedValue({
      status: 'SUCCESS',
      reason: null,
      message: 'Transacción aceptada.',
      paymentId: 'payment-1',
      shipmentId: 'shipment-1',
      amount: 15000,
      currency: 'CLP',
      authorizationCode: '1213',
      transactionDate: '2026-05-20T12:03:00Z',
    });

    renderPage('/payment-return?token_ws=abc123');

    expect(screen.getByText(/confirmando el resultado/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(commitPayment).toHaveBeenCalledWith({ token_ws: 'abc123' });
    });

    expect(await screen.findByRole('heading', { name: /pago exitoso/i })).toBeInTheDocument();
    expect(screen.getByText(/transacción aceptada/i)).toBeInTheDocument();
    expect(screen.getByText(/enviado al siguiente salto/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /ver detalle del envío/i })).toHaveAttribute(
      'href',
      '/shipments/shipment-1',
    );
  });

  it('confirma anulación cuando llega TBK_TOKEN', async () => {
    commitPayment.mockResolvedValue({
      status: 'FAILED',
      reason: 'ABORTED',
      message: 'Transacción anulada por el usuario.',
      paymentId: 'payment-1',
      shipmentId: 'shipment-1',
      amount: 15000,
      currency: 'CLP',
      authorizationCode: null,
      transactionDate: null,
    });

    renderPage('/payment-return?TBK_TOKEN=cancel-token');

    await waitFor(() => {
      expect(commitPayment).toHaveBeenCalledWith({ TBK_TOKEN: 'cancel-token' });
    });

    expect(await screen.findByRole('heading', { name: /pago anulado/i })).toBeInTheDocument();
    expect(screen.getByText(/transacción anulada por el usuario/i)).toBeInTheDocument();
  });

  it('muestra compra incompleta si no llega token_ws ni TBK_TOKEN', async () => {
    renderPage('/payment-return?TBK_ID_SESION=1&TBK_ORDEN_COMPRA=2');

    expect(await screen.findByRole('heading', { name: /pago no completado/i })).toBeInTheDocument();
    expect(screen.getByText(/no se recibió token de confirmación/i)).toBeInTheDocument();

    expect(commitPayment).not.toHaveBeenCalled();
  });

  it('muestra pago rechazado cuando reason es REJECTED', async () => {
    commitPayment.mockResolvedValue({
      status: 'FAILED',
      reason: 'REJECTED',
      message: 'Transacción rechazada.',
      paymentId: 'payment-1',
      shipmentId: 'shipment-1',
      amount: 15000,
      currency: 'CLP',
      authorizationCode: null,
      transactionDate: null,
    });

    renderPage('/payment-return?token_ws=rejected-token');

    expect(await screen.findByRole('heading', { name: /pago rechazado/i })).toBeInTheDocument();
    expect(screen.getByText(/transacción rechazada/i)).toBeInTheDocument();
  });

  it('muestra error si commitPayment falla', async () => {
    commitPayment.mockRejectedValue(new Error('Error al confirmar'));

    renderPage('/payment-return?token_ws=abc123');

    expect(
      await screen.findByRole('heading', { name: /error al confirmar pago/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/^Error al confirmar$/i)).toBeInTheDocument();
  });
});
