function getStateBadgeClass(state) {
  if (state === 'delivered') return 'badge-success';
  if (state === 'expired') return 'badge-danger';
  if (state === 'transit' || state === 'transit-redirect') return 'badge-warning';
  if (state === 'received') return 'badge-info';
  return 'badge-neutral';
}

export default function PackageTable({ packages, onDeliver }) {
  const states = {
    received: 'Recibido',
    transit: 'Reenviado',
    'transit-redirect': 'Redirigido',
    expired: 'Expirado',
    delivered: 'Entregado',
    pending: 'Pendiente',
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Identificador</th>
            <th>Ciudad de origen</th>
            <th>Ciudad de destino</th>
            <th>Max hops</th>
            <th>Fecha de creación</th>
            <th>Fecha mínima de entrega</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {packages.map((pk) => (
            <tr key={pk.id}>
              <td>{pk.id}</td>
              <td>{pk.originId}</td>
              <td>{pk.destinationId}</td>
              <td>{pk.maxHops}</td>
              <td>{new Date(pk.createdAt).toLocaleDateString()}</td>
              <td>{new Date(pk.deliverNotBefore).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${getStateBadgeClass(pk.lastAction)}`}>
                  {states[pk.lastAction] ?? pk.lastAction}
                </span>
              </td>
              <td>
                {pk.canDeliver && pk.lastAction !== 'delivered' ? (
                  <button className="btn-success" type="button" onClick={() => onDeliver(pk.id)}>
                    Entregar
                  </button>
                ) : (
                  <span className="helper-text">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
