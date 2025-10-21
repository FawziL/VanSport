import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function ListReportes() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    adminService.reportes.list().then((data) => {
      const arr = Array.isArray(data) ? data : data.results || [];
      if (alive) setItems(arr);
    });
    return () => { alive = false; };
  }, []);

  return (
    <div style={{color: '#111'}}>
      <h2>Reportes de fallas</h2>
      <table style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th>UUID</th>
            <th>Título</th>
            <th>Usuario</th>
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
              <td>{r.usuario_nombre} {r.usuario_apellido} ({r.usuario_email})</td>
              <td>{r.estado}</td>
              <td>{new Date(r.fecha_creacion).toLocaleString('es-ES')}</td>
              <td><Link to={`/admin/reportes/${r.id}`}>Editar</Link></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#666' }}>Sin datos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}