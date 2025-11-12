import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton
} from '@/components/ui/Table';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';

export default function ListPaymentMethods() {
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
    adminService.pagos
      .list({})
      .then((data) => setItems(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('No se pudieron cargar los métodos de pago'))
      .finally(() => setLoading(false));
  }, []);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));

  const toggleActivo = async (m) => {
    try {
      setTogglingId(m.id);
      await adminService.pagos.partialUpdate(m.id, { activo: !m.activo });
      setItems((prev) => prev.map((it) => (it.id === m.id ? { ...it, activo: !m.activo } : it)));
    } catch {
      setError('No se pudo actualizar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este método de pago?')) return;
    try {
      await adminService.pagos.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setError('No se pudo eliminar el método');
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Métodos de Pago</h1>
        <Link 
          to="/admin/metodos-pago/crear" 
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          + Crear Método
        </Link>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <label className="flex items-center gap-2 text-gray-700">
          Por página:
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table minWidth="min-w-[900px]">
        <TableHead>
          <TableHeader>ID</TableHeader>
          <TableHeader>Código</TableHeader>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Tipo</TableHeader>
          <TableHeader>Orden</TableHeader>
          <TableHeader align="center">Activo</TableHeader>
          <TableHeader>Actualizado</TableHeader>
          <TableHeader align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={pageItems.length === 0}
          colSpan={8}
          loadingText="Cargando métodos de pago..."
          emptyText="No hay métodos de pago."
        >
          {pageItems.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.codigo}</TableCell>
              <TableCell>{m.nombre}</TableCell>
              <TableCell>{m.tipo}</TableCell>
              <TableCell>{m.orden}</TableCell>
              <TableCell align="center">
                <button
                  onClick={() => toggleActivo(m)}
                  disabled={togglingId === m.id}
                  className={`border rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    m.activo 
                      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                  } ${togglingId === m.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {m.activo ? 'Activo' : 'Inactivo'}
                </button>
              </TableCell>
              <TableCell>
                {m.actualizado ? new Date(m.actualizado).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                }) : '-'}
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/metodos-pago/editar/${m.id}`)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => {
                      setDeleteId(m.id);
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

      <ConfirmModal
        open={modalOpen}
        title="¿Estás seguro de eliminar este método de pago?"
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