import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import AppAuthProvider from './AuthProvider';

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => <div data-testid="auth0-provider">{children}</div>,
  useAuth0: vi.fn(),
}));

vi.mock('@/services/api/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

import { setTokenProvider } from '@/services/api/httpClient';

test('renders children inside Auth0Provider', () => {
  const getAccessTokenSilently = vi.fn();
  useAuth0.mockReturnValue({ getAccessTokenSilently });

  render(
    <AppAuthProvider>
      <span>child content</span>
    </AppAuthProvider>,
  );

  expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
  expect(screen.getByText('child content')).toBeInTheDocument();
});

test('calls setTokenProvider with getAccessTokenSilently on mount', () => {
  const getAccessTokenSilently = vi.fn();
  useAuth0.mockReturnValue({ getAccessTokenSilently });

  render(
    <AppAuthProvider>
      <span />
    </AppAuthProvider>,
  );

  expect(setTokenProvider).toHaveBeenCalledWith(getAccessTokenSilently);
});
