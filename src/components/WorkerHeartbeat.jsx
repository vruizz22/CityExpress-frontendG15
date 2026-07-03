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

      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Jobs service</span>
          <span className={`badge ${isUp ? 'badge-success' : 'badge-danger'}`}>
            {isUp ? 'Workers operativos' : 'Workers caídos'}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Estado</span>
          <span className="summary-value">
            {isUp
              ? 'El servicio de jobs/workers está operativo.'
              : 'El servicio de jobs/workers no está disponible.'}
          </span>
        </div>
      </div>
    </section>
  );
}
