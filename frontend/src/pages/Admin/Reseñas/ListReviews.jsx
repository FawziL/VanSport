import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton
} from '@/components/ui/Table';

export default function ListReviews() {
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
    date: (s) => (s ? new Date(s).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    }) : '-'),
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

  const handleDelete = async () => {
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
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Reseñas</h1>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="5%">ID</TableHeader>
          <TableHeader width="5%">Producto</TableHeader>
          <TableHeader width="20%">Usuario</TableHeader>
          <TableHeader width="20%">Comentario</TableHeader>
          <TableHeader width="10%">Calif.</TableHeader>
          <TableHeader width="10%">Fecha</TableHeader>
          <TableHeader width="10%" align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={pageItems.length === 0}
          colSpan={7}
          loadingText="Cargando reseñas..."
          emptyText="No hay reseñas."
        >
          {pageItems.map((r) => (
            <TableRow key={r.resena_id}>
              <TableCell className="whitespace-nowrap">{r.resena_id}</TableCell>
              <TableCell className="break-words">{r.producto ?? '-'}</TableCell>
              <TableCell className="break-words">{getUserLabel(r)}</TableCell>
              <TableCell 
                className="break-words" 
                title={r.comentario || ''}
              >
                {truncateWords(r.comentario, 12)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{r.calificacion}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(r.fecha_creacion)}</TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/resenas/editar/${r.resena_id}`)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(r.resena_id);
                      setModalOpen(true);
                    }}
                  >
                    Eliminar
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      {/* Confirm Modal */}
      <ConfirmModal
        open={modalOpen}
        title="¿Eliminar reseña?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}