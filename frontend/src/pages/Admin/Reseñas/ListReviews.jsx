import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
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
  ActionButton,
} from '@/components/ui/Table';
import { toast } from 'react-toastify';

export default function ListReviews() {
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
    adminService.reviews
      .listAdmin()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => {
        setError(t('listReviews.errorCargar'));
        toast.error(t('listReviews.errorCargar'));
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
    date: (s) =>
      s
        ? new Date(s).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '-',
  };

  const truncateWords = (text, maxWords = 12) => {
    if (!text) return '-';
    const words = String(text).split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '…';
  };

  const getUserLabel = (r) => {
    const nombre = r.userName || '';
    const apellido = r.userLastName || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = r.userId != null ? r.userId : null;
    return base || id != null ? `${base}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.reviews.removeAdmin(deleteId);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      toast.success(t('listReviews.successEliminar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('listReviews.errorEliminar');
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
        <h1 className="text-2xl font-extrabold">{t('listReviews.titulo')}</h1>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listReviews.porPagina')}
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="5%">{t('listReviews.colId')}</TableHeader>
          <TableHeader width="5%">{t('listReviews.colProducto')}</TableHeader>
          <TableHeader width="20%">{t('listReviews.colUsuario')}</TableHeader>
          <TableHeader width="20%">{t('listReviews.colComentario')}</TableHeader>
          <TableHeader width="10%">{t('listReviews.colCalif')}</TableHeader>
          <TableHeader width="10%">{t('listReviews.colFecha')}</TableHeader>
          <TableHeader width="10%" align="center">
            {t('listReviews.colAcciones')}
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={7}
          loadingText={t('listReviews.cargando')}
          emptyText={t('listReviews.vacio')}
        >
          {pageItems.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="whitespace-nowrap">{r.id}</TableCell>
              <TableCell className="break-words">{r.productName ?? '-'}</TableCell>
              <TableCell className="break-words">{getUserLabel(r)}</TableCell>
              <TableCell className="break-words" title={r.comment || ''}>
                {truncateWords(r.comment, 12)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{r.rating}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(r.createdAt)}</TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/resenas/editar/${r.id}`)}
                  >
                    {t('listReviews.editar')}
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(r.id);
                      setModalOpen(true);
                    }}
                  >
                    {t('listReviews.eliminar')}
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
        title={t('listReviews.confirmarTitulo')}
        message={t('listReviews.confirmarMensaje')}
        confirmText={t('listReviews.confirmarSi')}
        cancelText={t('confirm.cancelar')}
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
