import { render, screen, fireEvent } from '@testing-library/react';
import PackageTable from './PackageTable';

const packages = [
  {
    id: 'pkg-001',
    originId: 'central',
    destinationId: 'RNC',
    maxHops: 3,
    createdAt: '2026-03-01T12:00:00Z',
    deliverNotBefore: '2026-03-20T12:00:00Z',
    lastAction: 'received',
    canDeliver: true,
  },
  {
    id: 'pkg-002',
    originId: 'HGW',
    destinationId: 'COR',
    maxHops: 1,
    createdAt: '2026-03-05T12:00:00Z',
    deliverNotBefore: '2026-04-01T12:00:00Z',
    lastAction: 'transit',
    canDeliver: false,
  },
];

test('renders package data', () => {
  render(<PackageTable packages={packages} onDeliver={() => {}} />);

  expect(screen.getByText('pkg-001')).toBeInTheDocument();
  expect(screen.getByText('central')).toBeInTheDocument();
  expect(screen.getByText('RNC')).toBeInTheDocument();
  expect(screen.getByText('Recibido')).toBeInTheDocument();
});

test('shows deliver button only when package can be delivered', () => {
  render(<PackageTable packages={packages} onDeliver={() => {}} />);

  expect(screen.getByRole('button', { name: /entregar/i })).toBeInTheDocument();
  expect(screen.getAllByText('—').length).toBeGreaterThan(0);
});

test('calls onDeliver with package id when clicking deliver', () => {
  const onDeliver = vi.fn();

  render(<PackageTable packages={packages} onDeliver={onDeliver} />);

  fireEvent.click(screen.getByRole('button', { name: /entregar/i }));

  expect(onDeliver).toHaveBeenCalledWith('pkg-001');
});
