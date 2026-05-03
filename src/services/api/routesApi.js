import { http } from './httpClient';

export async function getRoutes() {
  return http.get('/routes');
}
