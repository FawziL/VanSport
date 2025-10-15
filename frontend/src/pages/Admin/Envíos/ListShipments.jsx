import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListShipments() {
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
    adminService.envios
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
                console.log(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar los envíos'))
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

  const getUserLabel = (e) => {
    const nombre = e.usuario_nombre || '';
    const apellido = e.usuario_apellido || '';
    const email = e.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = e.usuario_id != null ? e.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Envíos</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector value={pageSize} onChange={setPageSize} options={[5, 10, 20, 50]} label="Por página" />
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000000ff' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '5%' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '5%' }}>Pedido</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '30%' }}>Usuario</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '14%' }}>Método</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '14%' }}>Estado</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Costo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '15%' }}>Fecha envío</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No hay envíos.</td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr key={e.envio_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{e.envio_id}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{e.pedido ?? '-'}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{getUserLabel(e)}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{e.metodo_envio}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{e.estado}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmt.money(e.costo_envio)}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmt.date(e.fecha_envio)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/admin/envios/editar/${e.envio_id}`)}
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
