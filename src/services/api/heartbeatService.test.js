import { describe, it, expect, vi, afterEach } from 'vitest';
import { getWorkersHeartbeat } from './heartbeatService';

vi.mock('@/config/env', () => ({
  env: {
    apiBaseUrl: 'https://api.andresitowan.com',
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('heartbeatService', () => {
  it('gets heartbeat from the backend API without auth headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ jobsService: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(getWorkersHeartbeat()).resolves.toEqual({ jobsService: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.andresitowan.com/heartbeat');
  });

  it('returns jobsService false when the backend responds non-OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getWorkersHeartbeat()).resolves.toEqual({ jobsService: false });
  });
});
