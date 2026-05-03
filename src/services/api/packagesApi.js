const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPackages() {
  const rta = await fetch(`${API_BASE_URL}/packages`);
  if (!rta.ok) {
    throw new Error('Error al obtener paquetes');
  }
  return rta.json();
}

export async function deliverPackage(packageId) {
  const rta = await fetch(`${API_BASE_URL}/packages/${packageId}/deliver`, {
    method: 'POST',
  });
  if (!rta.ok) {
    throw new Error('Error al entregar paquete');
  }
  return rta.json();
}
