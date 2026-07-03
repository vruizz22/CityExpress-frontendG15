const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

function buildApiUrl(path) {
  if (!API_URL) return path;

  return `${API_URL}${path}`;
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error('No se pudieron cargar los eventos recientes.');
  }

  if (!contentType.includes('application/json')) {
    throw new Error('El backend de eventos no respondió JSON. Revisa la URL de la API.');
  }

  return response.json();
}

export async function getRecentEvents() {
  const response = await fetch(buildApiUrl('/events/recent'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return parseJsonResponse(response);
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
