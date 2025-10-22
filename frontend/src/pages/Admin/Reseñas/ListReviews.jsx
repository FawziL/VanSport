import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
import ConfirmModal from '@/components/ConfirmModal'; // <-- nuevo

export default function ListReviews() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);   // <-- nuevo
  const [modalOpen, setModalOpen] = useState(false); // <-- nuevo
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.reseñas
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar las reseñas'))
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

  const truncateWords = (text, maxWords = 12) => {
    if (!text) return '-';
    const words = String(text).split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '…';
  };

  const getUserLabel = (r) => {
    const nombre = r.usuario_nombre || '';
    const apellido = r.usuario_apellido || '';
    const email = r.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = r.usuario != null ? r.usuario : r.usuario_id != null ? r.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
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
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Reseñas</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
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
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '5%' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '5%' }}>Producto</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Usuario</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '20%' }}>Comentario</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Calif.</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', width: '10%' }}>Fecha</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Cargando...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  No hay reseñas.
                </td>
              </tr>
            ) : (
              pageItems.map((r) => (
                <tr key={r.resena_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{r.resena_id}</td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                    {r.producto ?? '-'}
                  </td>
                  <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                    {getUserLabel(r)}
                  </td>
                  <td
                    style={{ padding: '10px 8px', wordBreak: 'break-word' }}
                    title={r.comentario || ''}
                  >
                    {truncateWords(r.comentario, 12)}
                  </td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{r.calificacion}</td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                    {fmt.date(r.fecha_creacion)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => navigate(`/admin/resenas/editar/${r.resena_id}`)}
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
                      onClick={() => {
                        setDeleteId(r.resena_id);
                        setModalOpen(true);
                      }}
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
        title="¿Eliminar reseña?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await adminService.reseñas.remove(deleteId);
            setItems((prev) => prev.filter((x) => x.resena_id !== deleteId));
          } catch {
            setError('No se pudo eliminar la reseña');
          } finally {
            setDeleteId(null);
            setModalOpen(false);
          }
        }}
      />
    </div>
  );
}
