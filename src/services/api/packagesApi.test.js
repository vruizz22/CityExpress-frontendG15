import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverPackage, getPackages } from './packagesApi';

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

describe('packagesApi', () => {
  it('gets packages from API', async () => {
    const packages = [{ id: 'pkg-001', canDeliver: true }];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse(packages)));

    await expect(getPackages()).resolves.toEqual(packages);
  });

  it('delivers package', async () => {
    const deliveredPackage = { success: true, packageId: 'pkg-001' };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse(deliveredPackage)));

    await expect(deliverPackage('pkg-001')).resolves.toEqual(deliveredPackage);
  });
});
