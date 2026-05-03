import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

test('calls logout when clicked', () => {
  const logout = vi.fn();

  useAuth0.mockReturnValue({ logout });

  render(<LogoutButton />);

  fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

  expect(logout).toHaveBeenCalledWith({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
});
