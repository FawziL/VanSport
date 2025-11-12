import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/resolveUrl';
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
  ProductImage,
  ActionButton,
  FavoriteButton
} from '@/components/ui/Table';

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
  const navigate = useNavigate();

  // Fetch categorías
  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.categorias
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setCategorias(items);
        console.log(items);
        setPages(Math.max(1, Math.ceil(items.length / pageSize)));
        setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
      })
      .catch(() => setError('No se pudieron cargar las categorías'))
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
      await adminService.categorias.remove(deleteId);
      setCategorias((prev) => prev.filter((c) => c.categoria_id !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
    } catch {
      setError('No se pudo eliminar la categoría');
    }
  };

  // Paginado manual
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const categoriasPage = categorias.slice(start, end);

  const toggleDestacado = async (cat) => {
    try {
      setTogglingId(cat.categoria_id);
      await adminService.categorias.partialUpdate(cat.categoria_id, { destacado: !cat.destacado });
      setCategorias((prev) =>
        prev.map((c) =>
          c.categoria_id === cat.categoria_id ? { ...c, destacado: !cat.destacado } : c
        )
      );
    } catch (e) {
      setError('No se pudo actualizar destacado');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Categorías</h1>
        <Link
          to="/admin/categorias/crear"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          + Crear Categoría
        </Link>
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
      <Table minWidth="min-w-[800px]">
        <TableHead>
          <TableHeader>ID</TableHeader>
          <TableHeader>Imagen</TableHeader>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Descripción</TableHeader>
          <TableHeader align="center">Destacar</TableHeader>
          <TableHeader align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={categoriasPage.length === 0}
          colSpan={6}
          loadingText="Cargando categorías..."
          emptyText="No hay categorías."
        >
          {categoriasPage.map((cat) => (
            <TableRow key={cat.categoria_id}>
              <TableCell>{cat.categoria_id}</TableCell>
              <TableCell>
                {cat.imagen_url ? (
                  <ProductImage 
                    src={resolveImageUrl(cat.imagen_url)}
                    alt={cat.nombre}
                    className="w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 inline-block" />
                )}
              </TableCell>
              <TableCell className="font-medium">{cat.nombre}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={cat.descripcion}>
                {cat.descripcion}
              </TableCell>
              <TableCell align="center">
                <FavoriteButton
                  isFavorite={cat.destacado}
                  onClick={() => toggleDestacado(cat)}
                  disabled={togglingId === cat.categoria_id}
                />
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/categorias/editar/${cat.categoria_id}`)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(cat.categoria_id);
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
        title="¿Estás seguro de eliminar esta categoría?"
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