import { http } from './httpClient';

export async function deliverPackage(packageId) {
  return http.post(`/packages/${packageId}/deliver`);
}

export function getPackages(page = 1, limit = 25) {
  return http.get('/packages', {
    query: {
      page,
      limit,
    },
  });
}
