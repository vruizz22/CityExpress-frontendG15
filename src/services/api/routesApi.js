const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getRoutes() {
  const rta = await fetch(`${API_BASE_URL}/routes`);
  if (!rta.ok) {
    throw new Error('Error al obtener rutas');
  }
  return rta.json();
}
