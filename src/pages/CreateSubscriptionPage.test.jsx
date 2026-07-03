import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateSubscriptionPage from './CreateSubscriptionPage';

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

vi.mock('../services/api/shipmentService', () => ({
  getRoutes: vi.fn(),
}));

vi.mock('../services/api/subscriptionService', () => ({
  createSubscription: vi.fn(),
}));

import { getRoutes } from '../services/api/shipmentService';
import { createSubscription } from '../services/api/subscriptionService';

describe('CreateSubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
    };

    getRoutes.mockResolvedValue([
      {
        code: 'COR',
        name: 'Córdoba',
        enabled: true,
      },
      {
        code: 'ROS',
        name: 'Rosario',
        enabled: true,
      },
    ]);

    createSubscription.mockResolvedValue({
      id: 'sub-1',
      destinationId: 'COR',
      status: 'active',
      pricePerShipment: 1500,
      budgetRemaining: 8500,
      sentCount: 0,
      remaining: 5,
    });
  });

  it('muestra estado de carga cuando Auth0 está cargando', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: true,
    };

    render(<CreateSubscriptionPage />);

    expect(screen.getByRole('heading', { name: /crear suscripción/i })).toBeInTheDocument();
    expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
  });

  it('muestra error si el usuario no está autenticado', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: false,
    };

    render(<CreateSubscriptionPage />);

    expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument();
  });

  it('carga ciudades y renderiza el formulario de suscripción', async () => {
    render(<CreateSubscriptionPage />);

    expect(await screen.findByRole('option', { name: /COR - Córdoba/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/ciudad destino/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/criterio de ruteo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alto en cm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ancho en cm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profundidad en cm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maxhops/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/periodicidad en segundos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad de envíos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget prepago/i)).toBeInTheDocument();
    expect(screen.getByText(/contratar seguro/i)).toBeInTheDocument();
  });

  it('valida campos requeridos antes de crear la suscripción', async () => {
    const user = userEvent.setup();

    render(<CreateSubscriptionPage />);

    await user.click(screen.getByRole('button', { name: /^crear suscripción$/i }));

    expect(screen.getByText(/debes seleccionar una ciudad destino/i)).toBeInTheDocument();
    expect(createSubscription).not.toHaveBeenCalled();
  });

  it('muestra prima de seguro cuando el seguro está activo', async () => {
    const user = userEvent.setup();

    render(<CreateSubscriptionPage />);

    await user.click(screen.getByLabelText(/contratar seguro/i));

    expect(screen.getByText(/prima del 5%/i)).toBeInTheDocument();
  });

  it('crea una suscripción con payload válido', async () => {
    const user = userEvent.setup();

    render(<CreateSubscriptionPage />);

    await screen.findByRole('option', { name: /COR - Córdoba/i });

    await user.selectOptions(screen.getByLabelText(/ciudad destino/i), 'COR');
    await user.clear(screen.getByLabelText(/alto en cm/i));
    await user.type(screen.getByLabelText(/alto en cm/i), '10');

    await user.clear(screen.getByLabelText(/ancho en cm/i));
    await user.type(screen.getByLabelText(/ancho en cm/i), '20');

    await user.clear(screen.getByLabelText(/profundidad en cm/i));
    await user.type(screen.getByLabelText(/profundidad en cm/i), '30');

    await user.clear(screen.getByLabelText(/maxhops/i));
    await user.type(screen.getByLabelText(/maxhops/i), '5');

    await user.selectOptions(screen.getByLabelText(/prioridad/i), 'high');

    await user.clear(screen.getByLabelText(/periodicidad en segundos/i));
    await user.type(screen.getByLabelText(/periodicidad en segundos/i), '3600');

    await user.clear(screen.getByLabelText(/cantidad de envíos/i));
    await user.type(screen.getByLabelText(/cantidad de envíos/i), '5');

    await user.clear(screen.getByLabelText(/budget prepago/i));
    await user.type(screen.getByLabelText(/budget prepago/i), '10000');

    await user.click(screen.getByLabelText(/contratar seguro/i));
    await user.type(screen.getByLabelText(/metacontent/i), 'frágil');

    await user.click(screen.getByRole('button', { name: /^crear suscripción$/i }));

    await waitFor(() => {
      expect(createSubscription).toHaveBeenCalledWith({
        destinationId: 'COR',
        height: 10,
        width: 20,
        depth: 30,
        criteria: 'distance',
        maxHops: 5,
        priorityClass: 'high',
        insured: true,
        metaContent: 'frágil',
        periodSeconds: 3600,
        amount: 5,
        budget: 10000,
      });
    });

    expect(await screen.findByText(/suscripción creada/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('permite navegar a mis suscripciones', async () => {
    const user = userEvent.setup();

    render(<CreateSubscriptionPage />);

    await user.click(screen.getByRole('button', { name: /ver mis suscripciones/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions');
  });
});
