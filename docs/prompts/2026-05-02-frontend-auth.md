# Session: 2026-05-02 — E1 frontend-auth

Se utilizó el modelo a través de chat para poder orientar el trabajo, muchas de las sugerencias fueron adaptadas o no consideradas en el proyecto. Se utilizó para la elaboaración de tests al implementar Auth0. Los archivos mencionados en cada promts fueron adjuntados al momento de realizar la consulta. Se continuó a partir de la sesion 2026-05-02-frontend-api-services para evitar tener que cargar la información nuevamente.

## Participantes

- Usuario: OrianaCrescio
- Modelo: OpenAI GPT5.3

## Promt

> Implementé el uso de Auth0 para autenticación de usuarios. Puedes darme tests adicionales para estos archivos (LoginButton.jsx LogoutButton.jsx).

### Respuesta

Sí, agrega tests básicos para Auth0.

Crea:

```txt
src/components/LoginButton.test.jsx
```

```jsx
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
```

Crea:

```txt
src/components/LogoutButton.test.jsx
```

```jsx
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
```

Luego corre:

```bash
pnpm test:coverage
```
