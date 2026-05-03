import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRoutes } from './routesApi';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchResponse(payload, options = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    text: async () => JSON.stringify(payload),
    json: async () => payload,
    headers: new Headers({ 'content-type': 'application/json' }),
  };
}

describe('routesApi', () => {
  it('gets routes from API', async () => {
    const routes = [{ code: 'RNC', name: 'Rancagua', enabled: true }];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse(routes)));

    await expect(getRoutes()).resolves.toEqual(routes);
  });
});
