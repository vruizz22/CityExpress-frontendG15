import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

test('calls loginWithRedirect when clicked', () => {
  const loginWithRedirect = vi.fn();

  useAuth0.mockReturnValue({ loginWithRedirect });

  render(<LoginButton />);

  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  expect(loginWithRedirect).toHaveBeenCalled();
});
