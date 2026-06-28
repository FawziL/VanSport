import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/routes';
import { resolveImageUrl } from '@/utils/resolveUrl';
import { locPath } from '@/utils/localePath';
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
  ProductImage,
  ActionButton,
  FavoriteButton,
} from '@/components/ui/Table';
import { toast } from 'react-toastify';

export default function ListProduct() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [togglingActivoId, setTogglingActivoId] = useState(null);
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  // Fetch productos
  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.products
      .listAdmin()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setProductos(items);
        setPages(Math.max(1, Math.ceil(items.length / pageSize)));
        setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
      })
      .catch(() => {
        setError(t('listProduct.errorCargar'));
        toast.error(t('listProduct.errorCargar'));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  // Actualiza páginas si cambia el tamaño o el listado
  useEffect(() => {
    setPages(Math.max(1, Math.ceil(productos.length / pageSize)));
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(productos.length / pageSize))));
    // eslint-disable-next-line
  }, [productos, pageSize]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.products.remove(deleteId);
      setProductos((prev) => prev.filter((p) => p.productId !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
      toast.success(t('listProduct.successEliminar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('listProduct.errorEliminar');
      setError(msg);
      toast.error(msg);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const data = await adminService.products.export();
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `productos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      toast.success(t('listProduct.successExportar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('listProduct.errorExportar');
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // Paginado manual
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const productosPage = productos.slice(start, end);

  const toggleDestacado = async (p) => {
    try {
      setTogglingId(p.productId);

      // Actualización optimista
      setProductos((prev) =>
        prev.map((it) =>
          it.productId === p.productId ? { ...it, isFeatured: !p.isFeatured } : it
        )
      );

      await adminService.products.partialUpdate(p.productId, { isFeatured: !p.isFeatured });

      toast.success(t('listProduct.successDestacar'));
    } catch (err) {
      // Revertir cambio en caso de error
      setProductos((prev) =>
        prev.map((it) =>
          it.productId === p.productId ? { ...it, isFeatured: p.isFeatured } : it
        )
      );

      const msg = err?.response?.data?.detail || t('listProduct.errorDestacar');
      setError(msg);
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const toggleActivoProduct = async (p) => {
    try {
      setTogglingActivoId(p.productId);

      // Actualización optimista
      setProductos((prev) =>
        prev.map((it) => (it.productId === p.productId ? { ...it, isActive: !p.isActive } : it))
      );

      await adminService.products.partialUpdate(p.productId, { isActive: !p.isActive });

      toast.success(t('listProduct.successEstado'));
    } catch (err) {
      // Revertir cambio en caso de error
      setProductos((prev) =>
        prev.map((it) => (it.productId === p.productId ? { ...it, isActive: p.isActive } : it))
      );

      const msg = err?.response?.data?.detail || t('listProduct.errorEstado');
      setError(msg);
      toast.error(msg);
    } finally {
      setTogglingActivoId(null);
    }
  };

  // Render helpers
  const fmtPrecio = (v) => {
    if (v == null || v === '') return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(n);
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('listProduct.titulo')}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting || loading}
            title={t('listProduct.exportar')}
            className={`px-4 py-2 rounded-lg border font-bold transition-colors ${
              exporting || loading
                ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed'
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
            }`}
          >
            {exporting ? t('listProduct.exportando') : t('listProduct.exportar')}
          </button>

          <Link
            to={locPath('/admin/productos/crear')}
            className="px-4 py-2 rounded-lg bg-blue-600 !text-white font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            {t('listProduct.crear')}
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listProduct.porPagina')}
        />
      </div>

      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      <Table>
        <TableHead>
          <TableHeader>{t('listProduct.colId')}</TableHeader>
          <TableHeader>{t('listProduct.colNombre')}</TableHeader>
          <TableHeader>{t('listProduct.colCategoria')}</TableHeader>
          <TableHeader>{t('listProduct.colImagen')}</TableHeader>
          <TableHeader>{t('listProduct.colPrecio')}</TableHeader>
          <TableHeader>{t('listProduct.colStock')}</TableHeader>
          <TableHeader align="center">{t('listProduct.colDestacar')}</TableHeader>
          <TableHeader>{t('listProduct.colEstado')}</TableHeader>
          <TableHeader align="center">{t('listProduct.colAcciones')}</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={productosPage.length === 0}
          colSpan={9}
          loadingText={t('listProduct.cargando')}
          emptyText={t('listProduct.vacio')}
        >
          {productosPage.map((p) => (
            <TableRow key={p.productId}>
              <TableCell>{p.productId}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category?.name ?? '-'}</TableCell>
              <TableCell>
                <ProductImage
                  src={p.imageUrl ? resolveImageUrl(p.imageUrl) : undefined}
                  alt={p.name || t('listProduct.colNombre')}
                />
              </TableCell>
              <TableCell>{fmtPrecio(p.price)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell align="center">
                <FavoriteButton
                  isFavorite={p.isFeatured}
                  onClick={() => toggleDestacado(p)}
                  disabled={togglingId === p.productId}
                />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => toggleActivoProduct(p)}
                  disabled={togglingActivoId === p.productId}
                  className={`border rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    p.isActive
                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                  } ${togglingActivoId === p.productId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {p.isActive ? t('listProduct.activo') : t('listProduct.inactivo')}
                </button>
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(locPath(`/admin/productos/editar/${p.productId}`))}
                  >
                    {t('listProduct.editar')}
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(p.productId);
                      setModalOpen(true);
                    }}
                  >
                    {t('listProduct.eliminar')}
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      <ConfirmModal
        open={modalOpen}
        title={t('listProduct.confirmarTitulo')}
        message={t('listProduct.confirmarMensaje')}
        confirmText={t('listProduct.confirmarSi')}
        cancelText={t('listProduct.confirmarNo')}
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
