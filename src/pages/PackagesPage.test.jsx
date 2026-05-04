import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import PackagesPage from './PackagesPage';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

vi.mock('../services/api/packagesApi', () => ({
  getPackages: vi.fn(),
  deliverPackage: vi.fn(),
}));

vi.mock('../components/PackageTable', () => ({
  default: ({ packages, onDeliver }) => (
    <div>
      {packages.map((pk) => (
        <div key={pk.id}>
          <span>{pk.id}</span>
          {pk.canDeliver && <button onClick={() => onDeliver(pk.id)}>Entregar</button>}
        </div>
      ))}
    </div>
  ),
}));

import { getPackages, deliverPackage } from '../services/api/packagesApi';

const authLoading = { isAuthenticated: false, isLoading: true };
const authUnauthenticated = { isAuthenticated: false, isLoading: false };
const authAuthenticated = { isAuthenticated: true, isLoading: false };

test('shows loading session message while auth is loading', () => {
  useAuth0.mockReturnValue(authLoading);
  render(<PackagesPage />);
  expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument();
});

test('shows login prompt when not authenticated', () => {
  useAuth0.mockReturnValue(authUnauthenticated);
  render(<PackagesPage />);
  expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
});

test('shows packages after loading', async () => {
  useAuth0.mockReturnValue(authAuthenticated);
  getPackages.mockResolvedValue({
    data: [
      {
        id: 'pkg-1',
        originId: 'central',
        destinationId: 'TK3',
        maxHops: 3,
        createdAt: '',
        deliverNotBefore: '',
        lastAction: 'received',
        canDeliver: true,
      },
    ],
  });

  render(<PackagesPage />);

  await waitFor(() => {
    expect(screen.getByText('pkg-1')).toBeInTheDocument();
  });
});

test('shows empty message when no packages', async () => {
  useAuth0.mockReturnValue(authAuthenticated);
  getPackages.mockResolvedValue({ data: [] });

  render(<PackagesPage />);

  await waitFor(() => {
    expect(screen.getByText(/no hay paquetes/i)).toBeInTheDocument();
  });
});

test('shows error message when fetch fails', async () => {
  useAuth0.mockReturnValue(authAuthenticated);
  getPackages.mockRejectedValue(new Error('Network error'));

  render(<PackagesPage />);

  await waitFor(() => {
    expect(screen.getByText(/no se pudieron cargar los paquetes/i)).toBeInTheDocument();
  });
});

test('handles deliver package action', async () => {
  useAuth0.mockReturnValue(authAuthenticated);
  getPackages.mockResolvedValue({
    data: [
      {
        id: 'pkg-1',
        originId: 'central',
        destinationId: 'TK3',
        maxHops: 3,
        createdAt: '',
        deliverNotBefore: '',
        lastAction: 'received',
        canDeliver: true,
      },
    ],
  });
  deliverPackage.mockResolvedValue({});

  render(<PackagesPage />);

  await waitFor(() => screen.getByText('pkg-1'));

  fireEvent.click(screen.getByRole('button', { name: /entregar/i }));

  await waitFor(() => {
    expect(deliverPackage).toHaveBeenCalledWith('pkg-1');
  });
});

test('shows error when deliver fails', async () => {
  useAuth0.mockReturnValue(authAuthenticated);
  getPackages.mockResolvedValue({
    data: [
      {
        id: 'pkg-1',
        originId: 'central',
        destinationId: 'TK3',
        maxHops: 3,
        createdAt: '',
        deliverNotBefore: '',
        lastAction: 'received',
        canDeliver: true,
      },
    ],
  });
  deliverPackage.mockRejectedValue(new Error('fail'));

  render(<PackagesPage />);

  await waitFor(() => screen.getByText('pkg-1'));

  fireEvent.click(screen.getByRole('button', { name: /entregar/i }));

  await waitFor(() => {
    expect(screen.getByText(/no se pudo entregar/i)).toBeInTheDocument();
  });
});
