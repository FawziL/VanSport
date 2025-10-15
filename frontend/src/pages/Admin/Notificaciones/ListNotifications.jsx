import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListNotifications() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.notificaciones
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar las notificaciones'))
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
  };

  const getUserLabel = (n) => {
    const nombre = n.usuario_nombre || '';
    const apellido = n.usuario_apellido || '';
    const email = n.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = n.usuario_id != null ? n.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Notificaciones</h1>
        <button
          onClick={() => navigate('/admin/notificaciones/crear')}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#1e88e5', color: '#fff', fontWeight: 800, border: 'none' }}
        >
          + Crear notificación
        </button>
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
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Título</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Tipo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '15%' }}>Fecha</th>
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
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No hay notificaciones.</td>
              </tr>
            ) : (
              pageItems.map((n) => (
                <tr key={n.notificacion_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{n.notificacion_id}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{getUserLabel(n)}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{n.titulo}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{n.tipo}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmt.date(n.fecha_creacion)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/admin/notificaciones/editar/${n.notificacion_id}`)}
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
                    <button
                      onClick={() => { setDeleteId(n.notificacion_id); setModalOpen(true); }}
                      style={{
                        marginLeft: 8,
                        padding: '0.4rem 0.8rem',
                        borderRadius: 6,
                        border: 'none',
                        background: '#e53935',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
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

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      <ConfirmModal
        open={modalOpen}
        title="¿Eliminar notificación?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await adminService.notificaciones.remove(deleteId);
            setItems((prev) => prev.filter((x) => x.notificacion_id !== deleteId));
          } catch {
            setError('No se pudo eliminar la notificación');
          } finally {
            setDeleteId(null);
            setModalOpen(false);
          }
        }}
      />
    </div>
  );
}
