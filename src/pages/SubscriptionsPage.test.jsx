import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscriptionsPage from './SubscriptionsPage';

const mockNavigate = vi.fn();

let mockAuth0State = {
  isAuthenticated: true,
  isLoading: false,
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuth0State,
}));

vi.mock('../services/api/subscriptionService', () => ({
  getSubscriptions: vi.fn(),
}));

import { getSubscriptions } from '../services/api/subscriptionService';

describe('SubscriptionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
    };

    getSubscriptions.mockResolvedValue({
      data: [
        {
          id: 'sub-1',
          destinationId: 'COR',
          status: 'active',
          sentCount: 0,
          remaining: 5,
          budgetRemaining: 10000,
          pricePerShipment: 1500,
          priorityClass: 'medium',
          insured: true,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      },
    });
  });

  it('muestra estado de carga cuando Auth0 está cargando', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: true,
    };

    render(<SubscriptionsPage />);

    expect(screen.getByRole('heading', { name: /mis suscripciones/i })).toBeInTheDocument();
    expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
  });

  it('muestra error si el usuario no está autenticado', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: false,
    };

    render(<SubscriptionsPage />);

    expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument();
  });

  it('lista las suscripciones del usuario', async () => {
    render(<SubscriptionsPage />);

    await waitFor(() => {
      expect(getSubscriptions).toHaveBeenCalledWith(1, 25);
    });

    expect(await screen.findByText('sub-1')).toBeInTheDocument();
    expect(screen.getByText('COR')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();
  });

  it('permite navegar a crear suscripción', async () => {
    const user = userEvent.setup();

    render(<SubscriptionsPage />);

    await user.click(screen.getByRole('button', { name: /crear suscripción/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/new');
  });

  it('permite navegar al detalle de una suscripción', async () => {
    const user = userEvent.setup();

    render(<SubscriptionsPage />);

    const detailButton = await screen.findByRole('button', { name: /ver detalle/i });

    await user.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/sub-1');
  });

  it('muestra estado vacío cuando no hay suscripciones', async () => {
    getSubscriptions.mockResolvedValueOnce({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 1,
      },
    });

    render(<SubscriptionsPage />);

    expect(await screen.findByText(/aún no tienes suscripciones/i)).toBeInTheDocument();
    expect(screen.getByText(/crea una suscripción para programar/i)).toBeInTheDocument();
  });
});
