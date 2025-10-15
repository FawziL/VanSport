import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListOrders() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.pedidos
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    setPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
    // eslint-disable-next-line
  }, [items, pageSize]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const fmt = {
    date: (s) => (s ? new Date(s).toLocaleString() : '-'),
    money: (n) => (n != null ? Number(n).toFixed(2) : '-'),
  };

  const getUserLabel = (p) => {
    const nombre = p.usuario_nombre || '';
    const apellido = p.usuario_apellido || '';
    const email = p.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = p.usuario != null ? p.usuario : (p.usuario_id != null ? p.usuario_id : null);
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Pedidos</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector value={pageSize} onChange={setPageSize} options={[5, 10, 20, 50]} label="Por página" />
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000000ff' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '30%' }}>Usuario</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Fecha</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Estado</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Total</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No hay pedidos.</td>
              </tr>
            ) : (
              pageItems.map((p) => (
                <tr key={p.pedido_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{p.pedido_id}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{getUserLabel(p)}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmt.date(p.fecha_pedido)}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{p.estado}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmt.money(p.total)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/admin/pedidos/editar/${p.pedido_id}`)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: 6,
                        border: 'none',
                        background: '#1e88e5',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
