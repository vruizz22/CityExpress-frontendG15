import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

test('renders welcome heading', () => {
  renderLanding();
  expect(screen.getByText(/bienvenido a cityexpress/i)).toBeInTheDocument();
});

test('navigates to /routes on click', () => {
  renderLanding();
  fireEvent.click(screen.getByRole('button', { name: /ver rutas/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/routes');
});

test('navigates to /packages on click', () => {
  renderLanding();
  fireEvent.click(screen.getByRole('button', { name: /ver paquetes/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/packages');
});
