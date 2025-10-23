import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListSales() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.transacciones
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar las ventas'))
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

  const getUserLabel = (t) => {
    const nombre = t.usuario_nombre || '';
    const apellido = t.usuario_apellido || '';
    const email = t.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = t.usuario_id != null ? t.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate   ? { end_date: endDate }     : {}),
      };
      const data = await adminService.transacciones.export(params); // ArrayBuffer
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `transacciones_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      setError('No se pudo exportar ventas');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Ventas</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
      </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'end', marginBottom: 12 }}>
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                 className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                 className="border rounded px-3 py-2" />
        </div>
        <button
          onClick={handleExportExcel}
          disabled={exporting}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: '1px solid #cfe3fb',
            background: exporting ? '#e3f2fd' : '#f5faff',
            color: '#1e88e5',
            fontWeight: 800,
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting ? 'Exportando…' : 'Exportar Excel'}
        </button>
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}

      <div
        style={{
          overflowX: 'auto',
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 12px #0001',
        }}
      >
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000000ff' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Pedido</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '30%' }}>Usuario</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Monto</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '14%' }}>Método</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Estado</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Fecha</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>
                  Cargando...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  No hay ventas.
                </td>
              </tr>
            ) : (
              pageItems.map((t) => (
                <tr key={t.transaccion_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{t.transaccion_id}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                    {t.pedido_id ?? '-'}
                  </td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                    {getUserLabel(t)}
                  </td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                    {fmt.money(t.monto)}
                  </td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{t.metodo_pago}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{t.estado}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                    {fmt.date(t.fecha_transaccion)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/admin/ventas/editar/${t.transaccion_id}`)}
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
