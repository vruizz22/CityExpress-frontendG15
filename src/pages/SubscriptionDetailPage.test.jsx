import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscriptionDetailPage from './SubscriptionDetailPage';

const mockNavigate = vi.fn();

let mockParams = {
  subscriptionId: 'sub-1',
};

let mockAuth0State = {
  isAuthenticated: true,
  isLoading: false,
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuth0State,
}));

vi.mock('../services/api/subscriptionService', () => ({
  getSubscriptionById: vi.fn(),
}));

import { getSubscriptionById } from '../services/api/subscriptionService';

describe('SubscriptionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockParams = {
      subscriptionId: 'sub-1',
    };

    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
    };

    getSubscriptionById.mockResolvedValue({
      id: 'sub-1',
      destinationId: 'COR',
      criteria: 'distance',
      priorityClass: 'high',
      insured: true,
      status: 'active',
      pricePerShipment: 2000,
      budget: 10000,
      budgetRemaining: 8000,
      sentCount: 1,
      remaining: 4,
      periodSeconds: 3600,
      shipments: [
        {
          tickNumber: 1,
          packageId: 'pkg-1',
          cost: 2000,
          status: 'created',
          reason: 'subscription_tick',
          createdAt: '2026-07-01T12:00:00.000Z',
        },
      ],
      ledger: [
        {
          delta: -2000,
          balanceAfter: 8000,
          reason: 'shipment_created',
          refId: 'pkg-1',
          createdAt: '2026-07-01T12:00:00.000Z',
        },
      ],
    });
  });

  it('muestra estado de carga cuando Auth0 está cargando', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: true,
    };

    render(<SubscriptionDetailPage />);

    expect(screen.getByRole('heading', { name: /detalle de suscripción/i })).toBeInTheDocument();
    expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
  });

  it('muestra error si el usuario no está autenticado', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: false,
    };

    render(<SubscriptionDetailPage />);

    expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument();
  });

  it('carga y muestra el detalle de la suscripción', async () => {
    render(<SubscriptionDetailPage />);

    await waitFor(() => {
      expect(getSubscriptionById).toHaveBeenCalledWith('sub-1');
    });

    expect(await screen.findByText('sub-1')).toBeInTheDocument();
    expect(screen.getByText('COR')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText(/3600 segundos/i)).toBeInTheDocument();
  });

  it('muestra paquetes generados y movimientos del ledger', async () => {
    render(<SubscriptionDetailPage />);

    const packageReferences = await screen.findAllByText('pkg-1');

    expect(packageReferences).toHaveLength(2);
    expect(screen.getByText('created')).toBeInTheDocument();
    expect(screen.getByText('subscription_tick')).toBeInTheDocument();
    expect(screen.getByText('shipment_created')).toBeInTheDocument();
  });

  it('muestra estados vacíos si no hay shipments ni ledger', async () => {
    getSubscriptionById.mockResolvedValueOnce({
      id: 'sub-1',
      destinationId: 'COR',
      criteria: 'distance',
      priorityClass: 'medium',
      insured: false,
      status: 'active',
      pricePerShipment: 1000,
      budget: 10000,
      budgetRemaining: 10000,
      sentCount: 0,
      remaining: 5,
      periodSeconds: 3600,
      shipments: [],
      ledger: [],
    });

    render(<SubscriptionDetailPage />);

    expect(await screen.findByText(/aún no hay paquetes generados/i)).toBeInTheDocument();
    expect(screen.getByText(/aún no hay movimientos registrados/i)).toBeInTheDocument();
  });

  it('permite volver a mis suscripciones', async () => {
    const user = userEvent.setup();

    render(<SubscriptionDetailPage />);

    await user.click(screen.getByRole('button', { name: /volver a mis suscripciones/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions');
  });

  it('permite navegar a crear otra suscripción', async () => {
    const user = userEvent.setup();

    render(<SubscriptionDetailPage />);

    await user.click(screen.getByRole('button', { name: /crear otra suscripción/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/new');
  });
});
