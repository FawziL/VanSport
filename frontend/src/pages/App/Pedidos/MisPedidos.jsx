import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return String(d ?? '');
    return dt.toLocaleString('es-ES');
  } catch {
    return String(d ?? '');
  }
}

export default function MisPedidos() {
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      const ok = await ensureUserLoaded();
      if (!ok) {
        navigate('/login', { replace: true });
        return;
      }
      setLoading(true);
      setErrMsg('');
      try {
        const data = await appService.pedidos.list({ ordering: '-fecha_pedido' });
        const results = Array.isArray(data) ? data : data.results || [];
        if (alive) setItems(results);
      } catch (e) {
        if (alive) setErrMsg('No se pudieron cargar tus pedidos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [isAuthenticated]);

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', color: '#111827' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 14 }}>Mis pedidos</h1>

      {errMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 16, fontWeight: 700 }}>{errMsg}</div>
      )}

      {loading ? (
        <div>Cargando…</div>
      ) : items.length === 0 ? (
        <div>
          Aún no tienes pedidos.
          <button onClick={() => navigate('/productos')} style={{ marginLeft: 8, background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontWeight: 800 }}>Ver productos</button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #eee', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Estado</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.pedido_id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>#{p.pedido_id}</td>
                  <td style={{ padding: '10px' }}>{formatDate(p.fecha_pedido)}</td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{p.estado}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>{formatPrice(p.total)}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <Link to={`/pedidos/${p.pedido_id}`} style={{ background: '#1e88e5', color: '#fff', borderRadius: 8, padding: '6px 10px', fontWeight: 800, textDecoration: 'none' }}>Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
