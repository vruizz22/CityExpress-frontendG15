import { useEffect, useState } from 'react';
import { getWorkersHeartbeat } from '../services/api/heartbeatService';

export default function WorkerHeartbeat() {
  const [isUp, setIsUp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHeartbeat() {
      try {
        setLoading(true);

        const response = await getWorkersHeartbeat();
        setIsUp(Boolean(response?.jobsService));
      } catch {
        setIsUp(false);
      } finally {
        setLoading(false);
      }
    }

    loadHeartbeat();
  }, []);

  if (loading) {
    return (
      <section className="section-card">
        <h2>Estado workers</h2>
        <p className="loading-box">Verificando servicio de workers...</p>
      </section>
    );
  }

  return (
    <section className="section-card">
      <h2>Estado workers</h2>

      {isUp ? (
        <>
          <span className="badge badge-success">Workers operativos</span>
          <p className="success-message">El servicio de jobs/workers está operativo.</p>
        </>
      ) : (
        <>
          <span className="badge badge-danger">Workers caídos</span>
          <p className="error-message">El servicio de jobs/workers no está disponible.</p>
        </>
      )}
    </section>
  );
}
