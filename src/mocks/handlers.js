import { http, HttpResponse } from 'msw';

/**
 * MSW handlers de baseline. Los hooks de tests añaden más con `server.use(...)`.
 * Endpoints alineados con `docs/requirements.md`.
 */
export const handlers = [
  http.get('*/packages', () => HttpResponse.json({ items: [], total: 0, page: 1, limit: 25 })),
  http.get('*/routes', () => HttpResponse.json({ destinations: {} })),
];
