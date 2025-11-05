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
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#007bff', margin: 0, fontSize: '1.8rem' }}>⚙️ Mis Reportes de Fallas</h2>
        <Link
          to="/reportes/nuevo"
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#218838'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#28a745'}
        >
          + Nuevo Reporte
        </Link>
      </div>
      

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
        <thead style={{ backgroundColor: '#e9ecef' }}>
          <tr>
            <th style={tableHeaderStyle}>Título</th>
            <th style={tableHeaderStyle}>Estado</th>
            <th style={tableHeaderStyle}>Fecha</th>
            <th style={tableHeaderStyle}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, index) => (
            <tr key={r.id} style={index % 2 === 0 ? tableRowEvenStyle : tableRowOddStyle}>
              <td style={tableCellStyle('left')}>{r.titulo}</td>
              <td style={tableCellStyle('left')}>{r.estado}</td>
              <td style={tableCellStyle('left')}>{new Date(r.fecha_creacion).toLocaleString('es-ES')}</td>
              <td style={tableCellStyle('center')}>
                <Link
                  to={`/reportes/${r.id}`}
                  style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Ver Detalle
                </Link>
              </td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '20px', fontStyle: 'italic' }}>✅ No tienes reportes de fallas pendientes.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Estos objetos de estilo se pueden definir fuera del componente para mejor organización:
const tableHeaderStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#555',
  borderBottom: '2px solid #ddd',
};

const tableCellStyle = (align = 'left', color = '#333') => ({
  padding: '12px 15px',
  textAlign: align,
  color: color,
  borderBottom: '1px solid #eee',
});

const tableRowOddStyle = {
  backgroundColor: '#fff',
  transition: 'background-color 0.2s',
};

const tableRowEvenStyle = {
  backgroundColor: '#f9f9f9', // Alternating row color
  transition: 'background-color 0.2s',
};