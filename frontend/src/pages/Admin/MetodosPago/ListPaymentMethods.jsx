import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton,
} from '@/components/ui/Table';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'react-toastify';

export default function ListPaymentMethods() {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [togglingId, setTogglingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.paymentMethodsAdmin
      .list({})
      .then((data) => setItems(Array.isArray(data) ? data : data.results || []))
      .catch(() => {
        setError(t('listPaymentMethods.errorCargar'));
        toast.error(t('listPaymentMethods.errorCargar'));
      })
      .finally(() => setLoading(false));
  }, []);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));

  const toggleActivo = async (m) => {
    try {
      setTogglingId(m.id);

      // Actualización optimista
      setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, isActive: !m.isActive } : it)));

      await adminService.paymentMethodsAdmin.partialUpdate(m.id, { isActive: !m.isActive });

      toast.success(t('listPaymentMethods.successToggle', { action: !m.isActive ? t('listPaymentMethods.activado') : t('listPaymentMethods.desactivado') }));
    } catch (err) {
      // Revertir cambio en caso de error
      setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, isActive: m.isActive } : it)));

      const msg = err?.response?.data?.detail || t('listPaymentMethods.errorToggle');
      setError(msg);
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.paymentMethodsAdmin.remove(deleteId);
      setItems((prev) => prev.filter((it) => it.id !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
      toast.success(t('listPaymentMethods.successEliminar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('listPaymentMethods.errorEliminar');
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('listPaymentMethods.titulo')}</h1>
        <Link
          to="/admin/metodos-pago/crear"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          {t('listPaymentMethods.crear')}
        </Link>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <label className="flex items-center gap-2 text-gray-700">
          {t('listPaymentMethods.porPagina')}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table minWidth="min-w-[900px]">
        <TableHead>
          <TableHeader>{t('listPaymentMethods.colId')}</TableHeader>
          <TableHeader>{t('listPaymentMethods.colCodigo')}</TableHeader>
          <TableHeader>{t('listPaymentMethods.colNombre')}</TableHeader>
          <TableHeader>{t('listPaymentMethods.colTipo')}</TableHeader>
          <TableHeader>{t('listPaymentMethods.colOrden')}</TableHeader>
          <TableHeader align="center">{t('listPaymentMethods.colActivo')}</TableHeader>
          <TableHeader>{t('listPaymentMethods.colActualizado')}</TableHeader>
          <TableHeader align="center">{t('listPaymentMethods.colAcciones')}</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={8}
          loadingText={t('listPaymentMethods.cargando')}
          emptyText={t('listPaymentMethods.vacio')}
        >
          {pageItems.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.code}</TableCell>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.type}</TableCell>
              <TableCell>{m.sortOrder}</TableCell>
              <TableCell align="center">
                <button
                  onClick={() => toggleActivo(m)}
                  disabled={togglingId === m.id}
                  className={`border rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    m.isActive
                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                  } ${togglingId === m.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {m.isActive ? t('listPaymentMethods.activo') : t('listPaymentMethods.inactivo')}
                </button>
              </TableCell>
              <TableCell>
                {m.updatedAt
                  ? new Date(m.updatedAt).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '-'}
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/metodos-pago/editar/${m.id}`)}
                  >
                    {t('listPaymentMethods.editar')}
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(m.id);
                      setModalOpen(true);
                    }}
                  >
                    {t('listPaymentMethods.eliminar')}
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      <ConfirmModal
        open={modalOpen}
        title={t('listPaymentMethods.confirmarTitulo')}
        message={t('listPaymentMethods.confirmarMensaje')}
        confirmText={t('listPaymentMethods.confirmarSi')}
        cancelText={t('listPaymentMethods.confirmarNo')}
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
