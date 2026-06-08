import { http } from './httpClient';

export function getRoutes() {
  return http.get('/routes');
}

export function createQuote(quoteData) {
  return http.post('/quotes', quoteData);
}

export function createShipment(shipmentData) {
  return http.post('/shipments', shipmentData);
}

export function getShipments(page = 1, limit = 25) {
  return http.get('/shipments', {
    query: {
      page,
      limit,
    },
  });
}

export function getShipmentById(shipmentId) {
  return http.get(`/shipments/${shipmentId}`);
}
