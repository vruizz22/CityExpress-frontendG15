import { http } from './httpClient';

export function startPayment({ shipmentId, returnUrl }) {
  return http.post('/payments', {
    shipmentId,
    returnUrl,
  });
}

export function commitPayment(commitData) {
  return http.post('/payments/commit', commitData);
}
