import { http } from './httpClient';

export function createSubscription(subscriptionData) {
  return http.post('/subscriptions', subscriptionData);
}

export function getSubscriptions(page = 1, limit = 25) {
  return http.get('/subscriptions', {
    query: {
      page,
      limit,
    },
  });
}

export function getSubscriptionById(subscriptionId) {
  return http.get(`/subscriptions/${subscriptionId}`);
}
