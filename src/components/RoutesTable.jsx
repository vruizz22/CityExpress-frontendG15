export default function RoutesTable({ routes }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="p">Código</th>
          <th className="p">Ciudad</th>
          <th className="p">Ruta habilitada</th>
        </tr>
      </thead>
      <tbody>
        {routes.map((route) => (
          <tr key={route.code}>
            <td className="p">{route.code}</td>
            <td className="p">{route.name}</td>
            <td className="p">{route.enabled ? 'Habilidata' : 'Deshabilitada'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
