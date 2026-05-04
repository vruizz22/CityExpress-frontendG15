import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from './NavBar';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

vi.mock('./LoginButton', () => ({
  default: () => <button>Iniciar sesión</button>,
}));

vi.mock('./LogoutButton', () => ({
  default: () => <button>Cerrar sesión</button>,
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

test('renders brand name', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
  renderNavbar();
  expect(screen.getByText('CityExpress')).toBeInTheDocument();
});

test('shows loading state', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });
  renderNavbar();
  expect(screen.getByText('Cargando sesión...')).toBeInTheDocument();
});

test('shows login button when not authenticated', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
  renderNavbar();
  expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
});

test('shows user email and logout button when authenticated', () => {
  useAuth0.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { email: 'test@example.com' },
  });
  renderNavbar();
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
});
