import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShipmentDetailPage from './ShipmentDetailPage';
import { getShipmentById } from '../services/api/shipmentService';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      email: 'test@test.com',
    },
  }),
}));

vi.mock('../services/api/shipmentService', () => ({
  getShipmentById: vi.fn(),
}));

function renderPage(path = '/shipments/shipment-1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/shipments/:shipmentId" element={<ShipmentDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ShipmentDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga y muestra detalle completo del envío', async () => {
    getShipmentById.mockResolvedValue({
      id: 'shipment-1',
      packageId: 'package-1',
      originId: 'HGW',
      destinationId: 'COR',
      criteria: 'price',
      amount: 15000,
      hops: 3,
      nextHop: 'RNC',
      routeMetricCost: 12000,
      routePath: ['HGW', 'RNC', 'COR'],
      status: 'sent',
      createdAt: '2026-06-07T12:00:00Z',
      payment: {
        id: 'payment-1',
        status: 'SUCCESS',
        amount: 15000,
        authorizationCode: '1213',
        transactionDate: '2026-05-20T12:03:00Z',
        reason: null,
      },
    });

    renderPage();

    expect(screen.getByText(/cargando detalle/i)).toBeInTheDocument();

    expect(await screen.findByText(/shipment-1/i)).toBeInTheDocument();
    expect(screen.getByText(/package-1/i)).toBeInTheDocument();

    expect(screen.getByText(/^HGW$/i)).toBeInTheDocument();
    expect(screen.getByText(/^COR$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Precio$/i)).toBeInTheDocument();

    expect(screen.getByText(/enviado al siguiente salto/i)).toBeInTheDocument();
    expect(screen.getByText(/HGW → RNC → COR/i)).toBeInTheDocument();

    expect(screen.getByText(/payment-1/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pagado$/i)).toBeInTheDocument();
    expect(screen.getByText(/1213/i)).toBeInTheDocument();

    expect(getShipmentById).toHaveBeenCalledWith('shipment-1');
  });

  it('muestra mensaje si el envío no tiene pago asociado', async () => {
    getShipmentById.mockResolvedValue({
      id: 'shipment-1',
      packageId: 'package-1',
      originId: 'HGW',
      destinationId: 'COR',
      criteria: 'distance',
      amount: 15000,
      hops: 1,
      nextHop: 'COR',
      routeMetricCost: 5000,
      routePath: ['HGW', 'COR'],
      status: 'pending-payment',
      createdAt: '2026-06-07T12:00:00Z',
      payment: null,
    });

    renderPage();

    expect(
      await screen.findByText(/este envío todavía no tiene un pago asociado/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/pendiente de pago/i)).toBeInTheDocument();
  });

  it('muestra error si falla la carga del detalle', async () => {
    getShipmentById.mockRejectedValue(new Error('No encontrado'));

    renderPage();

    expect(await screen.findByText(/no encontrado/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /volver al historial/i })).toHaveAttribute(
      'href',
      '/my-shipments',
    );
  });
});
