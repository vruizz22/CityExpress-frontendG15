import { render, screen } from '@testing-library/react';
import RoutesTable from './RoutesTable';

const routes = [
  { code: 'RNC', name: 'Rancagua', enabled: true },
  { code: 'COR', name: 'Coruscant', enabled: false },
];

test('renders route data', () => {
  render(<RoutesTable routes={routes} />);

  expect(screen.getByText('RNC')).toBeInTheDocument();
  expect(screen.getByText('Rancagua')).toBeInTheDocument();
  expect(screen.getByText('COR')).toBeInTheDocument();
  expect(screen.getByText('Coruscant')).toBeInTheDocument();
});

test('shows enabled and disabled route statuses', () => {
  render(<RoutesTable routes={routes} />);

  expect(screen.getByText('Habilitada')).toBeInTheDocument();
  expect(screen.getByText('Deshabilitada')).toBeInTheDocument();
});
