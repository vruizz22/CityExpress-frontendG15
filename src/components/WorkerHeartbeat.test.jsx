import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkerHeartbeat from './WorkerHeartbeat';
import { getWorkersHeartbeat } from '../services/api/heartbeatService';

vi.mock('../services/api/heartbeatService', () => ({
  getWorkersHeartbeat: vi.fn(),
}));

describe('WorkerHeartbeat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra loading al iniciar', () => {
    getWorkersHeartbeat.mockReturnValue(new Promise(() => {}));

    render(<WorkerHeartbeat />);

    expect(screen.getByText(/verificando servicio de workers/i)).toBeInTheDocument();
  });

  it('muestra workers arriba cuando jobsService es true', async () => {
    getWorkersHeartbeat.mockResolvedValue({ jobsService: true });

    render(<WorkerHeartbeat />);

    expect(await screen.findByText(/workers arriba/i)).toBeInTheDocument();
    expect(screen.getByText(/está operativo/i)).toBeInTheDocument();
  });

  it('muestra workers caídos cuando jobsService es false', async () => {
    getWorkersHeartbeat.mockResolvedValue({ jobsService: false });

    render(<WorkerHeartbeat />);

    expect(await screen.findByText(/workers caídos/i)).toBeInTheDocument();
    expect(screen.getByText(/no está disponible/i)).toBeInTheDocument();
  });

  it('muestra workers caídos si el request falla', async () => {
    getWorkersHeartbeat.mockRejectedValue(new Error('Network error'));

    render(<WorkerHeartbeat />);

    await waitFor(() => {
      expect(screen.getByText(/workers caídos/i)).toBeInTheDocument();
    });
  });
});
