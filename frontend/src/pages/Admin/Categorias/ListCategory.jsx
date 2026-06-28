import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/resolveUrl';
import { locPath } from '@/utils/localePath';
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
  ProductImage,
  ActionButton,
  FavoriteButton,
} from '@/components/ui/Table';
import { toast } from 'react-toastify';

export default function ListCategory() {
  const [categorias, setCategorias] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  // Fetch categorías
  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.categories
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setCategorias(items);
        console.log(items);
        setPages(Math.max(1, Math.ceil(items.length / pageSize)));
        setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
      })
      .catch(() => {
        setError(t('category.errorCargar'));
        toast.error(t('category.errorCargar'));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  // Actualiza páginas si cambia el tamaño
  useEffect(() => {
    setPages(Math.max(1, Math.ceil(categorias.length / pageSize)));
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(categorias.length / pageSize))));
    // eslint-disable-next-line
  }, [categorias, pageSize]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.categories.remove(deleteId);
      setCategorias((prev) => prev.filter((c) => c.id !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
      toast.success(t('category.successEliminar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('category.errorEliminar');
      setError(msg);
      toast.error(msg);
    }
  };

  // Paginado manual
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const categoriasPage = categorias.slice(start, end);

  const toggleDestacado = async (cat) => {
    try {
      setTogglingId(cat.id);

      // Actualización optimista
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === cat.id ? { ...c, isFeatured: !cat.isFeatured } : c
        )
      );

      await adminService.categories.partialUpdate(cat.id, { isFeatured: !cat.isFeatured });

      toast.success(t('category.successDestacar'));
    } catch (err) {
      // Revertir cambio en caso de error
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === cat.id ? { ...c, isFeatured: cat.isFeatured } : c
        )
      );

      const msg = err?.response?.data?.detail || t('category.errorDestacar');
      setError(msg);
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('category.titulo')}</h1>
        <Link
          to={locPath('/admin/categorias/crear')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          {t('category.crear')}
        </Link>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('category.porPagina')}
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table minWidth="min-w-[800px]">
        <TableHead>
          <TableHeader>{t('category.colId')}</TableHeader>
          <TableHeader>{t('category.colImagen')}</TableHeader>
          <TableHeader>{t('category.colNombre')}</TableHeader>
          <TableHeader>{t('category.colDescripcion')}</TableHeader>
          <TableHeader align="center">{t('category.colDestacar')}</TableHeader>
          <TableHeader align="center">{t('category.colAcciones')}</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={categoriasPage.length === 0}
          colSpan={6}
          loadingText={t('category.cargando')}
          emptyText={t('category.vacio')}
        >
          {categoriasPage.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.id}</TableCell>
              <TableCell>
                {cat.imageUrl ? (
                  <ProductImage
                    src={resolveImageUrl(cat.imageUrl)}
                    alt={cat.name}
                    className="w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 inline-block" />
                )}
              </TableCell>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={cat.description}>
                {cat.description}
              </TableCell>
              <TableCell align="center">
                <FavoriteButton
                  isFavorite={cat.isFeatured}
                  onClick={() => toggleDestacado(cat)}
                  disabled={togglingId === cat.id}
                />
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(locPath(`/admin/categorias/editar/${cat.id}`))}
                  >
                    {t('category.editar')}
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(cat.id);
                      setModalOpen(true);
                    }}
                  >
                    {t('category.eliminar')}
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
        title={t('category.confirmarTitulo')}
        message={t('category.confirmarMensaje')}
        confirmText={t('category.confirmarSi')}
        cancelText={t('category.confirmarNo')}
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
