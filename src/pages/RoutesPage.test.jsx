import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import RoutesPage from './RoutesPage';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

vi.mock('../services/api/routesApi', () => ({
  getRoutes: vi.fn(),
}));

vi.mock('../components/RoutesTable', () => ({
  default: ({ routes }) => (
    <div>
      {routes.map((r) => (
        <span key={r.code}>{r.code}</span>
      ))}
    </div>
  ),
}));

import { getRoutes } from '../services/api/routesApi';

test('shows loading session while auth is loading', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, isLoading: true });
  render(<RoutesPage />);
  expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
});

test('shows login prompt when not authenticated', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, isLoading: false });
  render(<RoutesPage />);
  expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
});

test('shows routes after loading', async () => {
  useAuth0.mockReturnValue({ isAuthenticated: true, isLoading: false });
  getRoutes.mockResolvedValue({ data: [{ code: 'RNC', name: 'Rancagua', enabled: true }] });

  render(<RoutesPage />);

  await waitFor(() => {
    expect(screen.getByText('RNC')).toBeInTheDocument();
  });
});

test('shows empty message when no routes', async () => {
  useAuth0.mockReturnValue({ isAuthenticated: true, isLoading: false });
  getRoutes.mockResolvedValue({ data: [] });

  render(<RoutesPage />);

  await waitFor(() => {
    expect(screen.getByText(/no hay rutas/i)).toBeInTheDocument();
  });
});

test('shows error message when fetch fails', async () => {
  useAuth0.mockReturnValue({ isAuthenticated: true, isLoading: false });
  getRoutes.mockRejectedValue(new Error('Network error'));

  render(<RoutesPage />);

  await waitFor(() => {
    expect(screen.getByText(/no se pudieron cargar las rutas/i)).toBeInTheDocument();
  });
});
