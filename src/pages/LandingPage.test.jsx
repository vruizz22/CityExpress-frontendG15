import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from './LandingPage';

const mockNavigate = vi.fn();

let mockAuth0State = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuth0State,
}));

vi.mock('../components/WorkerHeartbeat', () => ({
  default: () => <div data-testid="worker-heartbeat">WorkerHeartbeat</div>,
}));

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuth0State = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };
  });

  it('muestra estado de carga cuando Auth0 está cargando', () => {
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
    };

    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /bienvenido a cityexpress/i })).toBeInTheDocument();
    expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
  });

  it('muestra landing para usuario no autenticado', async () => {
    const user = userEvent.setup();

    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /bienvenido a cityexpress/i })).toBeInTheDocument();
    expect(screen.getByText(/inicia sesión para crear envíos/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /crear envío/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /mis envíos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /todos los envíos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crear suscripción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mis suscripciones/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver rutas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver paquetes/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('worker-heartbeat')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /crear envío/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/create-shipment');
  });

  it('muestra opciones de usuario normal autenticado', async () => {
    const user = userEvent.setup();

    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'user@test.com',
      },
    };

    render(<LandingPage />);

    expect(
      screen.getByText(/crea envíos, programa suscripciones y consulta el estado/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /crear envío/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mis envíos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear suscripción/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mis suscripciones/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /todos los envíos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver rutas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver paquetes/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('worker-heartbeat')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /crear envío/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/create-shipment');

    await user.click(screen.getByRole('button', { name: /mis envíos/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/my-shipments');

    await user.click(screen.getByRole('button', { name: /crear suscripción/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/new');

    await user.click(screen.getByRole('button', { name: /mis suscripciones/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions');
  });

  it('muestra opciones admin cuando el usuario tiene rol admin', async () => {
    const user = userEvent.setup();

    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'admin@test.com',
        'https://cityexpress/roles': ['admin'],
      },
    };

    render(<LandingPage />);

    expect(screen.getByText(/administra paquetes, rutas, workers/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /crear envío/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /todos los envíos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear suscripción/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mis suscripciones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver rutas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver paquetes/i })).toBeInTheDocument();
    expect(screen.getByTestId('worker-heartbeat')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /^mis envíos$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /crear envío/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/create-shipment');

    await user.click(screen.getByRole('button', { name: /todos los envíos/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/my-shipments');

    await user.click(screen.getByRole('button', { name: /crear suscripción/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/new');

    await user.click(screen.getByRole('button', { name: /mis suscripciones/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/subscriptions');

    await user.click(screen.getByRole('button', { name: /ver rutas/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/routes');

    await user.click(screen.getByRole('button', { name: /ver paquetes/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/packages');
  });

  it('no muestra opciones admin si el claim de roles no contiene admin', () => {
    mockAuth0State = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'user@test.com',
        'https://cityexpress/roles': ['user'],
      },
    };

    render(<LandingPage />);

    expect(screen.getByRole('button', { name: /crear envío/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mis envíos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear suscripción/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mis suscripciones/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /todos los envíos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver rutas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver paquetes/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('worker-heartbeat')).not.toBeInTheDocument();
  });
});
