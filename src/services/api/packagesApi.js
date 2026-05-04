import { http } from './httpClient';

export async function getPackages() {
  return http.get('/packages');
}

export async function deliverPackage(packageId) {
  return http.post(`/packages/${packageId}/deliver`);
}
