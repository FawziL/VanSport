import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import { resolveImageUrl } from '@/utils/resolveUrl';
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
  const navigate = useNavigate();

  // Fetch productos
  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.productos
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setProductos(items);
        setPages(Math.max(1, Math.ceil(items.length / pageSize)));
        setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
      })
      .catch(() => setError('No se pudieron cargar los productos'))
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
      await adminService.productos.remove(deleteId);
      setProductos((prev) => prev.filter((p) => p.producto_id !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
    } catch {
      setError('No se pudo eliminar el producto');
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const data = await adminService.productos.export();
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `productos_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError('No se pudo exportar a Excel');
      console.error(e);
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
      setTogglingId(p.producto_id);
      await adminService.productos.partialUpdate(p.producto_id, { destacado: !p.destacado });
      setProductos((prev) =>
        prev.map((it) =>
          it.producto_id === p.producto_id ? { ...it, destacado: !p.destacado } : it
        )
      );
    } catch (e) {
      setError('No se pudo actualizar destacado');
    } finally {
      setTogglingId(null);
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
        <h1 className="text-2xl font-extrabold">Productos</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting || loading}
            title="Descargar Excel de productos"
            className={`px-4 py-2 rounded-lg border font-bold transition-colors ${
              exporting || loading
                ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed'
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
            }`}
          >
            {exporting ? 'Exportando…' : 'Exportar Excel'}
          </button>
            
          <Link 
            to="/admin/productos/crear" 
           className="px-4 py-2 rounded-lg bg-blue-600 !text-white font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            + Crear producto
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
      </div>

      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      <Table>
        <TableHead>
          <TableHeader>ID</TableHeader>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Categoría</TableHeader>
          <TableHeader>Imagen</TableHeader>
          <TableHeader>Precio</TableHeader>
          <TableHeader>Stock</TableHeader>
          <TableHeader align="center">Destacar</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={productosPage.length === 0}
          colSpan={9}
          loadingText="Cargando productos..."
          emptyText="No hay productos."
        >
          {productosPage.map((p) => (
            <TableRow key={p.producto_id}>
              <TableCell>{p.producto_id}</TableCell>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>{p.categoria?.nombre ?? '-'}</TableCell>
              <TableCell>
                <ProductImage 
                  src={p.imagen_url ? resolveImageUrl(p.imagen_url) : undefined}
                  alt={p.nombre || 'Producto'}
                />
              </TableCell>
              <TableCell>{fmtPrecio(p.precio)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell align="center">
                <FavoriteButton
                  isFavorite={p.destacado}
                  onClick={() => toggleDestacado(p)}
                  disabled={togglingId === p.producto_id}
                />
              </TableCell>
              <TableCell>{p.activo ? 'Activo' : 'Inactivo'}</TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/productos/editar/${p.producto_id}`)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(p.producto_id);
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

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      <ConfirmModal
        open={modalOpen}
        title="¿Estás seguro de eliminar este producto?"
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
