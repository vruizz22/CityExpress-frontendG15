import { describe, expect, it } from 'vitest';
import { getRoutes } from './routesApi';

describe('routesApi', () => {
  it('returns mock routes', async () => {
    const routes = await getRoutes();

    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]).toHaveProperty('code');
    expect(routes[0]).toHaveProperty('enabled');
  });
});
