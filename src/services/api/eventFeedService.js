const API_URL = import.meta.env.VITE_API_URL || '';

function buildApiUrl(path) {
  if (!API_URL) return path;

  return `${API_URL}${path}`;
}

export async function getRecentEvents() {
  const response = await fetch(buildApiUrl('/events/recent'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar los eventos recientes.');
  }

  return response.json();
}

export function subscribeToEventStream({ onMessage, onError }) {
  const eventSource = new EventSource(buildApiUrl('/events/stream'));

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onError?.(new Error('No se pudo interpretar un evento recibido.'));
    }
  };

  eventSource.onerror = () => {
    onError?.(new Error('Se perdió la conexión con el feed de eventos.'));
  };

  return eventSource;
}
