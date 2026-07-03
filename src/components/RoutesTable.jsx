export default function RoutesTable({ routes }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Ciudad</th>
            <th>Ruta habilitada</th>
          </tr>
        </thead>

        <tbody>
          {routes.map((route) => (
            <tr key={route.code}>
              <td>{route.code}</td>
              <td>{route.name}</td>
              <td>
                <span className={`badge ${route.enabled ? 'badge-success' : 'badge-danger'}`}>
                  {route.enabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
