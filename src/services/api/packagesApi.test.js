import { describe, expect, it } from 'vitest';
import { getPackages, deliverPackage } from './packagesApi';

describe('packagesApi', () => {
  it('returns mock packages', async () => {
    const packages = await getPackages();

    expect(packages.length).toBeGreaterThan(0);
    expect(packages[0]).toHaveProperty('id');
  });

  it('delivers package', async () => {
    const result = await deliverPackage('pkg-001');

    expect(result).toEqual({
      success: true,
      packageId: 'pkg-001',
    });
  });
});
