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
    <table>
      <thead>
        <tr>
          <th className="p">Identificador</th>
          <th className="p">Ciudad de origen</th>
          <th className="p">Ciudad de destino</th>
          <th className="p">Max hops</th>
          <th className="p">Fecha de creación</th>
          <th className="p">Fecha mínima de entrega</th>
          <th className="p">Estado</th>
          <th className="p">Acción</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((pk) => (
          <tr key={pk.id}>
            <td className="p">{pk.id}</td>
            <td className="p">{pk.originId}</td>
            <td className="p">{pk.destinationId}</td>
            <td className="p">{pk.maxHops}</td>
            <td className="p">{new Date(pk.createdAt).toLocaleDateString()}</td>
            <td className="p">{new Date(pk.deliverNotBefore).toLocaleDateString()}</td>
            <td className="p">{states[pk.lastAction] ?? pk.lastAction}</td>
            <td className="p">
              {pk.canDeliver && pk.lastAction !== 'delivered' ? (
                <button onClick={() => onDeliver(pk.id)}>Entregar</button>
              ) : (
                <span className="p">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
