import { http } from './httpClient';

const HEARTBEAT_URL = 'https://api.andresitowan.com/heartbeat';

export function getWorkersHeartbeat() {
  return http.get(HEARTBEAT_URL, {
    auth: false,
  });
}
