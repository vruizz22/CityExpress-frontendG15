const JOBS_API_URL = import.meta.env.VITE_JOBS_API_URL;

export async function getWorkersHeartbeat() {
  const response = await fetch(`${JOBS_API_URL}/heartbeat`);

  if (!response.ok) {
    return { jobsService: false };
  }

  return response.json();
}
