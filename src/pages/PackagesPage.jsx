import { useState } from 'react';
import PackageTable from '../components/PackageTable';
import { mockPackages } from '../mocks/mockPackages';

export default function PackagesPage() {
  const [packages, setPackages] = useState(mockPackages);
  const handleDeliver = (pkIdDelivered) => {
    setPackages((currentPackages) =>
      currentPackages.map((pk) =>
        pk.id === pkIdDelivered
          ? {
              ...pk,
              status: 'delivered',
              lastAction: 'delivered',
              canDeliver: false,
            }
          : pk,
      ),
    );
  };

  return (
    <main>
      <h1>Paquetes recibidos</h1>
      <h3>Ultima acción realizada por la ciudad a los paquetes</h3>
      <PackageTable packages={packages} onDeliver={handleDeliver} />
    </main>
  );
}
