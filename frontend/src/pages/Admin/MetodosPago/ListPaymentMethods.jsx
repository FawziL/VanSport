import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function ListPaymentMethods() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.pagos
      .list({})
      .then((data) => setItems(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('No se pudieron cargar los métodos de pago'))
      .finally(() => setLoading(false));
  }, []);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));

  const toggleActivo = async (m) => {
    try {
      setTogglingId(m.id);
      await adminService.pagos.partialUpdate(m.id, { activo: !m.activo });
      setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, activo: !m.activo } : it)));
    } catch {
      setError('No se pudo actualizar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este método de pago?')) return;
    try {
      await adminService.pagos.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setError('No se pudo eliminar el método');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Métodos de pago</h1>
        <Link to="/admin/metodos-pago/crear" style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#1e88e5', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>
          + Crear método
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 10 }}>
        <label style={{ color: '#555' }}>
          Por página:{' '}
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Código</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Orden</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Activo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Actualizado</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No hay métodos.</td></tr>
            ) : (
              pageItems.map((m) => (
                <tr key={m.id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px' }}>{m.id}</td>
                  <td style={{ padding: '10px 8px' }}>{m.codigo}</td>
                  <td style={{ padding: '10px 8px' }}>{m.nombre}</td>
                  <td style={{ padding: '10px 8px' }}>{m.tipo}</td>
                  <td style={{ padding: '10px 8px' }}>{m.orden}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleActivo(m)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: '2px 10px',
                        cursor: togglingId === m.id ? 'not-allowed' : 'pointer',
                        color: m.activo ? '#2e7d32' : '#b91c1c',
                        opacity: togglingId === m.id ? 0.6 : 1,
                      }}
                      disabled={togglingId === m.id}
                    >
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 8px' }}>{m.actualizado ? new Date(m.actualizado).toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/admin/metodos-pago/editar/${m.id}`)}
                      style={{ marginRight: 8, padding: '0.4rem 0.8rem', borderRadius: 6, border: 'none', background: '#1e88e5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: 'none', background: '#e53935', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
        <div style={{ padding: '4px 10px' }}>{page} / {pages}</div>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Siguiente</button>
      </div>
    </div>
  );
}