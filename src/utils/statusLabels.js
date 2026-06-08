export function getPaymentBadgeClass(status) {
  if (status === 'SUCCESS') return 'badge badge-success';
  if (status === 'FAILED') return 'badge badge-danger';
  if (status === 'TRYING') return 'badge badge-warning';

  return 'badge badge-neutral';
}

export function getShipmentBadgeClass(status) {
  if (status === 'sent') return 'badge badge-info';
  if (status === 'paid') return 'badge badge-success';
  if (status === 'failed') return 'badge badge-danger';
  if (status === 'pending-payment') return 'badge badge-warning';
  if (status === 'pending-routing') return 'badge badge-warning';

  return 'badge badge-neutral';
}

export function translatePaymentStatus(status) {
  const labels = {
    SUCCESS: 'Pagado',
    FAILED: 'Fallido',
    TRYING: 'Intentando',
  };

  return labels[status] || 'Sin pago';
}

export function translateShipmentStatus(status) {
  const labels = {
    'pending-payment': 'Pendiente de pago',
    paid: 'Pagado',
    sent: 'Enviado al siguiente salto',
    failed: 'Fallido',
    'pending-routing': 'Pendiente de ruteo',
  };

  return labels[status] || status || 'No disponible';
}
