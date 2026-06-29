import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';
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
  ActionButton,
} from '@/components/ui/Table';
import { toast } from 'react-toastify';

export default function ListNotifications() {
  const { t } = useTranslation('admin');
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
    adminService.notifications
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => {
        setError(t('listNotifications.errorCargar'));
        toast.error(t('listNotifications.errorCargar'));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    setPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
  }, [items, pageSize]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const fmt = {
    date: (s) =>
      s
        ? new Date(s).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '-',
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.notifications.remove(deleteId);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      toast.success(t('listNotifications.successEliminar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('listNotifications.errorEliminar');
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
        <h1 className="text-2xl font-extrabold">{t('listNotifications.titulo')}</h1>
        <button
          onClick={() => navigate(locPath('/admin/notificaciones/crear'))}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold hover:bg-blue-700 transition-colors"
        >
          {t('listNotifications.crear')}
        </button>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listNotifications.porPagina')}
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="10%">{t('listNotifications.colId')}</TableHeader>
          {/*<TableHeader width="26%">Usuario</TableHeader>*/}
          <TableHeader>{t('listNotifications.colTitulo')}</TableHeader>
          <TableHeader width="12%">{t('listNotifications.colTipo')}</TableHeader>
          <TableHeader width="15%">{t('listNotifications.colFecha')}</TableHeader>
          <TableHeader width="17%">{t('listNotifications.colExpira')}</TableHeader>
          <TableHeader width="10%" align="center">
            {t('listNotifications.colAcciones')}
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={7}
          loadingText={t('listNotifications.cargando')}
          emptyText={t('listNotifications.vacio')}
        >
          {pageItems.map((n) => (
            <TableRow key={n.id}>
              <TableCell className="whitespace-nowrap">{n.id}</TableCell>
              {/*<TableCell className="break-words">{getUserLabel(n)}</TableCell>*/}
              <TableCell className="break-words">{n.title}</TableCell>
              <TableCell className="break-words">{n.type}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(n.createdAt)}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(n.expiresAt)}</TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(locPath(`/admin/notificaciones/editar/${n.id}`))}
                  >
                    {t('listNotifications.editar')}
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(n.id);
                      setModalOpen(true);
                    }}
                  >
                    {t('listNotifications.eliminar')}
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
        title={t('listNotifications.confirmarTitulo')}
        message={t('listNotifications.confirmarMensaje')}
        confirmText={t('listNotifications.confirmarSi')}
        cancelText={t('confirm.cancelar')}
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
