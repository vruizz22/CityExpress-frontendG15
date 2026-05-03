import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverPackage, getPackages } from './packagesApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('packagesApi', () => {
  it('gets packages from API', async () => {
    const packages = [{ id: 'pkg-001', canDeliver: true }];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => packages,
      }),
    );

    await expect(getPackages()).resolves.toEqual(packages);
  });

  it('delivers package', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, packageId: 'pkg-001' }),
      }),
    );

    await expect(deliverPackage('pkg-001')).resolves.toEqual({
      success: true,
      packageId: 'pkg-001',
    });
  });
});
