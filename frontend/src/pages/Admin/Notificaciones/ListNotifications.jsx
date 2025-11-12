import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton
} from '@/components/ui/Table';
import { toast } from 'react-toastify';

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
      .catch(() => {
        setError('No se pudieron cargar las notificaciones');
        toast.error('No se pudieron cargar las notificaciones');
      })
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

  const getUserLabel = (n) => {
    const nombre = n.usuario_nombre || '';
    const apellido = n.usuario_apellido || '';
    const email = n.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = n.usuario_id != null ? n.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.notificaciones.remove(deleteId);
      setItems((prev) => prev.filter((x) => x.notificacion_id !== deleteId));
      toast.success('Notificación eliminada correctamente');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'No se pudo eliminar la notificación';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteId(null);
      setModalOpen(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Notificaciones</h1>
        <button
          onClick={() => navigate('/admin/notificaciones/crear')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold hover:bg-blue-700 transition-colors"
        >
          + Crear Notificación
        </button>
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
          <TableHeader width="10%">ID</TableHeader>
          {/*<TableHeader width="26%">Usuario</TableHeader>*/}
          <TableHeader>Título</TableHeader>
          <TableHeader width="12%">Tipo</TableHeader>
          <TableHeader width="15%">Fecha</TableHeader>
          <TableHeader width="17%">Expira</TableHeader>
          <TableHeader width="10%" align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={pageItems.length === 0}
          colSpan={7}
          loadingText="Cargando notificaciones..."
          emptyText="No hay notificaciones."
        >
          {pageItems.map((n) => (
            <TableRow key={n.notificacion_id}>
              <TableCell className="whitespace-nowrap">{n.notificacion_id}</TableCell>
              {/*<TableCell className="break-words">{getUserLabel(n)}</TableCell>*/}
              <TableCell className="break-words">{n.titulo}</TableCell>
              <TableCell className="break-words">{n.tipo}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(n.fecha_creacion)}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(n.expira)}</TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/notificaciones/editar/${n.notificacion_id}`)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(n.notificacion_id);
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
        title="¿Eliminar notificación?"
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