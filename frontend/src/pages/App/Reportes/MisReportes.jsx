import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appService } from '@/services/auth';

export default function MisReportes() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    appService.reportes.list().then((data) => {
      const arr = Array.isArray(data) ? data : data.results || [];
      if (alive) setItems(arr);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', color: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mis reportes de fallas</h2>
        <Link to="/reportes/nuevo" className="btn">Nuevo reporte</Link>
      </div>
      <table style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th>UUID</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td style={{ fontFamily: 'monospace' }}>{r.id}</td>
              <td>{r.titulo}</td>
              <td>{r.estado}</td>
              <td>{new Date(r.fecha_creacion).toLocaleString('es-ES')}</td>
              <td><Link to={`/reportes/${r.id}`}>Ver</Link></td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No tienes reportes</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}