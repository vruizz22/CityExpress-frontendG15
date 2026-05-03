import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRoutes } from './routesApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('routesApi', () => {
  it('gets routes from API', async () => {
    const routes = [{ code: 'RNC', name: 'Rancagua', enabled: true }];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => routes,
      }),
    );

    await expect(getRoutes()).resolves.toEqual(routes);
  });
});
