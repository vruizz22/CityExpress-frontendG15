import { env } from '@/config/env';

function getHeartbeatUrl() {
  const baseUrl = env.apiBaseUrl.endsWith('/') ? env.apiBaseUrl.slice(0, -1) : env.apiBaseUrl;
  return `${baseUrl}/heartbeat`;
}

export async function getWorkersHeartbeat() {
  const response = await fetch(getHeartbeatUrl());

  if (!response.ok) {
    return { jobsService: false };
  }

  return response.json();
}
